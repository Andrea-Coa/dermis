import pandas as pd
import json
import requests

# MANDAR BOOK PRODUCTS DONDE NO ESTÉN NULOS :)

df = pd.read_json("book_products_ingredients_v2.json", orient='records')
api_endpoint = "https://02lm63g3ge.execute-api.us-east-1.amazonaws.com/products_book"

def send_batch(df, endpoint_url):
    """
    Sends a single batch of products from a dataframe to the Lambda endpoint.

    Args:
        df (pd.DataFrame): Must contain 'skin_type', 'product_type', 'product_name', 'ingredients_es_cleaned'.
        endpoint_url (str): URL of the Lambda endpoint.
    """
    # Rename and format columns to match Lambda's expected keys
    products = df.rename(columns={
        'product_name': 'name',
        'skin_type': 'skyn_type4',
        'ingredients_es_cleaned': 'ingredients'
    })[['name', 'skyn_type4', 'ingredients', 'product_type']]

    # Convert to list of dictionaries
    payload = products.to_dict(orient='records')

    # Send to Lambda
    try:
        response = requests.post(
            endpoint_url,
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload)
        )
        print(f"Status: {response.status_code}")
        print("Response:", response.text)
    except Exception as e:
        print("Error sending batch:", str(e))


send_batch(df[df.notna()], api_endpoint)