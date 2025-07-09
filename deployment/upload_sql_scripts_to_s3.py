import boto3
import json
import os

# --- Config ---
bucket_name = "dermiscreationfiles"
region = "us-east-1"
init_path = "D:/Documents-D/Projects/dpd/backend/scripts/init.sql"
schema_path = "D:/Documents-D/Projects/dpd/backend/scripts/schema.sql"
template_path = "new-template.json"       # Input template with placeholders
output_path = "new-template-final.json"   # Output filled-in template

# --- Object keys in S3 ---
init_key = "init.sql"
schema_key = "schema.sql"

# --- Create S3 client ---
s3 = boto3.client("s3", region_name=region)

# --- Create bucket if it doesn't exist ---
try:
    if region == "us-east-1":
        s3.create_bucket(Bucket=bucket_name)
    else:
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={"LocationConstraint": region}
        )
    print(f"✅ Bucket '{bucket_name}' created.")
except s3.exceptions.BucketAlreadyOwnedByYou:
    print(f"⚠️ Bucket '{bucket_name}' already exists and is owned by you.")
except s3.exceptions.BucketAlreadyExists:
    print(f"❌ Bucket '{bucket_name}' already exists and may be owned by someone else.")
except Exception as e:
    print(f"❌ Error creating bucket: {e}")

# --- Upload init.sql ---
try:
    s3.upload_file(init_path, bucket_name, init_key)
    print(f"✅ Uploaded '{init_path}' to '{bucket_name}/{init_key}'")
except Exception as e:
    print(f"❌ Error uploading init.sql: {e}")

# --- Upload schema.sql ---
try:
    s3.upload_file(schema_path, bucket_name, schema_key)
    print(f"✅ Uploaded '{schema_path}' to '{bucket_name}/{schema_key}'")
except Exception as e:
    print(f"❌ Error uploading schema.sql: {e}")

# --- Generate presigned URLs ---
try:
    init_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket_name, "Key": init_key},
        ExpiresIn=3600
    )
    schema_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket_name, "Key": schema_key},
        ExpiresIn=3600
    )
    print("✅ Presigned URLs generated.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to generate presigned URLs: {e}")

# --- Load template and replace placeholders ---
with open(template_path, "r", encoding="utf-8") as f:
    template = json.load(f)

def replace_placeholders(obj):
    if isinstance(obj, dict):
        return {k: replace_placeholders(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_placeholders(v) for v in obj]
    elif isinstance(obj, str):
        obj = obj.replace("{{INIT_SCRIPT_URL}}", init_url)
        obj = obj.replace("{{SCHEMA_SCRIPT_URL}}", schema_url)
        return obj
    return obj

updated_template = replace_placeholders(template)

# --- Save final updated template ---
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(updated_template, f, indent=2)

print(f"✅ Final template saved to '{output_path}'")
