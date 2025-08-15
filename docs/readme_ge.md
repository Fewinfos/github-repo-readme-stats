<!-- Banner Image -->
<div align="center">
  <img src="../assets/fewinfos-banner.png" alt="Willkommen zum FEWINFOS-Beitrag – GitHub Repository Stats Widget" width="100%">
</div>

# 📦 GitHub Repository Stats Widget

Ein quelloffenes, vollständig clientseitiges Tool, das **Echtzeit-Statistiken** zu GitHub-Repositories in einem interaktiven und anpassbaren Format visualisiert – perfekt für Entwickler, Open-Source-Maintainer und Portfolio-Ersteller.

---

## 🎯 Zielsetzung

Dieses Widget verwendet die GitHub REST API, um verschiedene Metadaten und Einblicke zu jedem öffentlichen GitHub-Repository abzurufen und anzuzeigen. Es funktioniert **komplett im Browser** – ohne Backend oder Authentifizierung.

---

## ✨ Funktionen

- 🔄 Echtzeit-Datenabruf über die GitHub REST API
- ⭐ Anzeige von Stars, Forks, Watchern, Issues und Pull Requests
- 👥 Visualisierung der Top-Mitwirkenden mit Avataren und Commit-Anzahlen
- 📊 Anzeige der verwendeten Programmiersprachen mit interaktiven Diagrammen
- 📅 Anzeige des Erstellungsdatums und der letzten Aktualisierung
- 📜 Anzeige der Lizenzinformationen
- 🎨 Saubere, responsive und anpassbare Benutzeroberfläche
- 💻 Funktioniert direkt in jedem Browser (kein Server nötig)
- 🧩 Einfach in Webseiten oder README.md-Dateien einbettbar
- 📈 Optionale Visualisierungen mit Chart.js

---

## 🧱 Technologiestack

- **HTML** – Struktur und Layout
- **CSS** – Styling und Responsivität
- **JavaScript** – Logik und API-Verarbeitung
- **GitHub REST API** – Datenquelle
- **Chart.js** – Rendering von Diagrammen (optional)

---

## 📊 Verfügbare Widgets
  
### 🔍 Repository-Statistiken  

- ⭐ Stars / 🍴 Forks / 👁️ Watcher-Zähler
- 📅 Repository-Erstellungs- & letztes Aktualisierungsdatum
- 📜 Lizenztyp-Anzeige
- 📊 Sprachverwendung (Kreis-, Balken-, Donutdiagramm)
- 📦 Abhängigkeitsdiagramm (npm, pip, etc.)
- 📈 Commit-Aktivitäts-Heatmap
- 🕐 Durchschnittliche PR-Merge-Zeit
- 🧵 Issue-Status-Aufschlüsselung (Offen / Geschlossen / Angepinnt)

### 👥 Mitwirkenden-Widgets

- 👥 Top-Mitwirkende (Avatare + Commit-Anzahlen)
- 📊 Beiträge nach Wochentag
- 🗺️ Standortkarte der Mitwirkenden (öffentliche Daten)
- ⏱️ Letzte Mitwirkende (letzte 7 / 30 Tage)
- 📈 Beiträge im Zeitverlauf (gestapeltes Flächendiagramm)

### 📊 Diagramm-basierte Widgets

- 📊 Radar-Diagramm der Repository-Gesundheit (Stars, Forks, PRs, Issues)
- 📉 Liniendiagramm für Stars-/Fork-Wachstumstrends
- 🍩 Donutdiagramm für Sprachverwendung
- 📈 Flächendiagramm für Issue-/PR-Trends
- 📆 GitHub-Style-Kalender-Heatmap

### ⚙️ DevOps- & CI/CD-Widgets

- 🚦 GitHub Actions CI/CD-Status-Badge
- 🧪 Code-Coverage-Badge (Codecov, Coveralls)
- 🔄 Letzter Workflow-Run-Status
- 🛠️ Build-Historien-Timeline (Erfolg/Fehler-Visualisierung)

### 📌 Issue- & PR-Widgets

- 📋 Angepinnte Issues oder Diskussionen
- 🔍 Issue-Label-Wordcloud
- 📬 PR-Merge-Status/Verhältnis-Tracker
- 📈 Issue-Stimmungsanzeige (basierend auf Schlüsselwörtern)

### 🧩 Verschiedene Widgets

- 📌 Lesezeichen-/Favoriten-Button für Repos
- 🔍 Inline-Suche zum Eingeben anderer Repositories
- 🧠 KI-gestützte Commit-Zusammenfassung (optional)
- 🔗 Widget für verwandte Repositories
- 🪄 Export als iframe / HTML-Embed


## 📂 Projektstruktur
```
github-repo-stats-widget/
├── index.html # Haupt-HTML-Datei
├── style.css # CSS-Styles
├── repo.js # Kern-JavaScript-Logik
├── charts.js # Diagramm-Rendering-Logik
├── assets/ # Icons, Screenshots
├── README.md # Diese Dokumentationsdatei
└── LICENSE # MIT-
```

---

## 🚀 Deployment

Du kannst dieses Widget auf **GitHub Pages** bereitstellen oder jeden beliebigen statischen Hosting-Dienst wie Netlify, Vercel oder Firebase verwenden.

### Deployment über GitHub Pages

1. Lade dein Projekt zu GitHub hoch
2. Gehe zu **Einstellungen → Pages**
3. Wähle Branch: `main` und Ordner: `/ (root)`
4. Dein Widget wird gehostet unter:  
   `https://deinbenutzername.github.io/github-repo-stats-widget/`
