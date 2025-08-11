<!-- Banner Image -->
<div align="center">
  <img src="./assets/fewinfos-banner.png" alt="Welcome to FEWINFOS Contribution - GitHub Repository Stats Widget" width="100%">
</div>

# 📦 Widget de Estadísticas de Repositorio de GitHub

Una herramienta de código abierto, completamente del lado del cliente, que visualiza *estadísticas en tiempo real de repositorios de GitHub* en un formato interactivo y personalizable — perfecto para desarrolladores, mantenedores de proyectos open-source y creadores de portafolios.

---

## 🎯 Objetivo

Este widget utiliza la API REST de GitHub para obtener y mostrar varios metadatos y conocimientos sobre cualquier repositorio público de GitHub. Funciona *completamente en el navegador*, sin necesidad de backend ni autenticación.

---

## ✨ Funcionalidades

- 🔄 Obtención de datos en tiempo real a través de la API REST de GitHub  
- ⭐ Muestra estrellas, forks, observadores, issues y pull requests  
- 👥 Visualiza los principales colaboradores con avatares y recuento de commits  
- 📊 Muestra los lenguajes utilizados con gráficos interactivos  
- 📅 Muestra la fecha de creación y la última actualización del repositorio  
- 📜 Muestra la información de la licencia  
- 🎨 Interfaz limpia, adaptable y personalizable  
- 💻 Funciona directamente en cualquier navegador (sin configuración de servidor)  
- 🧹 Fácil de incrustar en sitios web o archivos README.md  
- 📊 Visualizaciones opcionales a través de Chart.js

---

## 🧱 Tecnologías Utilizadas

- *HTML* – Estructura y diseño  
- *CSS* – Estilo y adaptabilidad  
- *JavaScript* – Lógica y manejo de la API  
- *API REST de GitHub* – Fuente de datos  
- *Chart.js* – Para renderizar gráficos (opcional)

---
## 📊 Widgets Disponibles

### 🔍 Estadísticas del Repositorio

- ⭐ Contadores de estrellas / 🍴 forks / 👁 observadores  
- 📅 Fecha de creación y última actualización del repositorio  
- 📜 Tipo de licencia  
- 📊 Uso de lenguajes (gráfico circular, de barras, de dona)  
- 📦 Gráfico de dependencias (npm, pip, etc.)  
- 📈 Mapa de calor de actividad de commits  
- 🕐 Tiempo promedio de fusión de PRs  
- 🧵 Desglose del estado de los issues (Abiertos / Cerrados / Fijados)

### 👥 Widgets de Colaboradores

- 👥 Principales colaboradores (avatares + recuento de commits)  
- 📊 Contribuciones por día de la semana  
- 🗽 Mapa de ubicación de colaboradores (datos públicos)  
- ⏱ Colaboradores recientes (últimos 7 / 30 días)  
- 📈 Contribuciones a lo largo del tiempo (gráfico de área apilada)

### 📊 Widgets Basados en Gráficos

- 📊 Gráfico de radar sobre la salud del repo (estrellas, forks, PRs, issues)  
- 📉 Gráfico de líneas para tendencias de crecimiento de estrellas/forks  
- 🍩 Gráfico de dona para uso de lenguajes  
- 📈 Gráfico de área para tendencias de issues/PRs  
- 📆 Mapa de calor estilo calendario de GitHub

### ⚙️ Widgets DevOps y CI/CD

- 🚦 Insignia de estado de CI/CD de GitHub Actions  
- 🧲 Insignia de cobertura de código (Codecov, Coveralls)  
- 🔄 Widget de última ejecución de flujo de trabajo  
- 🛠 Cronología del historial de builds (visual de éxito/fallo)

### 📌 Widgets de Issues y PRs

- 📋 Issues o discusiones fijadas  
- 🔍 Nube de palabras de etiquetas de issues  
- 📬 Rastreador de estado/ratio de fusión de PRs  
- 📈 Indicador de sentimiento de issues (basado en palabras clave)

### 🧩 Widgets Misceláneos

- 📌 Botón para marcar/favorito el repositorio  
- 🔍 Búsqueda en línea para ingresar otros repositorios  
- 🧠 Resumen de commits con IA (opcional)  
- 🔗 Widget de repositorios relacionados  
- 🪄 Exportar widget como iframe / HTML embebido

## 📂 Estructura del Proyecto

```
github-repo-stats-widget/
├── index.html         # Archivo HTML principal
├── style.css          # Estilos CSS
├── repo.js            # Lógica principal en JavaScript
├── charts.js          # Lógica de visualización de gráficos
├── assets/            # Íconos, capturas de pantalla
├── README.md          # Este archivo de documentación
└── LICENSE            # Licencia MIT
```
---

## 🚀 Despliegue

Puedes desplegar este widget en *GitHub Pages*, o utilizar cualquier servicio de hosting estático como Netlify, Vercel o Firebase.

### Desplegar mediante GitHub Pages

1. Sube tu proyecto a GitHub  
2. Ve a *Settings → Pages*  
3. Elige la rama: main y carpeta: / (root)  
4. Tu widget estará alojado en:  
   `https://yourusername.github.io/github-repo-stats-widget/`

