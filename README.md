## **DERMIS** Tu piel, nuestra ciencia  
Dermis es un producto de datos en formato de aplicación que mediante algoritmos de machine learning reconoce tu tipo de piel y condiciones para recomendarte una rutina de cuidado de la piel personalizada. Cada producto con ingredientes que ayuden a tus necesidades especpificas.
---
### Data Wrangling
Nuestro proyecto maneja varios tipos de datos: imágenes, json's, csv's, pdf's. En esta sección especificaremos cómo preprocesamos cada uno y cuál es su función en el proyecto.
* **Imágenes**


### Análisis Exploratorio de Datos (EDA)

1. **Familiarizarse con los datasets**: comprender la estructura, calidad y características generales de los datos relacionados con imperfecciones de la piel, ingredientes cosméticos y productos de skincare.
2. **Identificar vacíos de información**: detectar qué datos faltan o serían necesarios recolectar en fases posteriores (por ejemplo, tipo de piel, edad, sensibilidad, etc.).
3. **Analizar correlaciones relevantes**:

   * Entre ingredientes y funciones (por ejemplo, qué ingredientes se asocian con antiinflamatorio, hidratación, etc.).
   * Entre ingredientes y posibles efectos adversos (identificación de químicos dañinos).
   * Entre tipos de productos y su aplicabilidad a distintas condiciones cutáneas.
4. **Detectar necesidades de preprocesamiento**: definir qué transformaciones o limpieza se requerirá para futuras etapas del pipeline (como codificación, normalización, manejo de datos faltantes o unificación de nombres de ingredientes).
5. **Evaluar la cobertura de imperfecciones tratables**: verificar si los productos disponibles en la base pueden abordar adecuadamente las imperfecciones más comunes detectadas.

La data utilizada para el EDA se puede encontrar en este [Google Drive](https://drive.google.com/drive/folders/108uniNHXUsphg3Wv_l5kBHt06mjvnzr0?usp=sharing).

---

## 🧠 **Arquitectura del flujo de Dermis**

Nuestro sistema combina aprendizaje automático, análisis de grafos, scraping de productos, y reglas basadas en literatura dermatológica para generar rutinas de skincare personalizadas.

### 1. **Input del Usuario**

* Foto frontal del rostro (imagen 1)
* Foto lateral del rostro (imagen 2)
* Información adicional: ¿Tiene piel sensible?

### 2. **Análisis de imágenes**

* **Foto Frontal → Modelo de Regresión Logística**

```python
# Aquí va el bloque de código de Regresión Logística
```

* **Foto Lateral → Red Neuronal Convolucional (CNN)**

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


