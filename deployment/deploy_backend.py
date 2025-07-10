import boto3
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError, BotoCoreError

template_path = "templates_backend/new-template.json"
stack_name = "dermis-backend-v1"
load_dotenv()

# Retrieve the ARN from .env
labrole_arn = os.getenv("LABROLE_ARN")
if not labrole_arn:
    raise ValueError("❌ LABROLE_ARN not found in .env file")

cf = boto3.client('cloudformation', region_name='us-east-1')


try:
    with open(template_path) as f:
        template_body = f.read()
except FileNotFoundError:
    raise FileNotFoundError("❌ Could not find 'template.json' file")

try:
    response = cf.create_stack(
        StackName=stack_name,
        TemplateBody=template_body,
        Parameters=[
            {
                'ParameterKey': 'LambdaExecutionRoleArn',
                'ParameterValue': labrole_arn
            }
        ],
        Capabilities=['CAPABILITY_NAMED_IAM'],
        OnFailure='ROLLBACK'
    )
    print(f"✅ Stack creation initiated: {response['StackId']}")

except ClientError as e:
    if "AlreadyExistsException" in str(e):
        print("⚠️ Stack already exists. Consider using update_stack() instead.")
    else:
        print(f"❌ AWS ClientError: {e.response['Error']['Message']}")
except BotoCoreError as e:
    print(f"❌ BotoCoreError: {str(e)}")
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")
