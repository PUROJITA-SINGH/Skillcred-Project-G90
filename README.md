# Skillcred-Project-G90
PriceAI & Social Donation Website 🌟
🚀 Welcome to the Main Branch!This repository combines two powerful projects: PriceAI Backend, an e-commerce price prediction system, and Social Donation Website, a modern one-page donation platform. Both projects showcase advanced technologies and seamless user experiences, catering to different use cases in e-commerce and social impact.

📋 Overview
PriceAI Backend
PriceAI Backend is a comprehensive Python pipeline for e-commerce price prediction, leveraging machine learning, web scraping, and real-time market analysis. It integrates with a frontend (not included) to deliver accurate pricing intelligence for products across platforms like Amazon, eBay, and Walmart.
Social Donation Website
The Social Donation Website is a single-page, responsive web application designed for seamless donations. It uses Tailwind CSS for styling, Stripe for secure payments, and supports integration with a headless CMS and a Large Language Model (LLM) for personalized donor communication.

✨ Features
PriceAI Backend

Advanced ML Models: Ensemble of Random Forest, Gradient Boosting, Ridge, and Elastic Net for accurate price predictions.
Web Scraping: Asynchronous scraping of Amazon, eBay, and Walmart for competitor pricing and product data.
Feature Engineering: Text analysis (sentiment, keywords), categorical encoding (category, brand, condition), and scraped data features.
Image Analysis: Optional computer vision for product images using ResNet50 (requires PyTorch).
REST API: Flask-based API with endpoints for predictions, batch processing, training, stats, and market trends.
Database Management: SQLite for storing products, predictions, and scraped data.
Batch Processing: Supports CSV uploads for bulk price predictions.

Social Donation Website

Single-Page Design: Clean, intuitive UI built with HTML and Tailwind CSS.
Secure Payments: Stripe integration for reliable donation processing.
Headless CMS: Designed for easy content updates via a CMS (e.g., Sanity, Contentful).
Personalized Communication: Backend (not included) uses an LLM to generate thank-you emails and impact summaries.
Interactive Impact Meter: Real-time visual feedback on donation impact.
Responsive UI: Optimized for desktop and mobile devices.


💻 Technologies Used
PriceAI Backend

Core: Python, Flask, SQLite
Scraping: requests, aiohttp, BeautifulSoup, Selenium
Machine Learning: scikit-learn, numpy, pandas
Text Processing: NLTK, TextBlob, spacy
Image Analysis: PyTorch, torchvision (optional)
Dependencies: selenium, flask-cors, joblib, nltk, etc.

Social Donation Website

Frontend: HTML, JavaScript, Tailwind CSS
Payments: Stripe JS v3
Content Management: Headless CMS (e.g., Sanity, Contentful, Strapi)
Backend (not included): LLM (e.g., GPT-3/4, PaLM), email service (e.g., SendGrid)


🚀 Getting Started
PriceAI Backend
Prerequisites

Python 3.8+
Dependencies: pip install selenium flask-cors requests aiohttp beautifulsoup4 scikit-learn pandas numpy nltk textblob spacy joblib (optional: torch torchvision for image analysis)
Chrome WebDriver for Selenium
SQLite for database storage

Installation

Clone the repository:git clone https://github.com/your-repo/priceai-social-donation.git
cd priceai-social-donation


Install dependencies:pip install -r requirements.txt


(Optional) Set up Chrome WebDriver for Selenium.
Run the application:
API Mode: python main.py --mode api --host 0.0.0.0 --port 5000
Train Mode: python main.py --mode train
Test Mode: python main.py --mode test --product "iPhone 13"



Usage

API Endpoints:
/api/predict: Predict price for a single product (POST).
/api/batch-predict: Predict prices for CSV data (POST).
/api/train: Train ML models (POST).
/api/stats: Get system statistics (GET).
/api/similar: Find similar products (POST).
/api/market-trends: View market trends (GET).


Sample Data: If no model exists, the system generates 100 mock products for training.

Social Donation Website
Prerequisites

A Stripe account with a publishable key.
A backend server (not included) for Stripe payment intent and LLM integration.
A headless CMS (e.g., Sanity, Contentful) for campaign data.
An email service (e.g., SendGrid) for donor communication.

Installation

Clone the repository (if not already done):git clone https://github.com/your-repo/priceai-social-donation.git
cd priceai-social-donation/SocialDonationWebsite


Open index.html in a web browser for local testing.
Configure Stripe with your publishable key in the <script> section.
Set up a backend server to handle Stripe webhooks and LLM/email integration.

Usage

Navigate the single-page site to select donation amounts and process payments via Stripe.
The impact meter updates dynamically to reflect contributions.
Backend (not included) handles personalized thank-you emails and impact summaries.


📄 Code Structure
PriceAI Backend

main.py: Core script with all classes (WebScraper, FeatureExtractor, PricePredictionModel, DatabaseManager, PriceAIAPI, ImageAnalyzer, DataValidator) and CLI interface.
Database: SQLite file (priceai.db) for storing data.
Model: Saved as priceai_model.pkl using joblib.

Social Donation Website

index.html: Single file containing HTML, Tailwind CSS, Stripe.js, and JavaScript for navigation, donation forms, and impact meter.
Structure:
<head>: Includes Tailwind CSS and Stripe.js CDNs, custom styles.
<body>: Two sections (homepage, donate) for single-page navigation.
<script>: Handles client-side logic and Stripe integration.




😊 Notes

PriceAI Backend: Scalable with asynchronous scraping and robust error handling. Requires significant computational resources for scraping and ML training.
Social Donation Website: Lightweight frontend with no build steps. Backend setup is required for full functionality.
Contributions: Feel free to fork, submit PRs, or report issues!
License: MIT License (update as needed).

😎 Thank You for Exploring PriceAI & Social Donation Website!
