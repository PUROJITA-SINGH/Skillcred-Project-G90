/**
 * PriceAI Frontend Main Application
 * Handles UI interactions, navigation, and orchestrates API calls and data visualization
 */

class PriceAIApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.predictionHistory = [];
        this.scrapingTasks = new Map();
        this.notificationQueue = [];
        
        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        this.initializeEventListeners();
        this.initializeNavigation();
        this.initializeConnectionStatus();
        this.loadDashboardData();
        this.setupPeriodicUpdates();
    }

    /**
     * Set up all event listeners
     */
    initializeEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .nav-link-mobile')) {
                e.preventDefault();
                const tab = e.target.getAttribute('href').substring(1);
                this.switchTab(tab);
            }
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Forms
        this.initializeForms();

        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Initialize form handlers
     */
    initializeForms() {
        // Prediction form
        const predictionForm = document.getElementById('predictionForm');
        if (predictionForm) {
            predictionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePredictionSubmit(e);
            });
        }

        // Scraping form
        const scrapingForm = document.getElementById('scrapingForm');
        if (scrapingForm) {
            scrapingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleScrapingSubmit(e);
            });
        }

        // Stop scraping button
        const stopScrapingBtn = document.getElementById('stopScrapingBtn');
        if (stopScrapingBtn) {
            stopScrapingBtn.addEventListener('click', () => {
                this.handleStopScraping();
            });
        }

        // Export data button
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.handleExportData();
            });
        }

        // Clear data button
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.handleClearData();
            });
        }
    }

    /**
     * Set up navigation system
     */
    initializeNavigation() {
        // Show dashboard by default
        this.switchTab('dashboard');
    }

    /**
     * Set up connection status monitoring
     */
    initializeConnectionStatus() {
        if (window.priceAIAPI) {
            window.priceAIAPI.onConnectionStatusChange((isConnected) => {
                this.updateConnectionStatus(isConnected);
            });
        }
    }

    /**
     * Switch between tabs
     * @param {string} tabName - Tab to switch to
     */
    switchTab(tabName) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
            selectedTab.classList.add('fade-in');
        }

        // Update navigation active state
        document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelectorAll(`[href="#${tabName}"]`).forEach(link => {
            link.classList.add('active');
        });

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);

        // Hide mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    }

    /**
     * Load data specific to the current tab
     * @param {string} tabName - Tab name
     */
    async loadTabData(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'analytics':
                    await this.loadAnalyticsData();
                    break;
                case 'scraping':
                    await this.loadScrapingData();
                    break;
                case 'prediction':
                    await this.loadPredictionHistory();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName} data:`, error);
            this.showNotification(`Failed to load ${tabName} data`, 'error');
        }
    }

    /**
     * Load dashboard statistics
     */
    async loadDashboardData() {
        try {
            const analytics = await window.priceAIAPI.getAnalytics();
            
            // Update dashboard cards
            this.updateElement('totalProducts', analytics.totalProducts || 0);
            this.updateElement('predictionsToday', analytics.predictionsToday || 0);
            this.updateElement('modelAccuracy', (analytics.modelAccuracy || 0) + '%');
            this.updateElement('scrapedUrls', analytics.scrapedUrls || 0);

            // Update recent activity
            this.updateRecentActivity(analytics.recentActivity || []);

        } catch (error) {
            console.error('Dashboard data loading failed:', error);
            // Show placeholder data for demo
            this.updateElement('totalProducts', '1,234');
            this.updateElement('predictionsToday', '56');
            this.updateElement('modelAccuracy', '89.2%');
            this.updateElement('scrapedUrls', '892');
            
            this.updateRecentActivity([
                { type: 'prediction', message: 'Price predicted for iPhone 14', time: '2 minutes ago' },
                { type: 'scraping', message: 'Scraped 25 products from Amazon', time: '15 minutes ago' },
                { type: 'training', message: 'Model training completed', time: '1 hour ago' }
            ]);
        }
    }

    /**
     * Load analytics data and update charts
     */
    async loadAnalyticsData() {
        try {
            const [trends, performance, categories] = await Promise.all([
                window.priceAIAPI.getTrends(),
                window.priceAIAPI.getModelPerformance(),
                window.priceAIAPI.getCategoryAnalysis()
            ]);

            // Update charts with real data
            if (window.priceAICharts) {
                if (trends) {
                    window.priceAICharts.updatePriceTrendsChart(
                        trends.labels,
                        trends.predicted,
                        trends.actual
                    );
                }

                if (performance) {
                    window.priceAICharts.updateModelPerformanceChart(performance);
                }

                if (categories) {
                    window.priceAICharts.updateCategoryChart(categories);
                }
            }

        } catch (error) {
            console.error('Analytics data loading failed:', error);
            this.showNotification('Using sample analytics data', 'warning');
        }
    }

    /**
     * Load scraping data
     */
    async loadScrapingData() {
        try {
            const scrapingStatus = await window.priceAIAPI.getScrapingStatus();
            this.updateScrapingStatus(scrapingStatus);

            const data = await window.priceAIAPI.getData({ limit: 100 });
            this.updateScrapedDataTable(data.items || []);

        } catch (error) {
            console.error('Scraping data loading failed:', error);
            this.showNotification('Failed to load scraping data', 'error');
        }
    }

    /**
     * Load prediction history
     */
    async loadPredictionHistory() {
        try {
            // In a real app, this would come from the backend
            const historyTable = document.getElementById('predictionHistory');
            if (historyTable && this.predictionHistory.length > 0) {
                this.updatePredictionHistoryTable();
            }
        } catch (error) {
            console.error('Prediction history loading failed:', error);
        }
    }

    /**
     * Handle prediction form submission
     * @param {Event} event - Form submit event
     */
    async handlePredictionSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());

        // Convert checkbox to boolean
        productData.enableScraping = formData.has('enableScraping');

        try {
            this.showLoading('Predicting price...');
            
            const result = await window.priceAIAPI.predictPrice(productData);
            
            // Display results
            this.displayPredictionResults(result);
            
            // Add to history
            this.addToPredictionHistory({
                ...productData,
                ...result,
                timestamp: new Date()
            });

            this.showNotification('Price prediction completed successfully!', 'success');

        } catch (error) {
            console.error('Prediction failed:', error);
            this.showNotification('Prediction failed: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle scraping form submission
     * @param {Event} event - Form submit event
     */
    async handleScrapingSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        
        const urls = formData.get('scrapingUrls').split('\n').filter(url => url.trim());
        const scrapeConfig = {
            urls,
            mode: formData.get('scrapingMode'),
            maxPages: parseInt(formData.get('maxPages'))
        };

        try {
            this.showLoading('Starting web scraping...');
            
            const result = await window.priceAIAPI.startScraping(scrapeConfig);
            
            // Track scraping task
            this.scrapingTasks.set(result.taskId, {
                id: result.taskId,
                status: 'running',
                startTime: new Date(),
                config: scrapeConfig
            });

            // Update UI
            this.updateScrapingControls(true);
            this.showNotification('Scraping started successfully!', 'success');

            // Start monitoring
            this.monitorScrapingTask(result.taskId);

        } catch (error) {
            console.error('Scraping failed to start:', error);
            this.showNotification('Failed to start scraping: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle stop scraping
     */
    async handleStopScraping() {
        try {
            const activeTasks = Array.from(this.scrapingTasks.values())
                .filter(task => task.status === 'running');

            for (const task of activeTasks) {
                await window.priceAIAPI.stopScraping(task.id);
                task.status = 'stopped';
            }

            this.updateScrapingControls(false);
            this.showNotification('Scraping stopped', 'warning');

        } catch (error) {
            console.error('Failed to stop scraping:', error);
            this.showNotification('Failed to stop scraping: ' + error.message, 'error');
        }
    }

    /**
     * Handle data export
     */
    async handleExportData() {
        try {
            this.showLoading('Exporting data...');
            
            const result = await window.priceAIAPI.exportData();
            
            if (result.downloadUrl) {
                await window.priceAIAPI.downloadFile(result.downloadUrl, 'scraped_data.csv');
                this.showNotification('Data exported successfully!', 'success');
            }

        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export data: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle data clearing
     */
    async handleClearData() {
        if (!confirm('Are you sure you want to clear all scraped data? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading('Clearing data...');
            
            await window.priceAIAPI.clearData();
            
            // Update UI
            this.updateScrapedDataTable([]);
            this.showNotification('Data cleared successfully!', 'success');

        } catch (error) {
            console.error('Clear data failed:', error);
            this.showNotification('Failed to clear data: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Display prediction results
     * @param {Object} result - Prediction result
     */
    displayPredictionResults(result) {
        const resultsContainer = document.getElementById('predictionResults');
        if (!resultsContainer) return;

        const html = `
            <div class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                        <h4 class="text-lg font-semibold text-blue-900">Predicted Price</h4>
                        <span class="text-2xl font-bold text-blue-600">$${result.predictedPrice?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <p class="text-sm text-blue-700 mt-2">
                        Confidence: ${result.confidence ? (result.confidence * 100).toFixed(1) : 'N/A'}%
                    </p>
                </div>

                ${result.priceRange ? `
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div class="text-sm text-red-600">Lower Bound</div>
                        <div class="text-lg font-semibold text-red-800">$${result.priceRange.lower?.toFixed(2)}</div>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div class="text-sm text-green-600">Upper Bound</div>
                        <div class="text-lg font-semibold text-green-800">$${result.priceRange.upper?.toFixed(2)}</div>
                    </div>
                </div>
                ` : ''}

                ${result.modelUsed ? `
                <div class="text-sm text-gray-600">
                    <span class="font-medium">Model used:</span> ${result.modelUsed}
                </div>
                ` : ''}

                ${result.factors ? `
                <div class="mt-4">
                    <h5 class="font-medium text-gray-900 mb-2">Key Factors:</h5>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${result.factors.map(factor => `<li>• ${factor}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;

        resultsContainer.innerHTML = html;
        resultsContainer.classList.add('slide-in');
    }

    /**
     * Add prediction to history
     * @param {Object} prediction - Prediction data
     */
    addToPredictionHistory(prediction) {
        this.predictionHistory.unshift(prediction);
        
        // Keep only last 50 predictions
        if (this.predictionHistory.length > 50) {
            this.predictionHistory = this.predictionHistory.slice(0, 50);
        }

        this.updatePredictionHistoryTable();
    }

    /**
     * Update prediction history table
     */
    updatePredictionHistoryTable() {
        const tbody = document.getElementById('predictionHistory');
        if (!tbody) return;

        if (this.predictionHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No predictions yet</td></tr>';
            return;
        }

        const html = this.predictionHistory.map(prediction => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.truncateText(prediction.productUrl || 'N/A', 50)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="badge badge-secondary">${prediction.category || 'N/A'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $${prediction.predictedPrice?.toFixed(2) || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${prediction.confidence ? (prediction.confidence * 100).toFixed(1) : 'N/A'}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDate(prediction.timestamp)}
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    /**
     * Monitor scraping task progress
     * @param {string} taskId - Task ID to monitor
     */
    async monitorScrapingTask(taskId) {
        const checkStatus = async () => {
            try {
                const status = await window.priceAIAPI.getScrapingStatus(taskId);
                const task = this.scrapingTasks.get(taskId);
                
                if (task) {
                    task.status = status.status;
                    task.progress = status.progress;
                    task.itemsScraped = status.itemsScraped;
                }

                this.updateScrapingStatus([status]);

                if (status.status === 'completed' || status.status === 'failed') {
                    this.updateScrapingControls(false);
                    if (status.status === 'completed') {
                        this.showNotification('Scraping completed successfully!', 'success');
                        await this.loadScrapingData(); // Refresh data
                    } else {
                        this.showNotification('Scraping failed: ' + status.error, 'error');
                    }
                    return;
                }

                // Continue monitoring
                setTimeout(checkStatus, 2000);

            } catch (error) {
                console.error('Failed to check scraping status:', error);
                setTimeout(checkStatus, 5000); // Retry with longer delay
            }
        };

        checkStatus();
    }

    /**
     * Update scraping status display
     * @param {Array} statuses - Array of scraping statuses
     */
    updateScrapingStatus(statuses) {
        const container = document.getElementById('scrapingStatus');
        if (!container) return;

        if (!statuses || statuses.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spider text-4xl mb-4"></i>
                    <p>No active scraping sessions</p>
                </div>
            `;
            return;
        }

        const html = statuses.map(status => `
            <div class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">Task: ${status.taskId}</h4>
                    <span class="badge ${this.getStatusBadgeClass(status.status)}">${status.status}</span>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>${status.progress || 0}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${status.progress || 0}%"></div>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                        <span>Items scraped: ${status.itemsScraped || 0}</span>
                        <span>Started: ${this.formatDate(status.startTime)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * Update scraped data table
     * @param {Array} data - Scraped data array
     */
    updateScrapedDataTable(data) {
        const tbody = document.getElementById('scrapedDataTable');
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No scraped data yet</td></tr>';
            return;
        }

        const html = data.map(item => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <a href="${item.url}" target="_blank" class="hover:underline">
                        ${this.truncateText(item.url, 50)}
                    </a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.truncateText(item.title || 'N/A', 40)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${item.price ? '$' + item.price : 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="badge badge-secondary">${item.category || 'N/A'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDate(item.scrapedAt)}
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    /**
     * Update scraping control buttons
     * @param {boolean} isRunning - Whether scraping is running
     */
    updateScrapingControls(isRunning) {
        const startBtn = document.getElementById('startScrapingBtn');
        const stopBtn = document.getElementById('stopScrapingBtn');

        if (startBtn) {
            startBtn.disabled = isRunning;
            startBtn.innerHTML = isRunning 
                ? '<i class="fas fa-spinner fa-spin mr-2"></i>Scraping...'
                : '<i class="fas fa-play mr-2"></i>Start Scraping';
        }

        if (stopBtn) {
            stopBtn.disabled = !isRunning;
        }
    }

    /**
     * Update recent activity
     * @param {Array} activities - Recent activities
     */
    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="text-sm text-gray-500">No recent activity</div>';
            return;
        }

        const html = activities.map(activity => `
            <div class="flex items-center space-x-3 py-2">
                <div class="flex-shrink-0">
                    <i class="fas ${this.getActivityIcon(activity.type)} text-${this.getActivityColor(activity.type)}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">${activity.message}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * Update connection status indicator
     * @param {boolean} isConnected - Connection status
     */
    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        statusElement.className = isConnected 
            ? 'flex items-center px-3 py-1 rounded-full text-xs font-medium status-connected'
            : 'flex items-center px-3 py-1 rounded-full text-xs font-medium status-disconnected';

        statusElement.innerHTML = isConnected
            ? '<i class="fas fa-circle mr-1"></i>Connected'
            : '<i class="fas fa-circle mr-1"></i>Disconnected';
    }

    /**
     * Set up periodic data updates
     */
    setupPeriodicUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000);

        // Update analytics every 60 seconds
        setInterval(() => {
            if (this.currentTab === 'analytics') {
                this.loadAnalyticsData();
            }
        }, 60000);
    }

    // === UTILITY METHODS ===

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = document.getElementById('loadingMessage');
        
        if (overlay) {
            overlay.classList.remove('hidden');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas ${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button type="button" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Add close functionality
        notification.querySelector('button').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Update element content safely
     * @param {string} elementId - Element ID
     * @param {string} content - Content to set
     */
    updateElement(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        return d.toLocaleString();
    }

    /**
     * Get activity icon class
     * @param {string} type - Activity type
     * @returns {string} Icon class
     */
    getActivityIcon(type) {
        const icons = {
            prediction: 'fa-chart-line',
            scraping: 'fa-spider',
            training: 'fa-robot',
            export: 'fa-download',
            error: 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }

    /**
     * Get activity color class
     * @param {string} type - Activity type
     * @returns {string} Color class
     */
    getActivityColor(type) {
        const colors = {
            prediction: 'primary',
            scraping: 'secondary',
            training: 'accent',
            export: 'success',
            error: 'danger'
        };
        return colors[type] || 'gray-500';
    }

    /**
     * Get status badge class
     * @param {string} status - Status type
     * @returns {string} Badge class
     */
    getStatusBadgeClass(status) {
        const classes = {
            running: 'badge-primary',
            completed: 'badge-success',
            failed: 'badge-danger',
            stopped: 'badge-warning',
            pending: 'badge-secondary'
        };
        return classes[status] || 'badge-secondary';
    }

    /**
     * Get notification icon
     * @param {string} type - Notification type
     * @returns {string} Icon class
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    /**
     * Cleanup function
     */
    cleanup() {
        // Clear intervals, remove event listeners, etc.
        console.log('Cleaning up PriceAI app...');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.priceAIApp = new PriceAIApp();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceAIApp;
}