from flask import Flask, request, jsonify
#from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import numpy as np
from PIL import Image
import torch
from torchvision import transforms
import joblib
import sklearn
import io
import pickle


app = Flask(__name__)
""""
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'postgresql://dermis_admin:jacdermisapp@dermis-db.c52oecg2k40k.us-east-1.rds.amazonaws.com:5432/dermis-db'
)
"""

CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],  
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/analyze-skin/cnn', methods=['POST'])
def analyze_skin_cnn():
    model = joblib.load('cnn_model.pkl')
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image_file = request.files['image']
    
    #corregir logica clase residual. mixted./
    try:
        image = Image.open(io.BytesIO(image_file.read()))
        image = image.convert('RGB') 
        image = image.resize((224, 224))  
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)  
        prediction = model.predict(img_array)
        class_names = ['oily', 'dry'] 
        print(prediction)
        predicted_class = class_names[np.argmax(prediction)]
        if np.argmax(prediction) <= 0.55:
            predicted_class ="mixed"
        
        return jsonify({
            "status": "success",
            "skin_type": predicted_class,
            "confidence": float(np.max(prediction))
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/analyze-skin/logistic_regression_v1', methods=['POST'])
def analyze_skin_efficientnet():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image_file = request.files['image']
    try:


        # Transformación con augmentation
        aug_transform = transforms.Compose([
            transforms.RandomResizedCrop(224, scale=(0.9, 1.0)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.02),
            transforms.GaussianBlur(kernel_size=(3, 3), sigma=(0.1, 1.0)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                [0.229, 0.224, 0.225])
        ])
        
        image = Image.open(io.BytesIO(image_file.read()))
        image = image.convert('RGB') 
        image = image.resize((224, 224))
        image = aug_transform(image)
        #no need more to_tensor = transforms.ToTensor()
        #image = to_tensor(image)
        
        #simple_transform = joblib.load('simple_transform.pkl')
        image = image.unsqueeze(0)
        feature_extractor = joblib.load("feature_extractor.pkl")
        with torch.no_grad():
            feats = feature_extractor(image)
        feats = feats.cpu().numpy().squeeze(0)


        
        model_loaded = joblib.load("logistic_regression_v1.pkl")
       # x_new = preprocess_image_for_classical_model(image_path)
        y_pred = model_loaded.predict([feats])[0]
        classes = ['papules', 'black_head', 'white_head', 'acne_scar', 'wrinkle', 'stains','freckle', 'nodules', 'dark_circle', 'pustules', 'skinredness','vascular', 'dark_spot', 'eye_bag']
        labels_predichas = [classes[i] for i, val in enumerate(y_pred) if val ==1]
#espacio
        
        return jsonify({
            "status": "success",
            "skin_conditions": labels_predichas,
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
