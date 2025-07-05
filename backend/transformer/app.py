from flask import Flask, request, jsonify
from flask_cors import CORS  
import requests
import pandas as pd
import pickle
app = Flask(__name__)
CORS(app)  

import torch
import torch.nn as nn
import torch.optim as optim
from transformers import BertTokenizer, BertModel
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer
from collections import defaultdict
import requests
import json
import pandas as pd
import pickle


#consolidar transformer
class SkincareTransformer(nn.Module):
    def __init__(self, num_classes, d_model=256, nhead=8, num_layers=6):
        super(SkincareTransformer, self).__init__()
        #que tanto combiene + o - el num_embedings
        self.ingredient_embedding = nn.Embedding(num_embeddings=10000, embedding_dim=d_model)
        #print("ingredient_embeding: ", self.ingredient_embedding)
        encoder_layers = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layers, num_layers=num_layers)
        self.classifier = nn.Linear(d_model, num_classes)
        self.layer_norm = nn.LayerNorm(d_model)

    def forward(self, x):
        x = self.ingredient_embedding(x)
        x = self.layer_norm(x)
        x = x.permute(1, 0, 2)
        x = self.transformer_encoder(x)
        x = x[0, :, :]
        logits = self.classifier(x)
        return logits
    


#que ingredientes llegan aqui, los del grafo los q sale de condiciones

def preprocess_ingredients(products):
    print(products[1])
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    all_ingredients = set()

    for product in products:
        for ing in product['ingredients']:
            ing_clean = ing.lower().strip() #minusculas cada ingrediente 
            tokens = tokenizer.tokenize(ing_clean) 
            all_ingredients.update(tokens)#en updat aumentamos
    ingredient_to_idx = {ing: idx+1 for idx, ing in enumerate(all_ingredients)}
    print("preprocess_oiongredietns output, (tokenizer a cada ing de cada prod): ", ingredient_to_idx.items()) #hopefully return items
    return ingredient_to_idx

#aqui ya se estaba imprimiendo, no
def vectorize_products(products, ingredient_to_idx, max_len=200):
    #vectorizando
    vectors = []
    for product in products:
        ing_indices = []
        for ing in product['ingredients']:#aun tratamos con los ingredientes crudos sin tokenizer
            tokens = tokenizer.tokenize(ing.lower().strip())
            ing_indices.extend([ingredient_to_idx.get(t, 0) for t in tokens])
            print("ingrediente: ", ing, " :  ", tokens)
        if len(ing_indices) > max_len: #perdida de ingredintes ?
            ing_indices = ing_indices[:max_len]
        else:
            ing_indices += [0] * (max_len - len(ing_indices)) 
        vectors.append(ing_indices)
    return torch.tensor(vectors)




class SkincareRecommender:
    def __init__(self, dermatologist_routine):
        self.routine = dermatologist_routine
        self.models = {}
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.ingredient_to_idx = {}
        self.max_len = 100
        self._initialize_ingredient_mapping(dermatologist_routine['approved_products'])

    def _initialize_ingredient_mapping(self, approved_products): #approved son los del libro
        all_ingredients = set()

        for category, products in approved_products.items(): #categoria del libro
        
            for product in products:
                for ing in product['ingredients']:
                    ing_clean = ing.lower().strip()
                    tokens = self.tokenizer.tokenize(ing_clean)
                    all_ingredients.update(tokens) #otro preprocesamiento  coomo en def preprocess

        self.ingredient_to_idx = {ing: idx+1 for idx, ing in enumerate(all_ingredients)}

    def _prepare_data(self, products):
        X = []
        y = []

        for product in products:
            ing_indices = []
            for ing in product['ingredients']:
                tokens = self.tokenizer.tokenize(ing.lower().strip())
                ing_indices.extend([self.ingredient_to_idx.get(t, 0) for t in tokens])

            if len(ing_indices) > self.max_len:
                ing_indices = ing_indices[:self.max_len]
            else:
                ing_indices += [0] * (self.max_len - len(ing_indices))

            X.append(ing_indices)
            y.append(1.0) #pq append 1.0

        return torch.tensor(X, dtype=torch.long), torch.tensor(y, dtype=torch.float32).unsqueeze(1)

    def _vectorize_product(self, product): #dif entre prepare data y vecto y las dos defs antes de la clase 
        ing_indices = []
        for ing in product['ingredients']:
            tokens = self.tokenizer.tokenize(ing.lower().strip())
            ing_indices.extend([self.ingredient_to_idx.get(t, 0) for t in tokens])

        if len(ing_indices) > self.max_len:
            ing_indices = ing_indices[:self.max_len]
        else:
            ing_indices += [0] * (self.max_len - len(ing_indices))

        return torch.tensor([ing_indices], dtype=torch.long)

    def train(self, approved_products):
        for category, products in approved_products.items():
            X, y = self._prepare_data(products) #los del libiro pasa a tokenizarse
            model = SkincareTransformer(num_classes=1, d_model=128) #que significa num_clases 1?
            criterion = nn.BCEWithLogitsLoss(pos_weight=torch.tensor([2.0]))
            optimizer = optim.Adam(model.parameters(), lr=1e-4)
            for epoch in range(10):
                outputs = model(X)
                loss = criterion(outputs, y)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                print(f"Category {category}, Epoch {epoch}, Loss: {loss.item()}")

            self.models[category] = model

    def recommend(self, input_products): #aqui es la webada pq retorna vació? tenemos que forzar q retorne 1 por cadetogria, asi sea una similitud baja, no puede ser em,pmty
        recommendations = defaultdict(list)

        for product in input_products: #los deel grafo ?
            X = self._vectorize_product(product)

            for category, model in self.models.items():
                if category in self.routine['steps']: #si esta en los pasos de este tipo de piel
                    with torch.no_grad():
                        score = torch.sigmoid(model(X)).item()
                    recommendations[category].append((product, score)) #ok añade con score no discrimina
        final_recommendations = {}

        #aqui armamos la recomendacion, podemos recolectar más de un prod por categoria y solo retornar el primero
        #luego tener planes B
        for category, candidates in recommendations.items():
            if candidates:
                candidates.sort(key=lambda x: x[1], reverse=True)
                print(candidates)
                final_recommendations[category] = candidates[0][0]

        return final_recommendations
    



