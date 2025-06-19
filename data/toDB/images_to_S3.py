import boto3
import os
from pathlib import Path

# === Configuration ===
BUCKET_NAME = "bucketdermis"  # Replace with your bucket name
LOCAL_DIR = "../scraping/data/product_images"  # Path to your local directory
S3_PREFIX = "scraped_products/"  # Target directory inside S3

# Create an S3 client
s3 = boto3.client("s3")

# Get all files from local dir
local_path = Path(LOCAL_DIR)
if not local_path.exists():
    raise Exception(f"Directory {LOCAL_DIR} does not exist")

# Upload each file
for file_path in local_path.glob("*"):
    if file_path.is_file():
        file_name = file_path.name
        s3_key = f"{S3_PREFIX}{file_name}"

        print(f"Uploading {file_name} to s3://{BUCKET_NAME}/{s3_key}")
        s3.upload_file(
            Filename=str(file_path),
            Bucket=BUCKET_NAME,
            Key=s3_key
        )

print("✅ All files uploaded successfully.")
