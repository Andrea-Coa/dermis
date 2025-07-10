import boto3
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError, BotoCoreError
import json


STACK_NAME = "dermis-storage-v1"
TEMPLATE_FILE = "templates_storage/new-template-final.json"  # Save your JSON template in this file
REGION = "us-east-1"  # Change to your region

def load_template(file_path):
    try:
        with open(file_path, 'r') as f:
            template_body = f.read()
        # Optional: validate it parses
        json.loads(template_body)
        return template_body
    except FileNotFoundError:
        print(f"❌ Error: Template file '{file_path}' not found.")
        exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON - {e}")
        exit(1)

def deploy_stack(template_body):
    cf = boto3.client("cloudformation", region_name=REGION)

    try:
        # Check if stack exists
        cf.describe_stacks(StackName=STACK_NAME)
        stack_exists = True
    except ClientError as e:
        if "does not exist" in str(e):
            stack_exists = False
        else:
            print(f"❌ Error checking stack: {e}")
            exit(1)

    try:
        if stack_exists:
            print(f"🔁 Updating stack '{STACK_NAME}'...")
            response = cf.update_stack(
                StackName=STACK_NAME,
                TemplateBody=template_body,
                Capabilities=["CAPABILITY_NAMED_IAM"]
            )
        else:
            print(f"🚀 Creating stack '{STACK_NAME}'...")
            response = cf.create_stack(
                StackName=STACK_NAME,
                TemplateBody=template_body,
                Capabilities=["CAPABILITY_NAMED_IAM"]
            )

        print(f"✅ Stack operation started. Stack ID:\n{response['StackId']}")

    except ClientError as e:
        if "No updates are to be performed" in str(e):
            print("ℹ️ No changes detected. Stack is already up to date.")
        else:
            print(f"❌ Stack operation failed:\n{e}")
            exit(1)

if __name__ == "__main__":
    print("📦 Loading CloudFormation template...")
    template = load_template(TEMPLATE_FILE)
    deploy_stack(template)