LAMBDA_GET_URL = "https://02lm63g3ge.execute-api.us-east-1.amazonaws.com/products_book"  # Cambia 'prod' por tu stage

def query_products_by_skyn_type(skyn_type):
    params = {'skyn_type4': skyn_type}
    
    try:
        response = requests.get(
            LAMBDA_GET_URL,
            params=params,  # Los parámetros se añaden a la URL como ?skyn_type4=value
            timeout=20
        )
        
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Consulta exitosa para skyn_type: {skyn_type}")
        print(f"Total productos encontrados: {sum(len(v) for v in data['data'].values())}")
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en la consulta: {str(e)}")
        return None


df = pd.read_csv("cleaned_products.csv")
def get_ingredients_and_products_for_condition(G, condition, df):
        """
        Input:
        - G: networkx.Graph
        - condition: str
        Recibe un grafo y una condición de la piel. Retorna 2 sets:
        - ingredients: set de ingredientes para tratar la condición específicada, según las fichas técnicas.
        - products: nombres de productos de skincare scrapeados de internet
        Si la condición especificada no existe, retorna dos sets vacíos.
        """
        if condition not in G:
            return set(), set()

        ingredients = set()
        products = set()
        input_products =[]
        for ingredient in G.neighbors(condition):
            ingredients.add(ingredient)
            for product in G.neighbors(ingredient):
                if G.nodes[product].get("type") == "product":
                    products.add(product)
                    #al dicc
                    ing = []
                    for i, ings in enumerate(df["composition_list_standard"]):
                        if df["title"][i] == product:
                            ing = ings
                    dicc={'name': product, 'ingredients': ing}
                    input_products.append(dicc)

        
        return input_products

    #recordar q esto evalua solo una condicion
def get_ingredients_by_condition(G, condition, df):

        if condition not in G:
            return set(), set()

        ingredients = set()
        for ingredient in G.neighbors(condition):
            ingredients.add(ingredient)        
        return ingredients
    
#DEFINIENDO GRAFOOO 
graph = pickle.load(open("skincare_graph.pkl", "rb"))

#for now
#oily sensitive pigmented wrinkled OSPW
steps_by_type = {  #"anti_inflammatory"
    "ospw": ["cleansers", "eye_creams","skin_lightenerv", "sunscreens", "serums" , "moisturizers"],
    "ospt":["cleansers", "toners", "skin_lightener", "acne_treatments", "eye_creams", "sunscreens"],  #benzoyl peroxide
    "dspw": ["cleansers", "facial_waters",  "skin_lightener", "moisturizers", "sunscreens"],#antioxidant
    "drnt":["cleansers", "eye_creams", "sunscreens", "moisturizers"],
    "osnw":["cleansers", "serums", "oil_control_products","acne_treatments", "sunscreens"], #antiimflamatory
    "osnt":["cleansers", "sunscreens", "oil_control_products"],
    "orpw":["oil_control_products", "toners", "skin_lightener","sunscreens", "moisturizers", "wrinkle_prevention"],
    "orpt":["cleansers", "toners", "sunscreens","skin_lightener" ] ,#retinol
    "ornw": ["cleansers", "toners", "wrinkle_prevention", "facial_waters"] ,#retinol
    "ornt":["cleansers", "oil_control_products", "sunscreens"] ,#retinol
    "dspt":["cleansers", "facial_waters", "eye_creams", "skin_lightener", "moisturizers", "eye_cream"],
    "dsnw": ["cleansers", "moisturizers", "skin_lightener", "dark_spot_treatments", "sunscreens" , "eye_creams"],
    "dsnt":["cleansers", "eye_creams", "facial_waters", "sunscreens" , "moisturizers"],#anti imflamatory
    "drpw" :["cleansers", "eye_creams", "moisturizers", "serums","moisturizers_night" , "sunscreens"],#sunscreens
    "drpt" :[ "cleansers", "facial_waters", "moisturizers", "sunscreens",  "skin_lightener", "eye_creams"],
    "drnw": ["cleansers", "antioxidant_serums","moisturizers", "eye_creams", "sunscreens"]
}


