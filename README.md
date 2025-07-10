
![](/dermis/assets/logo_dermis_frase.png)  
---
Dermis es un producto de datos en formato de aplicación que mediante algoritmos de machine learning reconoce tu tipo de piel y condiciones para recomendarte una rutina de cuidado de la piel personalizada. Cada producto con ingredientes que ayuden a tus necesidades específicas.

# Data Wrangling
Nuestro proyecto maneja varios tipos de datos: imágenes, csv's, pdf's. En esta sección especificaremos cómo preprocesamos cada uno y cuál es su función en el proyecto.
* **Imágenes**: Utilizamos un volúmen de imágenes de rostros para entrenar los dos modelos de predicción que manejamos: *Logistic Regression* (para la predicción de condiciones en la piel), *Convolutional Neural Network (240 imgs)* (para la predicción de tipo de piel ). En ambos aplicamos *data augmentation* para no sesgar a clases minoritarias, obtener data más granular como imágenes con distinta iluminación y orientación (horizontal).Luego, como se puede observar en el extracto de pipeline, Fig. 1, uniformizamos el tamaño de las imágenes para el correcto manejo de parámetros y buenas prácticas.

![Fig. 1](/dermis/assets/pipeline_im.png)

Cabe resaltar, que para la inferencia de los modelos, las imágenes ingresadas por los usuarios, también pasarán por el pipeline de corte de tamaño.
* **Archivos pdf's**: Utilizamos archivos pdf's ya que las fichas técnicas de los químicos presentes en ingredientes de productos de cuidado de la piel, fueron obtenidos en ese formato. En este caso, el preprocesamiento más que todo fue poder extraer la data dentro del pdf, es decir, de cada ingrediente químico poder obtener las condiciones a las que combatia o actuaba y almacenarlos en un csv.
![Fig. 2](/dermis/assets/pipeline_ft.png)

