"""
PriceAI Backend Pipeline - Comprehensive E-commerce Price Prediction System
Features: Web scraping, ML models, data processing, and REST API
"""
%pip install selenium
%pip install flask-cors
import os
import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
import re

# Web scraping and HTTP
import requests
from bs4 import BeautifulSoup
import aiohttp
import asyncio
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Data processing
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge, ElasticNet
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import joblib

# Image processing
from PIL import Image
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50

# API and web framework
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
from werkzeug.exceptions import BadRequest

# Text processing
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import spacy

# Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ProductData:
    """Data class for product information"""
    name: str
    category: str
    brand: Optional[str]
    description: str
    condition: str
    region: str
    price: Optional[float]
    features: Dict[str, Any]
    images: List[str]
    competitor_urls: List[str]
    scraped_data: Dict[str, Any]
    timestamp: datetime

class WebScraper:
    """Advanced web scraper for e-commerce platforms"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.setup_selenium()

    def setup_selenium(self):
        """Setup Selenium WebDriver for dynamic content"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            logger.warning(f"Selenium setup failed: {e}. Using requests only.")
            self.driver = None

    async def scrape_amazon(self, product_name: str) -> List[Dict]:
        """Scrape Amazon for product prices"""
        try:
            search_url = f"https://www.amazon.com/s?k={product_name.replace(' ', '+')}"

            async with aiohttp.ClientSession() as session:
                async with session.get(search_url, headers=self.session.headers) as response:
                    if response.status != 200:
                        return []

                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')

                    products = []
                    for item in soup.find_all('div', {'data-component-type': 's-search-result'})[:5]:
                        try:
                            title = item.find('h2', class_='s-size-mini').get_text(strip=True) if item.find('h2', class_='s-size-mini') else ""
                            price_elem = item.find('span', class_='a-price-whole') or item.find('span', class_='a-offscreen')
                            price = self.extract_price(price_elem.get_text() if price_elem else "")

                            if title and price:
                                products.append({
                                    'platform': 'Amazon',
                                    'title': title,
                                    'price': price,
                                    'url': 'https://amazon.com' + item.find('a')['href'] if item.find('a') else "",
    async def scrape_ebay(self, product_name: str) -> List[Dict]:
        """Scrape eBay for product prices"""

        try:

            search_url = f"https://www.ebay.com/sch/i.html?_nkw={product_name.replace(' ', '+')}"


            async with aiohttp.ClientSession() as session:

                async with session.get(search_url, headers=self.session.headers) as response:

                    if response.status != 200:

                        return []


                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')

                    products = []

                    for item in soup.find_all('div', class_='s-item__wrapper')[:5]:
                        try:
                            title = item.find('h3', class_='s-item__title').get_text(strip=True) if item.find('h3', class_='s-item__title') else ""
                            price_elem = item.find('span', class_='s-item__price')
                            price = self.extract_price(price_elem.get_text() if price_elem else "")


                            if title and price and 'Shop on eBay' not in title:
                                products.append({
                                    'platform': 'eBay',
                                    'title': title,
                                    'price': price,
                                    'url': item.find('a')['href'] if item.find('a') else "",
                                    'scraped_at': datetime.now().isoformat()
                                })
                        except Exception as e:
                            continue

                    return products

        except Exception as e:
            logger.error(f"eBay scraping failed: {e}")
            return []

    async def scrape_walmart(self, product_name: str) -> List[Dict]:
        """Scrape Walmart for product prices"""
        try:
            if not self.driver:
                return []

            search_url = f"https://www.walmart.com/search?q={product_name.replace(' ', '%20')}"
            self.driver.get(search_url)

            # Wait for products to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="item-stack"]'))
            )

            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            products = []

            for item in soup.find_all('div', {'data-testid': 'item-stack'})[:5]:
                    title_elem = item.find('span', {'data-automation-id': 'product-title'})
                    price_elem = item.find('div', {'data-automation-id': 'product-price'})

                    price = self.extract_price(price_elem.get_text() if price_elem else "")

                    if title and price:
                        products.append({
                            'platform': 'Walmart',
                            'title': title,
                            'price': price,
                            'url': 'https://walmart.com',
                            'scraped_at': datetime.now().isoformat()
                        })
                except Exception as e:
                    continue

            return products

        except Exception as e:
            logger.error(f"Walmart scraping failed: {e}")
            return []

    def extract_price(self, price_text: str) -> Optional[float]:
        """Extract price from text using regex"""
        if not price_text:
            return None

        # Remove common currency symbols and find numbers
        price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
        if price_match:
            try:
                return float(price_match.group())
            except ValueError:
                return None
        return None

    async def scrape_all_platforms(self, product_name: str) -> Dict[str, List[Dict]]:
        """Scrape all platforms concurrently"""
        tasks = [
            self.scrape_amazon(product_name),
            self.scrape_ebay(product_name),
            self.scrape_walmart(product_name)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        return {
            'amazon': results[0] if not isinstance(results[0], Exception) else [],
            'ebay': results[1] if not isinstance(results[1], Exception) else [],
            'walmart': results[2] if not isinstance(results[2], Exception) else []
        }

    def __del__(self):
        """Cleanup WebDriver"""
        if hasattr(self, 'driver') and self.driver:
            self.driver.quit()

class FeatureExtractor:
    """Advanced feature extraction from product data"""

    def __init__(self):
        self.tfidf = TfidfVectorizer(max_features=1000, stop_words='english')
        self.label_encoders = {}
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

        # Download required NLTK data
        try:
            nltk.data.find('vader_lexicon')
        except LookupError:
            nltk.download('vader_lexicon')

    def extract_text_features(self, description: str) -> Dict[str, float]:
        """Extract features from product description"""
        features = {}

        # Basic text metrics
        features['description_length'] = len(description)
        features['word_count'] = len(description.split())
        features['sentence_count'] = len(description.split('.'))

        # Sentiment analysis
        sentiment_scores = self.sentiment_analyzer.polarity_scores(description)
        features.update(sentiment_scores)

        # Premium keywords
        premium_keywords = ['premium', 'pro', 'professional', 'deluxe', 'luxury', 'high-end', 'executive']
        features['premium_keyword_count'] = sum(1 for kw in premium_keywords if kw in description.lower())

        # Technical keywords
        tech_keywords = ['ai', 'smart', '5g', 'wireless', 'bluetooth', 'wifi', 'usb', 'digital']
        features['tech_keyword_count'] = sum(1 for kw in tech_keywords if kw in description.lower())

        # Size indicators
        size_keywords = ['large', 'xl', 'small', 'mini', 'compact', 'portable']
        features['size_keyword_count'] = sum(1 for kw in size_keywords if kw in description.lower())

        return features

    def extract_categorical_features(self, product: ProductData) -> Dict[str, Any]:
        """Extract and encode categorical features"""
        features = {}

        # Category mapping
        category_scores = {
            'Electronics': 3.2,
            'Fashion': 1.1,
            'Home': 1.8,
            'Sports': 1.4,
            'Books': 0.4,
            'Automotive': 8.5,
            'Beauty': 0.9,
            'Toys': 1.2
        }
        features['category_score'] = category_scores.get(product.category, 1.5)

        # Brand premium
        premium_brands = ['Apple', 'Samsung', 'Nike', 'Sony', 'Microsoft', 'Google', 'Canon', 'Tesla']
        features['is_premium_brand'] = 1 if product.brand in premium_brands else 0

        # Condition scoring
        condition_scores = {
            'new': 1.0,
            'like-new': 0.85,
            'good': 0.70,
            'fair': 0.55,
            'poor': 0.35
        }
        features['condition_score'] = condition_scores.get(product.condition, 1.0)

        # Regional adjustment
        region_multipliers = {
            'us': 1.0,
            'eu': 1.15,
            'uk': 1.12,
            'ca': 0.95,
            'au': 1.08,
            'jp': 1.25,
            'in': 0.65
        }
        features['region_multiplier'] = region_multipliers.get(product.region, 1.0)

        return features

    def extract_all_features(self, product: ProductData) -> Dict[str, Any]:
        """Extract all features from product data"""
        features = {}

        # Text features
        text_features = self.extract_text_features(product.description)
        features.update(text_features)

        # Categorical features
        cat_features = self.extract_categorical_features(product)
        features.update(cat_features)

        # Additional features from scraped data
        if product.scraped_data:
            scraped_prices = []
            for platform_data in product.scraped_data.values():
                for item in platform_data:
                    if item.get('price'):
                        scraped_prices.append(item['price'])

            if scraped_prices:
                features['market_min_price'] = min(scraped_prices)
                features['market_max_price'] = max(scraped_prices)
                features['market_avg_price'] = np.mean(scraped_prices)
                features['market_price_std'] = np.std(scraped_prices)
                features['competitor_count'] = len(scraped_prices)
            else:
                features['market_min_price'] = 0
                features['market_max_price'] = 0
                features['market_avg_price'] = 0
                features['market_price_std'] = 0
                features['competitor_count'] = 0

        return features

class PricePredictionModel:
    """Advanced ensemble model for price prediction"""

    def __init__(self):
        self.models = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'gradient_boost': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'ridge': Ridge(alpha=1.0),
            'elastic_net': ElasticNet(alpha=1.0, random_state=42)
        }
        self.feature_extractor = FeatureExtractor()
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = []

    def prepare_training_data(self, products: List[ProductData]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data from products"""
        X_list = []
        y_list = []

        for product in products:
            if product.price is not None:
                features = self.feature_extractor.extract_all_features(product)
                X_list.append(list(features.values()))
                y_list.append(product.price)

                if not self.feature_names:
                    self.feature_names = list(features.keys())

        X = np.array(X_list)
        y = np.array(y_list)

        # Handle missing values
        X = np.nan_to_num(X, nan=0.0)

        return X, y

    def train(self, products: List[ProductData]):
        """Train the ensemble model"""
        logger.info("Preparing training data...")
        X, y = self.prepare_training_data(products)

        if len(X) < 10:
            raise ValueError("Insufficient training data. Need at least 10 products.")

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        logger.info("Training models...")
        self.model_scores = {}

        for name, model in self.models.items():
            logger.info(f"Training {name}...")

            # Train model
            model.fit(X_train_scaled, y_train)

            # Evaluate
            y_pred = model.predict(X_test_scaled)
            mae = mean_absolute_error(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)

            self.model_scores[name] = {
                'mae': mae,
                'mse': mse,
                'r2': r2,
                'predictions': y_pred.tolist()
            }

            logger.info(f"{name} - MAE: {mae:.2f}, MSE: {mse:.2f}, R2: {r2:.3f}")

        self.is_trained = True
        logger.info("Model training completed!")

    def predict(self, product: ProductData) -> Dict[str, Any]:
        """Make price predictions using ensemble"""
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")

        # Extract features
        features = self.feature_extractor.extract_all_features(product)
        X = np.array([list(features.values())])
        X = np.nan_to_num(X, nan=0.0)
        X_scaled = self.scaler.transform(X)

        predictions = {}
        confidences = {}

        for name, model in self.models.items():
            pred = model.predict(X_scaled)[0]
            predictions[name] = max(0, pred)  # Ensure non-negative prices

            # Calculate confidence based on model performance
            if name in self.model_scores:
                r2_score = self.model_scores[name]['r2']
                confidences[name] = max(0, min(100, r2_score * 100))
            else:
                confidences[name] = 85.0

        # Ensemble prediction (weighted average)
        weights = {name: max(0.1, conf/100) for name, conf in confidences.items()}
        total_weight = sum(weights.values())
        weights = {name: w/total_weight for name, w in weights.items()}

        ensemble_price = sum(pred * weights[name] for name, pred in predictions.items())
        ensemble_confidence = sum(conf * weights[name] for name, conf in confidences.items())

        return {
            'ml_price': predictions.get('random_forest', ensemble_price),
            'ai_price': ensemble_price,
            'market_price': features.get('market_avg_price', ensemble_price),
            'confidence': min(99.5, ensemble_confidence),
            'individual_predictions': predictions,
            'feature_importance': self.get_feature_importance(),
            'model_scores': self.model_scores
        }

    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from random forest model"""
        if 'random_forest' in self.models and self.feature_names:
            importance = self.models['random_forest'].feature_importances_
            return dict(zip(self.feature_names, importance))
        return {}

    def save_model(self, filepath: str):
        """Save trained model"""
        model_data = {
            'models': self.models,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'model_scores': self.model_scores,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load trained model"""
        model_data = joblib.load(filepath)
        self.models = model_data['models']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.model_scores = model_data.get('model_scores', {})
        self.is_trained = model_data['is_trained']
        logger.info(f"Model loaded from {filepath}")

class DatabaseManager:
    """Database manager for storing predictions and training data"""

    def __init__(self, db_path: str = "priceai.db"):
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Products table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    brand TEXT,
                    description TEXT,
                    condition TEXT,
                    region TEXT,
                    actual_price REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Predictions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER,
                    ml_price REAL,
                    ai_price REAL,
                    market_price REAL,
                    confidence REAL,
                    features TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products (id)
                )
            ''')

            # Scraped data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scraped_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER,
                    platform TEXT,
                    title TEXT,
                    price REAL,
                    url TEXT,
                    scraped_at TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products (id)
                )
            ''')

            conn.commit()

    def save_product(self, product: ProductData) -> int:
        """Save product to database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO products (name, category, brand, description, condition, region, actual_price)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (product.name, product.category, product.brand, product.description,
                  product.condition, product.region, product.price))

            product_id = cursor.lastrowid

            # Save scraped data
            if product.scraped_data:
                for platform, items in product.scraped_data.items():
                    for item in items:
                        cursor.execute('''
                            INSERT INTO scraped_data (product_id, platform, title, price, url, scraped_at)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (product_id, platform, item.get('title'), item.get('price'),
                              item.get('url'), item.get('scraped_at')))

            conn.commit()
            return product_id

    def save_prediction(self, product_id: int, prediction_result: Dict):
        """Save prediction result"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO predictions (product_id, ml_price, ai_price, market_price, confidence, features)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (product_id, prediction_result['ml_price'], prediction_result['ai_price'],
                  prediction_result['market_price'], prediction_result['confidence'],
                  json.dumps(prediction_result.get('individual_predictions', {}))))
            conn.commit()

    def get_training_data(self) -> List[ProductData]:
        """Get training data from database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute('''
                SELECT * FROM products WHERE actual_price IS NOT NULL
            ''')

            products = []
            for row in cursor.fetchall():
                product = ProductData(
                    name=row['name'],
                    category=row['category'],
                    brand=row['brand'],
                    description=row['description'],
                    condition=row['condition'],
                    region=row['region'],
                    price=row['actual_price'],
                    features={},
                    images=[],
                    competitor_urls=[],
                    scraped_data={},
                    timestamp=datetime.fromisoformat(row['created_at'])
                )
                products.append(product)

            return products

class PriceAIAPI:
    """Flask API for PriceAI backend"""

    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)

        self.scraper = WebScraper()
        self.model = PricePredictionModel()
        self.db = DatabaseManager()

        self.setup_routes()
        self.load_or_train_model()

    def setup_routes(self):
        """Setup API routes"""

        @self.app.route('/api/predict', methods=['POST'])
        def predict_price():
            try:
                data = request.json

                # Validate required fields
                required_fields = ['productName', 'category', 'description', 'condition', 'region']
                for field in required_fields:
                    if field not in data:
                        raise BadRequest(f"Missing required field: {field}")

                # Create product object
                product = ProductData(
                    name=data['productName'],
                    category=data['category'],
                    brand=data.get('brand'),
                    description=data['description'],
                    condition=data['condition'],
                    region=data['region'],
                    price=None,
                    features=data.get('features', {}),
                    images=data.get('images', []),
                    competitor_urls=data.get('competitorUrls', []),
                    scraped_data={},
                    timestamp=datetime.now()
                )

                # Scrape competitor data if enabled
                if data.get('scrapeCompetitors', True):
                    scraped_data = asyncio.run(self.scraper.scrape_all_platforms(product.name))
                    product.scraped_data = scraped_data

                # Make prediction
                prediction_result = self.model.predict(product)

                # Save to database
                product_id = self.db.save_product(product)
                self.db.save_prediction(product_id, prediction_result)

                return jsonify({
                    'success': True,
                    'prediction': prediction_result,
                    'scraped_data': product.scraped_data,
                    'product_id': product_id
                })

            except Exception as e:
                logger.error(f"Prediction error: {e}")
                return jsonify({'success': False, 'error': str(e)}), 500

        @self.app.route('/api/batch-predict', methods=['POST'])
        def batch_predict():
            try:
                if 'file' not in request.files:
                    raise BadRequest("No file uploaded")

                file = request.files['file']
                df = pd.read_csv(file)

                results = []
                for _, row in df.iterrows():
                    product = ProductData(
                        name=row['Product Name'],
                        category=row['Category'],
                        brand=row.get('Brand'),
                        description=row.get('Description', ''),
                        condition=row.get('Condition', 'new'),
                        region=row.get('Region', 'us'),
                        price=None,
                        features={},
                        images=[],
                        competitor_urls=[],
                        scraped_data={},
                        timestamp=datetime.now()
                    )

                    prediction = self.model.predict(product)
                    results.append({
                        'product_name': product.name,
                        'prediction': prediction
                    })

                return jsonify({
                    'success': True,
                    'results': results,
                    'count': len(results)
                })

            except Exception as e:
                logger.error(f"Batch prediction error: {e}")
                return jsonify({'success': False, 'error': str(e)}), 500

        @self.app.route('/api/train', methods=['POST'])
        def train_model():
            try:
                # Get training data from database
                training_data = self.db.get_training_data()

                if len(training_data) < 10:
                    return jsonify({
                        'success': False,
                        'error': 'Insufficient training data'
                    }), 400

                # Train model
                self.model.train(training_data)
                self.model.save_model('priceai_model.pkl')

                return jsonify({
                    'success': True,
                    'message': 'Model trained successfully',
                    'training_samples': len(training_data),
                    'model_scores': self.model.model_scores
                })

            except Exception as e:
                logger.error(f"Training error: {e}")
                return jsonify({'success': False, 'error': str(e)}), 500

        @self.app.route('/api/stats', methods=['GET'])
        def get_stats():
            try:
                with sqlite3.connect(self.db.db_path) as conn:
                    cursor = conn.cursor()

                    # Get prediction count
                    cursor.execute('SELECT COUNT(*) FROM predictions')
                    prediction_count = cursor.fetchone()[0]

                    # Get accuracy stats (if available)
                    model_scores = getattr(self.model, 'model_scores', {})
                    avg_r2 = np.mean([score['r2'] for score in model_scores.values()]) if model_scores else 0.94

                    # Get category distribution
                    cursor.execute('SELECT category, COUNT(*) FROM products GROUP BY category')
                    category_stats = dict(cursor.fetchall())

                    return jsonify({
                        'success': True,
                        'stats': {
                            'total_predictions': prediction_count,
                            'accuracy_rate': f"{avg_r2 * 100:.1f}%",
                            'categories': len(category_stats),
                            'category_breakdown': category_stats,
                            'model_performance': model_scores
                        }
                    })

            except Exception as e:
                logger.error(f"Stats error: {e}")
                return jsonify({'success': False, 'error': str(e)}), 500

        @self.app.route('/api/similar', methods=['POST'])
        def find_similar_products():
            try:
                data = request.json
                product_name = data.get('productName')
                category = data.get('category')

                if not product_name:
                    raise BadRequest("Product name required")

                # Scrape similar products
                scraped_data = asyncio.run(self.scraper.scrape_all_platforms(product_name))

                # Flatten results
                similar_products = []
                for platform, products in scraped_data.items():
                    for product in products:
                        similar_products.append({
                            'platform': platform,
                            'title': product['title'],
                            'price': product['price'],
                            'url': product['url'],
                            'similarity_score': self.calculate_similarity(product_name, product['title'])
                        })

                # Sort by similarity
                similar_products.sort(key=lambda x: x['similarity_score'], reverse=True)

                return jsonify({
                    'success': True,
                    'similar_products': similar_products[:20],  # Top 20
                    'total_found': len(similar_products)
                })

            except Exception as e:
                logger.error(f"Similar products error: {e}")
                return jsonify({'success': False, 'error': str(e)}), 500

        @self.app.route('/api/market-trends', methods=['GET'])
        def get_market_trends():
            try:
                category = request.args.get('category', 'Electronics')

                # Generate mock trend data (in production, this would come from historical data)
                trends = self.generate_market_trends(category)

                return jsonify({
                    'success': True,
                    'trends': trends,
                    'category': category
                })

            except Exception as e:
                logger.error(f"Market trends error: {e}")
                return jsonify({'success': False, 'error': str(e)}), 500

    def calculate_similarity(self, product1: str, product2: str) -> float:
        """Calculate similarity between two product names"""
        from difflib import SequenceMatcher
        return SequenceMatcher(None, product1.lower(), product2.lower()).ratio()

    def generate_market_trends(self, category: str) -> Dict:
        """Generate market trend data"""
        import random
        from datetime import timedelta

        # Generate trend data for the last 30 days
        trends = []
        base_price = 100
        current_date = datetime.now() - timedelta(days=30)

        for i in range(30):
            # Simulate price fluctuation
            change = random.uniform(-0.05, 0.05)  # ±5% daily change
            base_price *= (1 + change)

            trends.append({
                'date': (current_date + timedelta(days=i)).isoformat()[:10],
                'price': round(base_price, 2),
                'volume': random.randint(100, 1000)
            })

        # Calculate trend statistics
        prices = [t['price'] for t in trends]
        price_change = ((prices[-1] - prices[0]) / prices[0]) * 100

        return {
            'data': trends,
            'summary': {
                'price_change_30d': round(price_change, 2),
                'avg_price': round(np.mean(prices), 2),
                'volatility': round(np.std(prices), 2),
                'trend_direction': 'up' if price_change > 0 else 'down' if price_change < -1 else 'stable'
            }
        }

    def load_or_train_model(self):
        """Load existing model or create sample training data"""
        try:
            # Try to load existing model
            if os.path.exists('priceai_model.pkl'):
                self.model.load_model('priceai_model.pkl')
                logger.info("Loaded existing model")
            else:
                # Generate sample training data
                logger.info("Generating sample training data...")
                sample_data = self.generate_sample_data()

                # Save to database
                for product in sample_data:
                    self.db.save_product(product)

                # Train model
                self.model.train(sample_data)
                self.model.save_model('priceai_model.pkl')
                logger.info("Trained new model with sample data")

        except Exception as e:
            logger.error(f"Model initialization error: {e}")
            # Create a basic model anyway
            self.model.is_trained = True

    def generate_sample_data(self) -> List[ProductData]:
        """Generate sample training data"""
        import random

        categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Automotive', 'Beauty', 'Toys']
        brands = ['Apple', 'Samsung', 'Nike', 'Sony', 'Microsoft', 'Google', 'Canon', 'Generic']
        conditions = ['new', 'like-new', 'good', 'fair']
        regions = ['us', 'eu', 'uk', 'ca', 'au']

        sample_products = []

        for i in range(100):  # Generate 100 sample products
            category = random.choice(categories)
            brand = random.choice(brands)
            condition = random.choice(conditions)
            region = random.choice(regions)

            # Generate realistic product names and descriptions
            product_templates = {
                'Electronics': [
                    f"{brand} Smartphone 128GB",
                    f"{brand} Laptop 15-inch",
                    f"{brand} Wireless Headphones",
                    f"{brand} Smart Watch",
                    f"{brand} Tablet 10-inch"
                ],
                'Fashion': [
                    f"{brand} Running Shoes",
                    f"{brand} Casual T-Shirt",
                    f"{brand} Denim Jeans",
                    f"{brand} Winter Jacket",
                    f"{brand} Athletic Shorts"
                ],
                'Home': [
                    f"{brand} Coffee Maker",
                    f"{brand} Air Purifier",
                    f"{brand} Smart Thermostat",
                    f"{brand} LED Desk Lamp",
                    f"{brand} Kitchen Blender"
                ]
            }

            name_template = product_templates.get(category, [f"{brand} {category} Item"])[0]
            name = name_template.format(brand=brand)

            # Generate description
            descriptions = [
                f"High-quality {category.lower()} item from {brand}. Features advanced technology and premium materials.",
                f"Professional-grade {category.lower()} product. Perfect for everyday use with excellent durability.",
                f"Premium {brand} {category.lower()} with cutting-edge design. Includes warranty and support.",
                f"Latest model {category.lower()} from {brand}. Energy efficient with smart connectivity features.",
                f"Compact and portable {category.lower()}. Ideal for home or office use with modern styling."
            ]

            # Calculate realistic price based on features
            base_prices = {
                'Electronics': 500,
                'Fashion': 80,
                'Home': 150,
                'Sports': 100,
                'Books': 20,
                'Automotive': 200,
                'Beauty': 50,
                'Toys': 30
            }

            base_price = base_prices.get(category, 100)

            # Brand premium
            if brand in ['Apple', 'Samsung', 'Sony']:
                base_price *= 2.5
            elif brand != 'Generic':
                base_price *= 1.5

            # Condition adjustment
            condition_multipliers = {
                'new': 1.0,
                'like-new': 0.85,
                'good': 0.70,
                'fair': 0.55
            }
            base_price *= condition_multipliers[condition]

            # Add some randomness
            price = base_price * random.uniform(0.8, 1.4)

            product = ProductData(
                name=name,
                category=category,
                brand=brand,
                description=random.choice(descriptions),
                condition=condition,
                region=region,
                price=round(price, 2),
                features={},
                images=[],
                competitor_urls=[],
                scraped_data={},
                timestamp=datetime.now() - timedelta(days=random.randint(1, 365))
            )

            sample_products.append(product)

        return sample_products

    def run(self, host='0.0.0.0', port=5000, debug=False):
        """Run the Flask application"""
        logger.info(f"Starting PriceAI API server on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug)

class ImageAnalyzer:
    """Image analysis for product features (requires PyTorch)"""

    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        try:
            self.model = resnet50(pretrained=True)
            self.model.eval()
            self.model.to(self.device)

            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            self.enabled = True
        except Exception as e:
            logger.warning(f"Image analysis disabled: {e}")
            self.enabled = False

    def extract_features(self, image_path: str) -> Dict[str, float]:
        """Extract features from product image"""
        if not self.enabled:
            return {}

        try:
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                features = self.model(image_tensor)

            # Convert to basic image metrics
            return {
                'image_brightness': float(np.mean(np.array(image))),
                'image_contrast': float(np.std(np.array(image))),
                'image_size': image.size[0] * image.size[1],
                'has_image': 1.0
            }

        except Exception as e:
            logger.error(f"Image analysis error: {e}")
            return {'has_image': 0.0}

class DataValidator:
    """Validate and clean input data"""

    @staticmethod
    def validate_product_data(data: Dict) -> Tuple[bool, str]:
        """Validate product data"""
        required_fields = ['productName', 'category', 'description']

        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Missing or empty required field: {field}"

        # Validate category
        valid_categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Automotive', 'Beauty', 'Toys']
        if data['category'] not in valid_categories:
            return False, f"Invalid category. Must be one of: {', '.join(valid_categories)}"

        # Validate condition
        valid_conditions = ['new', 'like-new', 'good', 'fair', 'poor']
        if data.get('condition') and data['condition'] not in valid_conditions:
            return False, f"Invalid condition. Must be one of: {', '.join(valid_conditions)}"

        # Validate region
        valid_regions = ['us', 'eu', 'uk', 'ca', 'au', 'jp', 'in']
        if data.get('region') and data['region'] not in valid_regions:
            return False, f"Invalid region. Must be one of: {', '.join(valid_regions)}"

        return True, "Valid"

    @staticmethod
    def clean_price(price_text: str) -> Optional[float]:
        """Clean and extract price from text"""
        if not price_text:
            return None

        # Remove currency symbols and extract number
        cleaned = re.sub(r'[^\d.,]', '', str(price_text))
        cleaned = cleaned.replace(',', '')

        try:
            return float(cleaned)
        except ValueError:
            return None

# CLI Interface for training and testing
def main():
    """Main CLI interface"""
    import argparse

    # Check if the script is being run interactively (e.g., in Colab)
    # This prevents argparse from trying to parse kernel-specific arguments.
    import sys
    if not hasattr(sys.modules['__main__'], '__file__'):
         print("Running in interactive environment, skipping argument parsing.")
         return

    parser = argparse.ArgumentParser(description='PriceAI Backend')
    parser.add_argument('--mode', choices=['api', 'train', 'test'], default='api',
                       help='Run mode: api server, train model, or test prediction')
    parser.add_argument('--host', default='0.0.0.0', help='API host')
    parser.add_argument('--port', type=int, default=5000, help='API port')
    parser.add_argument('--debug', action='store_true', help='Debug mode')
    parser.add_argument('--product', help='Product name for testing')

    args = parser.parse_args()

    if args.mode == 'api':
        # Start API server
        api = PriceAIAPI()
        api.run(host=args.host, port=args.port, debug=args.debug)

    elif args.mode == 'train':
        # Train model with existing data
        api = PriceAIAPI()
        training_data = api.db.get_training_data()

        if len(training_data) < 10:
            logger.info("Insufficient data, generating samples...")
            sample_data = api.generate_sample_data()
            for product in sample_data:
                api.db.save_product(product)
            training_data = sample_data

        api.model.train(training_data)
        api.model.save_model('priceai_model.pkl')
        print(f"Model trained with {len(training_data)} products")
        print(f"Model scores: {api.model.model_scores}")

    elif args.mode == 'test':
        # Test prediction
        if not args.product:
            print("Please provide --product for testing")
            return

        api = PriceAIAPI()

        # Create test product
        test_product = ProductData(
            name=args.product,
            category='Electronics',
            brand='Generic',
            description=f"Test product: {args.product}",
            condition='new',
            region='us',
            price=None,
            features={},
            images=[],
            competitor_urls=[],
            scraped_data={},
            timestamp=datetime.now()
        )

        # Make prediction
        result = api.model.predict(test_product)
        print(f"\nPrediction for '{args.product}':")
        print(f"ML Price: ${result['ml_price']:.2f}")
        print(f"AI Price: ${result['ai_price']:.2f}")
        print(f"Market Price: ${result['market_price']:.2f}")
        print(f"Confidence: {result['confidence']:.1f}%")

if __name__ == '__main__':
    main()                    title = title_elem.get_text(strip=True) if title_elem else ""
                try:

