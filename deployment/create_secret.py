import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the secret value
username = os.getenv("TEMP_USERNAME")
if not username:
    raise ValueError("TEMP_USERNAME is not set in .env or environment")

# Create the secret
client = boto3.client("secretsmanager", region_name="us-east-1")

response = client.create_secret(
    Name="dermis/test-secret3",
    Description="Test credentials. again.",
    SecretString=json.dumps({
        "USERNAME": username
    })
)

print(f"✅ Secret created: {response['ARN']}")
