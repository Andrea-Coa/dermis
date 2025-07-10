import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the secret value
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env or environment")

db_host = os.getenv("POSTGRES_DB_HOST")
if not db_host:
    raise ValueError("POSTGRES_DB_HOST is not set in .env or environment")

db_port = os.getenv("POSTGRES_DB_PORT", "5432")  # Default to 5432 if not set

db_name = os.getenv("POSTGRES_DB_NAME")
if not db_name:
    raise ValueError("POSTGRES_DB_NAME is not set in .env or environment")

db_user = os.getenv("POSTGRES_DB_USER")
if not db_user:
    raise ValueError("POSTGRES_DB_USER is not set in .env or environment")

db_password = os.getenv("POSTGRES_DB_PASSWORD")
if not db_password:
    raise ValueError("POSTGRES_DB_PASSWORD is not set in .env or environment")

# Create the secret
client = boto3.client("secretsmanager", region_name="us-east-1")

response_key = client.create_secret(
    Name="dermis/gemini",
    Description="Gemini API KEY for LLM integration.",
    SecretString=json.dumps({
        "GEMINI_API_KEY": api_key
    })
)

print(f"✅ Secret 1 created: {response_key['ARN']}")

response_dbconfig = client.create_secret(
    Name="dermis/dbconfig",
    Description="DB user credentials",
    SecretString=json.dumps({
        "POSTGRES_DB_HOST": db_host,
        "POSTGRES_DB_PORT": db_port,
        "POSTGRES_DB_NAME": db_name,
        "POSTGRES_DB_USER": db_user,
        "POSTGRES_DB_PASSWORD": db_password
    })
)

print(f"✅ Secret 2 created: {response_dbconfig['ARN']}")
