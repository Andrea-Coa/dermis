from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
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


"""
db = SQLAlchemy(app)


routine_products = db.Table('routine_products',
    db.Column('routine_id', db.Integer, db.ForeignKey('routine.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True),
    db.Column('order', db.Integer)  # Opcional: para mantener el orden de aplicación de productos
)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(80), nullable=False)
    price = db.Column(db.Float, nullable=False)
    #tlp
    function = db.Column(db.String(30))

class Routine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Relación many-to-many con Product
    products = db.relationship('Product', secondary=routine_products, backref=db.backref('routines', lazy=True), order_by=routine_products.c.order)  # Opcional: ordenar productos

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    skin_type = db.Column(db.String(50))
    conditions = db.Column(db.String(200))
    routines = db.relationship('Routine', backref='user', lazy=True)










#rutitas
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    email = data.get('email')
    #luego haremos update a skin_type y conditions

    if not all([name, email, age]):
        return jsonify({"error":"Missing required fields (name, email, age)"}), 400
    try:
        new_user=User(name=name, age=int(age), email=email, skin_type=None, conditions=None)
        db.session.add(new_user)
        db.session.commit() #importante el commit
        return jsonify({"status":"success", "user_id":new_user.id, "message":f"User {new_user.name} registered succesfully"}),201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


"""

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
    
@app.route('/api/analyze-skin/efficient-net', methods=['POST'])
def analyze_skin_efficientnet():
    # Verificar si se envió una imagen
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image_file = request.files['image']
    
    #corregir logica clase residual. mixted./
    try:
        
        image = Image.open(io.BytesIO(image_file.read()))
        image = image.convert('RGB') 
        image = image.resize((224, 224))
        to_tensor = transforms.ToTensor()
        image = to_tensor(image)
        #simple_transform = joblib.load('simple_transform.pkl')
        image = image.unsqueeze(0)
        feature_extractor = joblib.load("feature_extractor.pkl")
        with torch.no_grad():
            feats = feature_extractor(image)
        feats = feats.cpu().numpy().squeeze(0)


        
        model_loaded = joblib.load("mlp_v2.pkl")
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
    app.run(debug=True)