📦 Widget de Estadísticas de Repositorio de GitHub

Una herramienta de código abierto, completamente del lado del cliente, que visualiza estadísticas en tiempo real de repositorios de GitHub en un formato interactivo y personalizable — perfecto para desarrolladores, mantenedores de proyectos open-source y portafolios.



🎯 Objetivo

Este widget utiliza la API REST de GitHub para obtener y mostrar varios metadatos e información sobre cualquier repositorio público de GitHub. Funciona completamente en el navegador, sin necesidad de backend ni autenticación.



✨ Características

🔄 Obtención de datos en tiempo real mediante la API REST de GitHub

⭐ Muestra estrellas, forks, watchers, issues y pull requests

👥 Visualiza los principales contribuidores con avatares y conteo de commits

📊 Muestra los lenguajes usados con gráficos interactivos

📅 Muestra la fecha de creación del repositorio y la última actualización

📜 Muestra información de la licencia

🎨 Interfaz limpia, adaptable y personalizable

💻 Funciona directamente en cualquier navegador (sin servidor)

🧩 Fácil de incrustar en sitios web o archivos README.md

📈 Visualizaciones opcionales con Chart.js



🧱 Tecnologías Usadas

HTML – Estructura y maquetación



CSS – Estilo y adaptabilidad



JavaScript – Lógica y manejo de la API



API REST de GitHub – Fuente de datos



Chart.js – Para renderizar gráficos (opcional)



📊 Widgets Disponibles

🔍 Estadísticas del Repositorio

⭐ Contador de estrellas / 🍴 forks / 👁 watchers



📅 Fecha de creación y última actualización del repositorio



📜 Visualización del tipo de licencia



📊 Uso de lenguajes (gráfico de pastel, barras, dona)



📦 Gráfico de dependencias (npm, pip, etc.)



📈 Mapa de calor de actividad de commits



🕐 Tiempo promedio de fusión de PRs



🧵 Desglose del estado de issues (Abiertos / Cerrados / Fijados)



👥 Widgets de Contribuidores

👥 Principales contribuidores (avatares + número de commits)



📊 Contribuciones por día de la semana



🗺 Mapa de localización de contribuidores (datos públicos)



⏱ Contribuidores recientes (últimos 7 / 30 días)



📈 Contribuciones a lo largo del tiempo (gráfico de área acumulada)



📊 Widgets Basados en Gráficos

📊 Gráfico radar de salud del repositorio (estrellas, forks, PRs, issues)



📉 Gráfico de líneas para tendencias de crecimiento de estrellas/forks



🍩 Gráfico de dona para uso de lenguajes



📈 Gráfico de área para tendencias de issues/PRs



📆 Mapa de calor estilo GitHub



⚙ Widgets de DevOps y CI/CD

🚦 Insignia de estado de CI/CD (GitHub Actions)



🧪 Insignia de cobertura de código (Codecov, Coveralls)



🔄 Widget de última ejecución de flujo de trabajo



🛠 Línea de tiempo del historial de builds (éxito/fallo visual)



📌 Widgets de Issues y PRs

📋 Issues o discusiones fijadas



🔍 Nube de palabras de etiquetas de issues



📬 Rastreador de estado/ratio de fusión de PRs



📈 Indicador de sentimiento de issues (basado en palabras clave)



🧩 Widgets Misceláneos

📌 Botón para marcar/favorito del repositorio



🔍 Búsqueda en línea para ingresar otros repositorios



🧠 Resumen de commits con IA (opcional)



🔗 Widget de repositorios relacionados



🪄 Exportar widget como iframe / incrustación HTML



📂 Estructura del Proyecto

graphql

Copy

Edit

github-repo-stats-widget/

├── index.html         # Archivo HTML principal  

├── style.css          # Estilos CSS  

├── repo.js            # Lógica principal en JavaScript  

├── charts.js          # Lógica de gráficos  

├── assets/            # Iconos, capturas de pantalla  

├── README.md          # Este archivo de documentación  

└── LICENSE            # Licencia MIT

🚀 Despliegue

Puedes desplegar este widget en GitHub Pages o usar cualquier servicio de hosting estático como Netlify, Vercel o Firebase.



Desplegar con GitHub Pages

1.Sube tu proyecto a GitHub



2.Ve a Configuración → Pages



3.Selecciona rama: main y carpeta: / (root)



4.Tu widget estará disponible en:



https://tuusuario.github.io/github-repo-stats-widget/