* **csv' s**: La data de productos scrapeados de las farmacias y distribuidoras de productos, fueron alamacenados en csv's y analizados exhaustivamente para uniformizar la escritura de los ingredientes, categorízas de los productos, como : *"moisturizer"*, *"serums"*...
La data utilizada para el EDA se puede encontrar en este [Google Drive](https://drive.google.com/drive/folders/108uniNHXUsphg3Wv_l5kBHt06mjvnzr0?usp=sharing).

---
### Data Modeling
![Fig. 3](/dermis/assets/arqui.png)

* **Transformer | Self attention entre los ingredientes de productos de nuestro *dataset* y los del libro**
Para explicar

# 🧠 **Arquitectura del flujo de Dermis**

Nuestro sistema combina aprendizaje automático, análisis de grafos, scraping de productos, y reglas basadas en literatura dermatológica para generar rutinas de skincare personalizadas.

### 1. **Input del Usuario**

* Foto frontal del rostro (imagen 1)
* Foto lateral del rostro (imagen 2)
* Información adicional: ¿Tiene piel sensible?

### 2. **Análisis de imágenes**

* **Foto Frontal → Modelo de Regresión Logística**
  ![Fig. 4](/dermis/assets/reg_log.png)
Este proyecto usa EfficientNet-B0 preentrenado como extractor de características para imágenes, eliminando su capa final. Las imágenes se transforman (224x224, ToTensor) y se procesan con un DataLoader. Las representaciones obtenidas se usan como entrada para un modelo de clasificación multietiqueta basado en LogisticRegression, envuelto con MultiOutputClassifier para manejar múltiples etiquetas por muestra. Se entrena usando class_weight='balanced' para mitigar el desbalance de clases.
```python
logistic = MultiOutputClassifier(LogisticRegression(max_iter=1000, class_weight='balanced'))
logistic.fit(X, y)
```

* **Foto Lateral → Red Neuronal Convolucional (CNN)**
 ![Fig. 5](/dermis/assets/cnn_pipe.png) 
```python
# Aquí va el bloque de código de CNN
```

Ambos modelos permiten identificar condiciones cutáneas (como acné, rojeces, manchas, etc.)

### 3. **Sistema de Recomendación Basado en Grafo**

* Las condiciones detectadas son nodos que se conectan a ingredientes beneficiosos.
* Los ingredientes se conectan a productos obtenidos vía scraping.

Esta red permite filtrar productos alineados con las necesidades de la piel del usuario.

### 4. **Clasificación de Tipo de Piel (basado en dermatología clínica)**

* Utilizamos la información del usuario (sensibilidad + condiciones detectadas) para inferir su tipo de piel según un libro de referencia dermatológica que define **16 tipos de piel**.
* De este tipo de piel se extrae un conjunto de productos ideales (según el libro) con sus ingredientes.

### 5. **Refinamiento con Transformer de Atención**

* Comparación entre productos del grafo y productos del libro con transformer de atención para obtener el set final personalizado.

```python
    def recommend(self, input_products):
        recommendations = defaultdict(list)

        for product in input_products:
            X = self._vectorize_product(product)

            for category, model in self.models.items():
                if category in self.routine['steps']:
                    with torch.no_grad():
                        score = torch.sigmoid(model(X)).item()
                    recommendations[category].append((product, score))
        final_recommendations = {}
        for category, candidates in recommendations.items():
            if candidates:
                candidates.sort(key=lambda x: x[1], reverse=True)
                final_recommendations[category] = candidates[0][0]

        return final_recommendations
```

* Los productos finales se clasifican según su función: **Limpiar**, **Tratar**, **Proteger**.

---

# ⚙️ **Backend**

El backend de Dermis tiene varios componentes. Los servidores que sirven los modelos están en una aplicación de Flask, y lo restante (usuarios, productos) está en Lambda y API Gateway de AWS. 
 ![Fig. 5](/dermis/assets/back.png) 

## **Modelos de Machine Learning**

Se recomienda usar versión 3.11 de Python.

### **Detección de tipo y condiciones de la piel**:

```{bash}
cd .\backend\redes\
```

Crear un entorno virtual de Python e instalar dependencias:

```{bash}
python -m venv .venv
.\.venv\Scripts\activate

pip install -r requirements_with_versions.txt
```
```{bash}
python .\app.py
```

El puerto por default es 5000, pero se puede cambiar en el archivo `app.py`.


### **Creación de rutinas:**

```{bash}
cd .\backend\transformer\
```

Crear un entorno virtual de Python e instalar dependencias:

```{bash}
python -m venv .venv
.\.venv\Scripts\activate

pip install -r requirements.txt
```

```{bash}
python .\app.py
```

El puerto por default es 5001, pero se puede cambiar en el archivo `app.py`.


### Deployment en AWS

Para las bases de datos y otros componentes del backend, utilizamos servicios de AWS. Es necesario que la cuenta tenga los permisos adecuados para crear y gestionar los siguientes recursos:

- CloudFormation,
- Secrets Manager,
- EC2,
- S3,
- Lambda, 
- API Gateway.

A continuación se detallan los pasos para desplegar el backend en AWS:

1. Configuración de credenciales de AWS: Asegúrate de tener instalado AWS CLI y configurado con tus credenciales de AWS en el archivo ```~\.aws```. Puedes editarlo manualmente o utilizar el comando:

   ```bash
   aws configure
   ```

* ****

# 📱 **Frontend / Interfaz de Usuario**

En la app, el usuario puede:

* Ver la rutina recomendada dividida por función (Limpiar, Tratar, Proteger).
* Consultar:

  * Precio
  * Descripción
  * Ranking de cada producto
* Generar con un clic las **instrucciones de uso paso a paso**.
* Brindar **feedback sobre la rutina** recibida.

Para utilizar el frontend se requiere ```npm```. Además, instalar **Expo Go** en el dispositivo móvil para visualizar la app:

```{bash}
cd .\dermis\
```

Instalar dependencias:

```{bash}
npm install
```

Correr la aplicación:

```{bash}
npx expo start
```

---

# 🔧 **Tecnologías Utilizadas**

* **Scraping** Python: BeautifulSoup, Selenium
* **Backend:** Python (Flask), scraping con BeautifulSoup
* **Modelos:** Scikit-learn (Regresión Logística), PyTorch (CNN y Transformer)
* **Frontend:** React Native con Expo
* **Base de Datos:** PostgreSQL + S3



## **Buit By** Camila Acosta | Andrea Coa | Jimena Gurbillón