#para inputar las skip conecctions necesitamos los ingredientes q hagan referencia a retino y a los que da de putput el grafo

#CASOS RESIDUALES INGREDIENTES GENERALES: tener en cuenta tipe de nombres y estructura de ellos en las tablas guardadas de book y scrape
skin_general_health = [
    "glicerina",
    "hialuronato de sodio",
    "dexpantenol",
    "ethylhexylglycerin",
    "dimeticona",
    "tocoferol",
    "alfa tocoferol acetato",
    "ascorbil palmitato",
    "carbómero",
    "goma xantana",
    "fenoxietanol",
    "potasio sorbato y ácido sórbico",
    "benzoato de sodio",
    "edta disódico"
]

def procesar_skin_data(skyn_type, conditions, is_sensitive):
    compuest_type = ""
    #primer criterio o d
    if skyn_type == "dry":
        compuest_type += "d"
    else: #oily o mixed
        compuest_type += "d"
    #segundo criterio sensitive
    if is_sensitive =="true":
        compuest_type += "s"
    else: #no es sensible
        compuest_type += "r" #es resistente
    #tercer criterri y 4to salen de condiciones
    if "freckle" in conditions   or "skinredness" in conditions:
        compuest_type += "p" #pigmented
    else:
        compuest_type += "n" #no pigmentee
    
    if "wrinke" in conditions:
        compuest_type += "w" #tiene arrugas
    else:
        compuest_type += "t" #tight
    
    skin_type = compuest_type

    result = query_products_by_skyn_type(skin_type)
    #del api
    products_yes = result['data']
    #en el manejo de products_yes

    #condicionar los que necesitan retinol
    dosis_retinol = ["orpt", "ornt", "ornw"]
    if skin_type in dosis_retinol:
        #agregar a ingredientes de entrenamiento
        for k,v in products_yes.items():
            #v
            for p in v:
                v["ingredients"].append("retinol")
                v["ingredients"].append("retynol")
        #crear una cat
        retinol = [{'name': 'name', 'ingredients':['retinol', 'retynol']}]
        products_yes['retinol'] = retinol
        steps_by_type[skin_type].append('retinol')
    

    #ahora skip_conection de los ingredients de las condiciones
    #los tengo como parametro en esta funcion, conditions
    for c in conditions:
        if c=="acne_scar":
            steps_by_type[skin_type].append("acne_treatments")

        ings  = get_ingredients_by_condition(graph, c, df)
        c_input = [{'name': 'name', 'ingredients':ings}]
        products_yes[c] =c_input
        steps_by_type[skin_type].append(c)

        #for i in range(10):
        #    products_yes[c].append(c_input)

    if len(conditions) <=1:
        #robustes añadir tratamiento general
        g_input = [{'name': 'name', 'ingredients':skin_general_health}]
        products_yes['subsanamiento'] = g_input
        steps_by_type[skin_type].append("general")


    dermatologist_routine = {
        'skin_type' : skin_type, 
        'steps': steps_by_type[skin_type],
        'approved_products':
            products_yes
    }

    recommender = SkincareRecommender(dermatologist_routine)
    #para reentrenar
    recommender.train(dermatologist_routine['approved_products'])


#INFERENCIA

    #mecesito un dicc con name e ingredientes
    ip =[]
    for c in conditions:
        input_products = get_ingredients_and_products_for_condition(graph, c, df)
        for i in input_products:
            ip.append(i)
    inference = recommender.recommend(ip)
    return inference


    
   
    #return skin_type

@app.route('/preprocesar', methods=['POST'])
def preprocesar():
    content = request.get_json()

    skyn_type = content.get('skyn_type')
    conditions = content.get('conditions', [])
    is_sensible = content.get('is_sensitive', False)

    resultado = procesar_skin_data(skyn_type, conditions, is_sensible)
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(host='172.20.10.3', port=5001, debug=True)


