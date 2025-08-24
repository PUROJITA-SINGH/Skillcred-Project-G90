/**
 * PriceAI API Client - Handles all backend communication
 */

class PriceAIAPI {
    constructor() {
        // Configure API base URL - update this to match your backend
        this.baseURL = process.env.API_URL || 'http://localhost:5000/api';
        this.timeout = 30000; // 30 seconds timeout
        this.maxRetries = 3;
        
        // API endpoints based on the backend structure
        this.endpoints = {
            // Health and status
            health: '/health',
            status: '/status',
            
            // Price prediction
            predict: '/predict',
            predictBatch: '/predict/batch',
            
            // Data scraping
            scrape: '/scrape',
            scrapeStatus: '/scrape/status',
            scrapeStop: '/scrape/stop',
            
            // Data management
            data: '/data',
            dataExport: '/data/export',
            dataClear: '/data/clear',
            
            // Analytics
            analytics: '/analytics',
            trends: '/analytics/trends',
            performance: '/analytics/performance',
            categories: '/analytics/categories',
            
            // Model management
            models: '/models',
            modelTrain: '/models/train',
            modelStatus: '/models/status'
        };
        
        this.isConnected = false;
        this.connectionStatusCallbacks = [];
        
        // Initialize connection check
        this.checkConnection();
        setInterval(() => this.checkConnection(), 30000); // Check every 30 seconds
    }

    /**
     * Make HTTP request with error handling and retries
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @param {number} retryCount - Current retry attempt
     * @returns {Promise} Response data
     */
    async makeRequest(url, options = {}, retryCount = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            };

