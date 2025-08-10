<!-- Image Bannière -->
<div align="center">
  <img src="../assets/fewinfos-banner.png" alt="Bienvenue sur FEWINFOS Contribution - GitHub Repository Stats Widget" width="100%">
</div>

# 📦 Widget de Statistiques de Répertoire GitHub

Un outil open source, entièrement côté client, qui visualise **les statistiques d’un répertoire GitHub en temps réel** dans un format interactif et personnalisable — idéal pour les développeurs, les mainteneurs open source et les créateurs de portfolios.

---

## 🎯 Objectif

Ce widget utilise l’API REST de GitHub pour récupérer et afficher diverses métadonnées et informations sur n’importe quel répertoire GitHub public. Il fonctionne **entièrement dans le navigateur**, sans backend ni authentification.

---

## ✨ Fonctionnalités

- 🔄 Récupération de données en temps réel via l’API REST de GitHub
- ⭐ Affiche le nombre d’étoiles, forks, observateurs, issues et pull requests
- 👥 Visualise les principaux contributeurs avec avatar et nombre de commits
- 📊 Montre les langages utilisés avec des graphiques interactifs
- 📅 Affiche la date de création et la dernière mise à jour du répertoire
- 📜 Affiche les informations de licence
- 🎨 Interface propre, responsive et personnalisable
- 💻 Fonctionne directement dans n’importe quel navigateur (aucune configuration serveur)
- 🧩 Facile à intégrer dans des sites web ou des fichiers README.md
- 📈 Visualisations optionnelles via Chart.js

---

## 🧱 Pile Technologique

- **HTML** – Structure et mise en page
- **CSS** – Style et adaptabilité
- **JavaScript** – Logique et gestion de l’API
- **GitHub REST API** – Source de données
- **Chart.js** – Rendu des graphiques (optionnel)

---

## 📊 Widgets Disponibles

### 🔍 Statistiques du Répertoire

- ⭐ Compteur d’étoiles / 🍴 forks / 👁️ observateurs
- 📅 Date de création et dernière mise à jour
- 📜 Type de licence
- 📊 Utilisation des langages (camembert, histogramme, graphique en anneau)
- 📦 Graphique de dépendances (npm, pip, etc.)
- 📈 Carte thermique d’activité des commits
- 🕐 Temps moyen de fusion des PR
- 🧵 Répartition de l’état des issues (Ouvert / Fermé / Épinglé)

### 👥 Widgets Contributeurs

- 👥 Principaux contributeurs (avatars + nombre de commits)
- 📊 Contributions par jour de la semaine
- 🗺️ Carte de localisation des contributeurs (données publiques)
- ⏱️ Contributeurs récents (7 / 30 derniers jours)
- 📈 Contributions au fil du temps (graphique en aires empilées)

### 📊 Widgets Basés sur des Graphiques

- 📊 Diagramme radar de la santé du dépôt (étoiles, forks, PR, issues)
- 📉 Graphique linéaire de tendance des étoiles/forks
- 🍩 Graphique en anneau pour l’utilisation des langages
- 📈 Graphique en aires pour la tendance des issues/PR
- 📆 Carte thermique de type calendrier GitHub

### ⚙️ Widgets DevOps & CI/CD

- 🚦 Badge d’état CI/CD GitHub Actions
- 🧪 Badge de couverture de code (Codecov, Coveralls)
- 🔄 Widget de dernière exécution de workflow
- 🛠️ Chronologie de l’historique des builds (succès/échec visuel)

### 📌 Widgets Issues & PR

- 📋 Issues ou discussions épinglées
- 🔍 Nuage de mots des labels d’issues
- 📬 Suivi du statut/ratio de fusion des PR
- 📈 Indicateur de sentiment des issues (basé sur des mots-clés)

### 🧩 Widgets Divers

- 📌 Bouton pour marquer/mettre en favori un dépôt
- 🔍 Recherche intégrée pour entrer d’autres répertoires
- 🧠 Résumé de commits assisté par IA (optionnel)
- 🔗 Widget de dépôts liés
- 🪄 Exporter le widget en iframe / intégration HTML

---

## 📂 Structure du Projet

github-repo-stats-widget/
├── index.html # Fichier HTML principal
├── style.css # Styles CSS
├── repo.js # Logique principale JavaScript
├── charts.js # Logique de rendu des graphiques
├── assets/ # Icônes, captures d’écran
├── README.md # Ce fichier de documentation
└── LICENSE # Licence MIT

---

## 🚀 Déploiement

Vous pouvez déployer ce widget sur **GitHub Pages** ou utiliser tout service d’hébergement statique comme Netlify, Vercel ou Firebase.

### Déploiement via GitHub Pages

1. Poussez votre projet sur GitHub
2. Allez dans **Settings → Pages**
3. Choisissez la branche : `main` et le dossier : `/ (root)`
4. Votre widget sera hébergé à :  
   `https://votrenomutilisateur.github.io/github-repo-stats-widget/`