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

class SkincareTransformer(nn.Module):
    def __init__(self, num_classes, d_model=256, nhead=8, num_layers=6):
        super(SkincareTransformer, self).__init__()
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
    



def preprocess_ingredients(products):
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    all_ingredients = set()

    for product in products:
        for ing in product['ingredients']:
            ing_clean = ing.lower().strip()
            tokens = tokenizer.tokenize(ing_clean)
            all_ingredients.update(tokens)
    ingredient_to_idx = {ing: idx+1 for idx, ing in enumerate(all_ingredients)}
    return ingredient_to_idx





def vectorize_products(products, ingredient_to_idx, max_len=100):
    vectors = []
    for product in products:
        ing_indices = []
        for ing in product['ingredients']:
            tokens = tokenizer.tokenize(ing.lower().strip())
            ing_indices.extend([ingredient_to_idx.get(t, 0) for t in tokens])
            print("ingrediente: ", ing, " :  ", tokens)
        if len(ing_indices) > max_len:
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

    def _initialize_ingredient_mapping(self, approved_products):
        all_ingredients = set()

        for category, products in approved_products.items():
            for product in products:
                for ing in product['ingredients']:
                    ing_clean = ing.lower().strip()
                    tokens = self.tokenizer.tokenize(ing_clean)
                    all_ingredients.update(tokens)

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
            y.append(1.0)

        return torch.tensor(X, dtype=torch.long), torch.tensor(y, dtype=torch.float32).unsqueeze(1)

    def _vectorize_product(self, product):
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
            X, y = self._prepare_data(products)
            model = SkincareTransformer(num_classes=1, d_model=128)
            criterion = nn.BCEWithLogitsLoss(pos_weight=torch.tensor([2.0]))
            optimizer = optim.Adam(model.parameters(), lr=1e-4)
            for epoch in range(5):
                outputs = model(X)
                loss = criterion(outputs, y)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                print(f"Category {category}, Epoch {epoch}, Loss: {loss.item()}")

            self.models[category] = model

    def recommend(self, input_products):
        recommendations = defaultdict(list)

        for product in input_products:
            X = self._vectorize_product(product)

            for category, model in self.models.items():
                if category in self.routine['steps']:
                    with torch.no_grad():
                        score = torch.sigmoid(model(X)).item()
                    recommendations[category].append((product, score))
        final_recommendations = {}

        #aqui armamos la recomendacion, podemos recolectar más de un prod por categoria y solo retornar el primero
        #luego tener planes B
        for category, candidates in recommendations.items():
            if candidates:
                candidates.sort(key=lambda x: x[1], reverse=True)
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

"""
if __name__ == "__main__":
    # Consultar productos para un tipo de piel específico
    skyn_type_to_query = "drnt"  # Cambia por el tipo que necesites (oily, dry, sensitive, etc.)
    result = query_products_by_skyn_type(skyn_type_to_query)
    
    if result:
        # Mostrar los primeros 3 productos de cada tipo
        for product_type, products in result['data'].items():
            print(f"\n📦 {product_type.upper()} ({len(products)} productos):")
            for product in products[:3]:  # Mostrar solo 3 por categoría
                print(f"  - {product['name']}")
                print(f"    Ingredientes: {', '.join(product['ingredients'][:3])}...") 


dermatologist_routine = {
    'skin_type': 'dry',
    'steps': ['cleanser', 'moisturizer'],
    'approved_products': {
        'cleanser': [
            {'name': 'CeraVe', 'ingredients': ['ceramides', 'hyaluronic acid']},
            {'name': 'Cetaphil', 'ingredients': ['glycerin', 'niacinamide']}
        ],
        'moisturizer': [
            {'name': 'Vanicream', 'ingredients': ['glycerin', 'squalane']},
            {'name': 'Eucerin', 'ingredients': ['urea', 'ceramides']}
        ]
    }
}

"""

#for now
#oily sensitive pigmented wrinkled OSPW
steps_by_type = {
    "ospw": ["cleansers", "eye_creams","skin_lightenerv", "sunscreens", "serums" , "moisturizers"],
    "ospt":["cleansers", "toners", "skin_lightener", "acne_treatments", "eye_creams", "sunscreens"],
    "dspw": ["cleansers", "facial_waters",  "skin_lightener", "moisturizers", "sunscreens"],
    "drnt":["cleansers", "eye_creams", "sunscreens", "moisturizers"]

}


skin_type = 'drnt'
result = query_products_by_skyn_type(skin_type)
#del api
products_yes = result['data']

dermatologist_routine = {
    'skin_type' : skin_type, 
    'steps': steps_by_type[skin_type],
    'approved_products':
        products_yes
    



}



#recommender = SkincareRecommender(dermatologist_routine)
#para reentrenar
#recommender.train(dermatologist_routine['approved_products'])


# Guardas la instancia entera
#with open("transformer1.pkl", "wb") as f:
 #   pickle.dump(recommender, f)

#open
with open("transformer1.pkl", "rb") as f:
    recommender = pickle.load( f)

graph = pickle.load(open("skincare_graph.pkl", "rb"))
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

#INFERENCIA
condition = "acne_scar"
#mecesito un dicc con name e ingredientes
input_products = get_ingredients_and_products_for_condition(graph, condition, df)
inference = recommender.recommend(input_products)

for category, product in inference.items():
    print(f"{category}: {product['name']}")