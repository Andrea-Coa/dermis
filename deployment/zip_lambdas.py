import os
import zipfile
import boto3
from botocore.exceptions import ClientError

# --- Config ---
region = "us-east-1"
bucket_name = "dermiscreationfiles"
lambdas_dir = "lambdas"  # This folder contains subfolders like login_users_dermis
s3_prefix = "lambdas/"   # Optional: S3 folder prefix

# --- Create S3 client ---
s3 = boto3.client("s3", region_name=region)

# --- Create the bucket if it doesn't exist ---
try:
    s3.head_bucket(Bucket=bucket_name)
    print(f"⚠️ Bucket '{bucket_name}' already exists.")
except ClientError as e:
    error_code = int(e.response['Error']['Code'])
    if error_code == 404:
        try:
            if region == "us-east-1":
                s3.create_bucket(Bucket=bucket_name)
            else:
                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={"LocationConstraint": region}
                )
            print(f"✅ Bucket '{bucket_name}' created.")
        except Exception as ce:
            print(f"❌ Failed to create bucket: {ce}")
            exit(1)
    else:
        print(f"❌ Error checking bucket: {e}")
        exit(1)

# --- Helper: Zip contents of a folder without including the folder itself ---
def zip_lambda_folder(folder_path, output_zip_path):
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, folder_path)
                zipf.write(full_path, rel_path)

# --- Process each Lambda folder ---
for folder_name in os.listdir(lambdas_dir):
    folder_path = os.path.join(lambdas_dir, folder_name)
    if os.path.isdir(folder_path):
        zip_name = f"{folder_name}.zip"
        zip_path = os.path.join("zipped_lambdas", zip_name)
        
        # Ensure output directory exists
        os.makedirs("zipped_lambdas", exist_ok=True)

        print(f"🔄 Zipping '{folder_path}' to '{zip_path}'...")
        try:
            zip_lambda_folder(folder_path, zip_path)
            print(f"✅ Zipped '{folder_name}'")
        except Exception as e:
            print(f"❌ Error zipping '{folder_name}': {e}")
            continue

        # Upload to S3
        s3_key = f"{s3_prefix}{zip_name}"
        print(f"⬆️ Uploading '{zip_path}' to S3 bucket '{bucket_name}' as '{s3_key}'...")
        try:
            s3.upload_file(zip_path, bucket_name, s3_key)
            print(f"✅ Uploaded '{zip_name}' to S3.")
        except Exception as e:
            print(f"❌ Failed to upload '{zip_name}' to S3: {e}")