            const response = await fetch(url, { ...defaultOptions, ...options });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } catch (error) {
            clearTimeout(timeoutId);
            
            // Retry logic for network errors
            if (retryCount < this.maxRetries && this.isRetryableError(error)) {
                console.warn(`Request failed, retrying (${retryCount + 1}/${this.maxRetries}):`, error.message);
                await this.delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
                return this.makeRequest(url, options, retryCount + 1);
            }
            
            throw error;
        }
    }

    /**
     * Check if error is retryable
     * @param {Error} error - Error object
     * @returns {boolean} Whether error is retryable
     */
    isRetryableError(error) {
        return error.name === 'AbortError' || 
               error.message.includes('fetch') ||
               error.message.includes('network') ||
               error.message.includes('timeout');
    }

    /**
     * Delay helper for retries
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check backend connection status
     */
    async checkConnection() {
        try {
            await this.makeRequest(this.baseURL + this.endpoints.health, {
                method: 'GET'
            });
            this.setConnectionStatus(true);
        } catch (error) {
            console.warn('Backend connection check failed:', error.message);
            this.setConnectionStatus(false);
        }
    }

    /**
     * Set connection status and notify callbacks
     * @param {boolean} status - Connection status
     */
    setConnectionStatus(status) {
        if (this.isConnected !== status) {
            this.isConnected = status;
            this.connectionStatusCallbacks.forEach(callback => callback(status));
        }
    }

    /**
     * Subscribe to connection status changes
     * @param {Function} callback - Callback function
     */
    onConnectionStatusChange(callback) {
        this.connectionStatusCallbacks.push(callback);
    }

    // === PREDICTION API METHODS ===

    /**
     * Predict price for a single product
     * @param {Object} productData - Product information
     * @returns {Promise} Prediction result
     */
    async predictPrice(productData) {
        return this.makeRequest(this.baseURL + this.endpoints.predict, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Predict prices for multiple products
     * @param {Array} products - Array of product data
     * @returns {Promise} Batch prediction results
     */
    async predictPriceBatch(products) {
        return this.makeRequest(this.baseURL + this.endpoints.predictBatch, {
            method: 'POST',
            body: JSON.stringify({ products })
        });
    }

    // === SCRAPING API METHODS ===

    /**
     * Start web scraping task
     * @param {Object} scrapeConfig - Scraping configuration
     * @returns {Promise} Scraping task information
     */
    async startScraping(scrapeConfig) {
        return this.makeRequest(this.baseURL + this.endpoints.scrape, {
            method: 'POST',
            body: JSON.stringify(scrapeConfig)
        });
    }

    /**
     * Get scraping status
     * @param {string} taskId - Scraping task ID
     * @returns {Promise} Scraping status
     */
    async getScrapingStatus(taskId = null) {
        const url = taskId 
            ? `${this.baseURL}${this.endpoints.scrapeStatus}/${taskId}`
            : `${this.baseURL}${this.endpoints.scrapeStatus}`;
        
        return this.makeRequest(url, {
            method: 'GET'
        });
    }

    /**
     * Stop scraping task
     * @param {string} taskId - Scraping task ID
     * @returns {Promise} Stop confirmation
     */
    async stopScraping(taskId) {
        return this.makeRequest(`${this.baseURL}${this.endpoints.scrapeStop}/${taskId}`, {
            method: 'POST'
        });
    }

    // === DATA API METHODS ===

    /**
     * Get scraped data with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise} Scraped data
     */
    async getData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString 
            ? `${this.baseURL}${this.endpoints.data}?${queryString}`
            : `${this.baseURL}${this.endpoints.data}`;
        
        return this.makeRequest(url, {
            method: 'GET'
        });
    }

    /**
     * Export data to CSV
     * @param {Object} filters - Export filters
     * @returns {Promise} CSV data or download link
     */
    async exportData(filters = {}) {
        return this.makeRequest(this.baseURL + this.endpoints.dataExport, {
            method: 'POST',
            body: JSON.stringify(filters)
        });
    }

    /**
     * Clear all scraped data
     * @returns {Promise} Clear confirmation
     */
    async clearData() {
        return this.makeRequest(this.baseURL + this.endpoints.dataClear, {
            method: 'DELETE'
        });
    }

    // === ANALYTICS API METHODS ===

    /**
     * Get analytics dashboard data
     * @returns {Promise} Analytics data
     */
    async getAnalytics() {
        return this.makeRequest(this.baseURL + this.endpoints.analytics, {
            method: 'GET'
        });
    }

    /**
     * Get price trends data
     * @param {Object} params - Trend parameters
     * @returns {Promise} Trends data
     */
    async getTrends(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString 
            ? `${this.baseURL}${this.endpoints.trends}?${queryString}`
            : `${this.baseURL}${this.endpoints.trends}`;
        
        return this.makeRequest(url, {
            method: 'GET'
        });
    }

    /**
     * Get model performance metrics
     * @returns {Promise} Performance data
     */
    async getModelPerformance() {
        return this.makeRequest(this.baseURL + this.endpoints.performance, {
            method: 'GET'
        });
    }

    /**
     * Get category analysis data
     * @returns {Promise} Category data
     */
    async getCategoryAnalysis() {
        return this.makeRequest(this.baseURL + this.endpoints.categories, {
            method: 'GET'
        });
    }

    // === MODEL API METHODS ===

    /**
     * Get available models
     * @returns {Promise} Models list
     */
    async getModels() {
        return this.makeRequest(this.baseURL + this.endpoints.models, {
            method: 'GET'
        });
    }

    /**
     * Train a new model
     * @param {Object} trainingConfig - Training configuration
     * @returns {Promise} Training task information
     */
    async trainModel(trainingConfig) {
        return this.makeRequest(this.baseURL + this.endpoints.modelTrain, {
            method: 'POST',
            body: JSON.stringify(trainingConfig)
        });
    }

    /**
     * Get model training status
     * @param {string} taskId - Training task ID
     * @returns {Promise} Training status
     */
    async getModelStatus(taskId) {
        return this.makeRequest(`${this.baseURL}${this.endpoints.modelStatus}/${taskId}`, {
            method: 'GET'
        });
    }

    // === UTILITY METHODS ===

    /**
     * Upload file (if backend supports file uploads)
     * @param {FormData} formData - File form data
     * @param {string} endpoint - Upload endpoint
     * @returns {Promise} Upload result
     */
    async uploadFile(formData, endpoint) {
        return this.makeRequest(this.baseURL + endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    /**
     * Download file from URL
     * @param {string} url - File URL
     * @param {string} filename - Download filename
     */
    async downloadFile(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    }

    /**
     * Get API status and configuration
     * @returns {Object} API status information
     */
    getStatus() {
        return {
            baseURL: this.baseURL,
            isConnected: this.isConnected,
            endpoints: this.endpoints,
            timeout: this.timeout,
            maxRetries: this.maxRetries
        };
    }

    /**
     * Update API configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        if (config.baseURL) this.baseURL = config.baseURL;
        if (config.timeout) this.timeout = config.timeout;
        if (config.maxRetries) this.maxRetries = config.maxRetries;
        
        // Recheck connection with new config
        this.checkConnection();
    }
}

// Create global API instance
window.priceAIAPI = new PriceAIAPI();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceAIAPI;
}