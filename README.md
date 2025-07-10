
![](/dermis/assets/logo_dermis_frase.png)  
---
Dermis es un producto de datos en formato de aplicación que mediante algoritmos de machine learning reconoce tu tipo de piel y condiciones para recomendarte una rutina de cuidado de la piel personalizada. Cada producto con ingredientes que ayuden a tus necesidades específicas.

### Data Wrangling
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

## 🧠 **Arquitectura del flujo de Dermis**

Nuestro sistema combina aprendizaje automático, análisis de grafos, scraping de productos, y reglas basadas en literatura dermatológica para generar rutinas de skincare personalizadas.

### 1. **Input del Usuario**

* Foto frontal del rostro (imagen 1)
* Foto lateral del rostro (imagen 2)
* Información adicional: ¿Tiene piel sensible?

### 2. **Análisis de imágenes**

* **Foto Frontal → Modelo de Regresión Logística**
  ![Fig. 4](/dermis/assets/ref_log.png)
```python
# Aquí va el bloque de código de Regresión Logística
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
# Aquí va el bloque de código del Transformer de Atención
```

* Los productos finales se clasifican según su función: **Limpiar**, **Tratar**, **Proteger**.

---

## 📱 **Frontend / Interfaz de Usuario**

En la app, el usuario puede:

* Ver la rutina recomendada dividida por función (Limpiar, Tratar, Proteger).
* Consultar:

  * Precio
  * Descripción
  * Ranking de cada producto
* Generar con un clic las **instrucciones de uso paso a paso**.
* Brindar **feedback sobre la rutina** recibida.

---

## 🔧 **Tecnologías Utilizadas**

* **Backend:** Python (Flask), scraping con BeautifulSoup
* **Modelos:** Scikit-learn (Regresión Logística), PyTorch (CNN y Transformer)
* **Frontend:** React Native
* **Base de Datos:** PostgreSQL + base de datos de productos scrappeada



## **Builded By** Camila Acosta | Andrea Coa | Jimena Gurbillón



---


