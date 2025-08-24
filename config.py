# config.py - Configuration settings for PriceAI

import os
from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class Config:
    """Configuration settings for PriceAI"""
    
    # Database settings
    DATABASE_URL: str = "sqlite:///priceai.db"
    DATABASE_BACKUP_INTERVAL: int = 24  # hours
    
    # API settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 5000
    API_DEBUG: bool = False
    API_SECRET_KEY: str = "your-secret-key-change-this"
    
    # Scraping settings
    SCRAPING_ENABLED: bool = True
    SCRAPING_DELAY: float = 1.0  # seconds between requests
    SCRAPING_TIMEOUT: int = 30
    SCRAPING_RETRIES: int = 3
    
    # Model settings
    MODEL_PATH: str = "models/priceai_model.pkl"
    MODEL_RETRAIN_INTERVAL: int = 168  # hours (1 week)
    MODEL_MIN_TRAINING_SAMPLES: int = 50
    
    # Feature settings
    MAX_DESCRIPTION_LENGTH: int = 5000
    MAX_COMPETITORS: int = 20
    IMAGE_ANALYSIS_ENABLED: bool = True
    SENTIMENT_ANALYSIS_ENABLED: bool = True
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Supported platforms
    SUPPORTED_PLATFORMS: List[str] = None
    
    # Regional settings
    SUPPORTED_REGIONS: List[str] = None
    DEFAULT_REGION: str = "us"
    
    # Category settings
    SUPPORTED_CATEGORIES: List[str] = None
    
    def __post_init__(self):
        """Initialize default values"""
        if self.SUPPORTED_PLATFORMS is None:
            self.SUPPORTED_PLATFORMS = ['amazon', 'ebay', 'walmart', 'bestbuy']
        
        if self.SUPPORTED_REGIONS is None:
            self.SUPPORTED_REGIONS = ['us', 'eu', 'uk', 'ca', 'au', 'jp', 'in']
        
        if self.SUPPORTED_CATEGORIES is None:
            self.SUPPORTED_CATEGORIES = [
                'Electronics', 'Fashion', 'Home', 'Sports', 
                'Books', 'Automotive', 'Beauty', 'Toys'
            ]
    
    @classmethod
    def from_env(cls) -> 'Config':
        """Load configuration from environment variables"""
        return cls(
            DATABASE_URL=os.getenv('DATABASE_URL', 'sqlite:///priceai.db'),
            API_HOST=os.getenv('API_HOST', '0.0.0.0'),
            API_PORT=int(os.getenv('API_PORT', '5000')),
            API_DEBUG=os.getenv('API_DEBUG', 'False').lower() == 'true',
            API_SECRET_KEY=os.getenv('API_SECRET_KEY', 'your-secret-key-change-this'),
            SCRAPING_ENABLED=os.getenv('SCRAPING_ENABLED', 'True').lower() == 'true',
            MODEL_PATH=os.getenv('MODEL_PATH', 'models/priceai_model.pkl'),
            IMAGE_ANALYSIS_ENABLED=os.getenv('IMAGE_ANALYSIS_ENABLED', 'True').lower() == 'true',
        )

# docker-compose.yml content as string
DOCKER_COMPOSE_CONTENT = """
version: '3.8'

services:
  priceai-backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - API_HOST=0.0.0.0
      - API_PORT=5000
      - DATABASE_URL=sqlite:///data/priceai.db
      - SCRAPING_ENABLED=true
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/stats"]
      interval: 30s
      timeout: 10s
      retries: 3

  priceai-frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - priceai-backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
"""

# Dockerfile content as string
DOCKERFILE_CONTENT = """
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    wget \\
    curl \\
    unzip \\
    && rm -rf /var/lib/apt/lists/*

# Install Chrome for Selenium
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \\
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \\
    && apt-get update \\
    && apt-get install -y google-chrome-stable \\
    && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE` \\
    && wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip \\
    && unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/ \\
    && rm /tmp/chromedriver.zip \\
    && chmod +x /usr/local/bin/chromedriver

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('punkt')"

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p data models logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:5000/api/stats || exit 1

# Run application
CMD ["python", "-m", "priceai_backend", "--mode", "api", "--host", "0.0.0.0", "--port", "5000"]
"""

# nginx.conf content as string
NGINX_CONFIG = """
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream backend {
        server priceai-backend:5000;
    }

    server {
        listen 80;
        server_name localhost;

        # Serve frontend
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            
            # Handle preflight requests
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin *;
                add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
                add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type 'text/plain charset=UTF-8';
                add_header Content-Length 0;
                return 204;
            }
        }

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types
            text/plain
            text/css
            text/js
            text/xml
            text/javascript
            application/javascript
            application/xml+rss
            application/json;
    }
}
"""

def create_deployment_files():
    """Create deployment configuration files"""
    
    # Create docker-compose.yml
    with open('docker-compose.yml', 'w') as f:
        f.write(DOCKER_COMPOSE_CONTENT)
    
    # Create Dockerfile
    with open('Dockerfile', 'w') as f:
        f.write(DOCKERFILE_CONTENT)
    
    # Create nginx.conf
    with open('nginx.conf', 'w') as f:
        f.write(NGINX_CONFIG)
    
    # Create .env file template
    with open('.env.example', 'w') as f:
        f.write("""# PriceAI Environment Configuration

# API Settings
API_HOST=0.0.0.0
API_PORT=5000
API_DEBUG=false
API_SECRET_KEY=your-secret-key-change-this

# Database
DATABASE_URL=sqlite:///data/priceai.db

# Scraping
SCRAPING_ENABLED=true
SCRAPING_DELAY=1.0

# Model
MODEL_PATH=models/priceai_model.pkl
IMAGE_ANALYSIS_ENABLED=true

# Features
MAX_DESCRIPTION_LENGTH=5000
RATE_LIMIT_PER_MINUTE=60
""")
    
    print("Deployment files created successfully!")
    print("- docker-compose.yml")
    print("- Dockerfile") 
    print("- nginx.conf")
    print("- .env.example")

if __name__ == '__main__':
    create_deployment_files()
