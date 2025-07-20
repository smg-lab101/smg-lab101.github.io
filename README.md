# 🌍 Klima-Explorer

**Interaktive Webanwendung zur Visualisierung von Klimadaten in Europa (2000–2021)**  
_Bachelorarbeit von Sarah Maria Gruber – HTW Berlin, Studiengang Internationale Medieninformatik (2025)_

## 🧭 Ziel

Der Klima-Explorer wurde im Rahmen meiner Bachelorarbeit entwickelt, um **digital-nachsozialisierte Erwachsene ohne fachspezifische Vorkenntnisse** beim Verstehen klimatisch bedingter Veränderungen der Vegetation zu unterstützen.  
Die Anwendung ermöglicht die **interaktive Erkundung des NDVI (Normalized Difference Vegetation Index)** in Verbindung mit **Temperatur-** und **Niederschlagswerten** über einen Zeitraum von mehr als zwei Jahrzehnten.

## 📊 Features

- 🌿 **Drei Kartenansichten**: NDVI, Temperatur (2 m), Niederschlag (mm/d)  
- 🕓 **Zeit-Slider**: Monatliche Daten von März 2000 bis Dezember 2021  
- 🔍 **Zoom & Pan**: Interaktive Kartennavigation  
- 🧠 **Tooltip & Statistikbox**: Werte mit gleitendem 5-Jahres-Mittel & Differenz  
- 📚 **Infotabs**: Erläuterungen zu NDVI, Metriken und Datenquellen

## 📦 Datengrundlage

Die dargestellten Daten stammen aus dem [**Earth System Data Cube** (Version 3.0.2)](http://www.earthsystemdatalab.net/), einer multidimensionalen Umwelt-Datenstruktur, die verschiedene Fernerkundungs- und Reanalysedatensätze zusammenführt:

- **NDVI** (MODIS)
- **Lufttemperatur 2 m** (ERA5)
- **Niederschlag** (ERA5)

Die Daten wurden mittels Python (Jupyter Notebooks, `xarray`, `zarr`, `pandas`) verarbeitet, zeitlich aggregiert (Monatsmittel), regional gefiltert (Europa) und als JSON-Dateien exportiert.

## 🛠️ Technologien

- **Frontend:** HTML, CSS, JavaScript
- **Visualisierung:** D3.js (v7), Canvas API
- **Styling:** Bootstrap 5, Custom CSS
- **Hosting:** GitHub Pages

## 🧠 Unterstützung durch KI

Teile des Codes wurden mit **Unterstützung von GPT-4o (ChatGPT, OpenAI)** entwickelt, überprüft und optimiert. Dabei kamen insbesondere Unterstützung bei der Code-Generierung, Refaktorierung und Performanzoptimierung zum Einsatz. Die kreative und gestalterische Kontrolle sowie das inhaltliche Gesamtkonzept lagen vollständig bei der Autorin.


