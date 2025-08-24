# PriceAI Backend - Comprehensive Setup Guide

## 🚀 Overview

PriceAI Backend is a comprehensive Python pipeline that provides advanced e-commerce price prediction using machine learning, web scraping, and real-time market analysis. It integrates seamlessly with the PriceAI frontend to deliver accurate pricing intelligence.

## 📋 Features

### Core Capabilities
- **Advanced ML Models**: Ensemble of Random Forest, Gradient Boosting, Ridge, and Elastic Net
- **Web Scraping**: Multi-platform scraping (Amazon, eBay, Walmart)
- **Feature Engineering**: Text analysis, sentiment scoring, categorical encoding
- **Image Analysis**: Optional computer vision for product images
- **Real-time API**: RESTful API with comprehensive endpoints
- **Database Management**: SQLite with automated migrations
- **Batch Processing**: CSV upload for bulk predictions

# PriceAI Frontend - E-commerce Price Prediction System

A modern, responsive web interface for the PriceAI backend system that provides comprehensive e-commerce price prediction, web scraping, and analytics capabilities.

## 🎯 Project Overview

PriceAI Frontend is a sophisticated web application that interfaces with a Python backend to deliver:

- **Real-time Price Predictions** using machine learning models
- **Web Scraping Management** for e-commerce data collection
- **Interactive Analytics Dashboard** with dynamic charts and visualizations
- **Responsive Design** optimized for desktop and mobile devices

## ✨ Currently Completed Features

### 🏠 Dashboard
- **Real-time Statistics Cards**: Total products, daily predictions, model accuracy, scraped URLs
- **Recent Activity Feed**: Live updates of system activities
- **Connection Status Indicator**: Backend connectivity monitoring
- **Responsive Grid Layout**: Optimized for all screen sizes

### 🔮 Price Prediction
- **Interactive Prediction Form**: 
  - Product URL input with validation
  - Category selection (Electronics, Clothing, Home & Garden, Books, Sports, Beauty)
  - Brand and condition specification
  - Product description text area
  - Optional web scraping toggle
- **Real-time Results Display**: 
  - Predicted price with confidence levels
  - Price range (upper/lower bounds)
  - Model identification
  - Key factors analysis
- **Prediction History Table**: Complete history with pagination and search

### 📊 Analytics Dashboard
- **Price Trends Chart**: Interactive line chart showing predicted vs actual prices over time
- **Model Performance Chart**: Bar chart comparing accuracy of different ML models
- **Category Distribution**: Doughnut chart showing product category breakdown
- **Price Range Analysis**: Histogram of product price distributions
- **Real-time Data Updates**: Charts update automatically with fresh data

### 🕷️ Data Scraping
- **Scraping Control Panel**:
  - Multi-URL input (batch processing)
  - Scraping mode selection (Basic HTML, Selenium, Async Batch)
  - Maximum pages configuration
  - Start/Stop controls
- **Real-time Progress Monitoring**: Live progress bars and status updates
- **Scraped Data Management**: 
  - Interactive data table with sorting and filtering
  - CSV export functionality
  - Data clearing with confirmation
- **Task Management**: Multiple concurrent scraping tasks support

### 🎨 User Interface
- **Modern Design**: Clean, professional interface using Tailwind CSS
- **Responsive Layout**: Mobile-first design with collapsible navigation
- **Interactive Components**: Hover effects, animations, and transitions
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
- **Dark/Light Mode**: System preference detection and manual toggle

### 🔧 Technical Features
- **API Integration**: Comprehensive REST API client with error handling
- **Real-time Updates**: WebSocket-like polling for live data
- **Data Visualization**: Chart.js integration with custom themes
- **Error Handling**: User-friendly error messages and notifications
- **Loading States**: Smooth loading indicators and skeleton screens
- **Offline Support**: Graceful degradation when backend is unavailable

## 🛠️ Technology Stack

### Frontend Libraries & CDN Resources
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Chart.js**: Flexible JavaScript charting library for data visualization
- **Font Awesome**: Comprehensive icon library
- **Google Fonts**: Inter font family for modern typography
- **Vanilla JavaScript**: Pure JavaScript for optimal performance

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- PriceAI Backend server running (see backend documentation)
- Internet connection for CDN resources

### Installation
1. Clone or download the frontend files
2. Update the API base URL in `js/api.js` to match your backend server
3. Open `index.html` in a web browser or serve via HTTP server
4. The application will automatically attempt to connect to the backend

### Configuration
- **API URL**: Update `baseURL` in `js/api.js` to your backend server
- **Polling Intervals**: Modify update frequencies in `js/main.js`
- **Chart Themes**: Customize colors and styling in `js/charts.js`

