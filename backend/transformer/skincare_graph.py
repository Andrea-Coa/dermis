import pickle

# cargar grafo
graph = pickle.load(open("skincare_graph.pkl", "rb"))

# Query
def get_ingredients_and_products_for_condition(G, condition):
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
    for ingredient in G.neighbors(condition):
        ingredients.add(ingredient)
        for product in G.neighbors(ingredient):
            if G.nodes[product].get("type") == "product":
                products.add(product)
    return products



#recordar q esto evalua solo una condicion

print(get_ingredients_and_products_for_condition(graph,"dark_spot" ))