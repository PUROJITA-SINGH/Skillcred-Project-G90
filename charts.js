/**
 * PriceAI Charts - Data visualization components using Chart.js
 */

class PriceAICharts {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#f59e0b',
            success: '#10b981',
            danger: '#ef4444',
            purple: '#8b5cf6',
            pink: '#ec4899',
            teal: '#14b8a6'
        };
        this.initializeCharts();
    }

    /**
     * Initialize all charts on page load
     */
    initializeCharts() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createAllCharts();
            });
        } else {
            this.createAllCharts();
        }
    }

    /**
     * Create all charts
     */
    createAllCharts() {
        this.createPriceTrendsChart();
        this.createModelPerformanceChart();
        this.createCategoryChart();
        this.createPriceRangeChart();
    }

    /**
     * Price Trends Chart - Line chart showing price trends over time
     */
    createPriceTrendsChart() {
        const ctx = document.getElementById('priceTrendsChart');
        if (!ctx) return;

        // Sample data - replace with real API data
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Average Predicted Price',
                    data: [450, 465, 420, 480, 495, 510, 485, 520, 545, 530, 565, 580],
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.chartColors.primary + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Actual Market Price',
                    data: [440, 455, 425, 470, 485, 500, 475, 510, 535, 525, 555, 570],
                    borderColor: this.chartColors.success,
                    backgroundColor: this.chartColors.success + '20',
                    tension: 0.4,
                    fill: false
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#374151',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        this.charts.priceTrends = new Chart(ctx, config);
    }

    /**
     * Model Performance Chart - Bar chart showing different model accuracies
     */
    createModelPerformanceChart() {
        const ctx = document.getElementById('modelPerformanceChart');
        if (!ctx) return;

        const data = {
            labels: ['Random Forest', 'Gradient Boosting', 'Ridge Regression', 'Elastic Net', 'Neural Network'],
            datasets: [{
                label: 'Model Accuracy (%)',
                data: [87.5, 89.2, 82.1, 84.3, 91.8],
                backgroundColor: [
                    this.chartColors.primary,
                    this.chartColors.success,
                    this.chartColors.accent,
                    this.chartColors.purple,
                    this.chartColors.teal
                ],
                borderColor: [
                    this.chartColors.primary,
                    this.chartColors.success,
                    this.chartColors.accent,
                    this.chartColors.purple,
                    this.chartColors.teal
                ],
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#374151',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '% accuracy';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };

        this.charts.modelPerformance = new Chart(ctx, config);
    }

    /**
     * Category Distribution Chart - Doughnut chart showing category breakdown
     */
    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const data = {
            labels: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports & Outdoors', 'Beauty & Personal Care'],
            datasets: [{
                data: [35, 25, 15, 10, 10, 5],
                backgroundColor: [
                    this.chartColors.primary,
                    this.chartColors.success,
                    this.chartColors.accent,
                    this.chartColors.purple,
                    this.chartColors.pink,
                    this.chartColors.teal
                ],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 4
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#374151',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        };

        this.charts.category = new Chart(ctx, config);
    }

    /**
     * Price Range Analysis Chart - Histogram showing price distribution
     */
    createPriceRangeChart() {
        const ctx = document.getElementById('priceRangeChart');
        if (!ctx) return;

        const data = {
            labels: ['$0-50', '$50-100', '$100-250', '$250-500', '$500-1000', '$1000+'],
            datasets: [{
                label: 'Number of Products',
                data: [120, 250, 180, 95, 45, 20],
                backgroundColor: this.chartColors.primary + '80',
                borderColor: this.chartColors.primary,
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#374151',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' products';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                }
            }
        };

        this.charts.priceRange = new Chart(ctx, config);
    }

    /**
     * Update price trends chart with new data
     * @param {Array} labels - Time labels
     * @param {Array} predictedData - Predicted price data
     * @param {Array} actualData - Actual price data
     */
    updatePriceTrendsChart(labels, predictedData, actualData) {
        if (!this.charts.priceTrends) return;

        this.charts.priceTrends.data.labels = labels;
        this.charts.priceTrends.data.datasets[0].data = predictedData;
        if (actualData) {
            this.charts.priceTrends.data.datasets[1].data = actualData;
        }
        this.charts.priceTrends.update('active');
    }

    /**
     * Update model performance chart with new data
     * @param {Object} modelData - Object containing model names and accuracies
     */
    updateModelPerformanceChart(modelData) {
        if (!this.charts.modelPerformance) return;

        this.charts.modelPerformance.data.labels = Object.keys(modelData);
        this.charts.modelPerformance.data.datasets[0].data = Object.values(modelData);
        this.charts.modelPerformance.update('active');
    }

    /**
     * Update category chart with new data
     * @param {Object} categoryData - Object containing category names and percentages
     */
    updateCategoryChart(categoryData) {
        if (!this.charts.category) return;

        this.charts.category.data.labels = Object.keys(categoryData);
        this.charts.category.data.datasets[0].data = Object.values(categoryData);
        this.charts.category.update('active');
    }

    /**
     * Update price range chart with new data
     * @param {Object} rangeData - Object containing price ranges and counts
     */
    updatePriceRangeChart(rangeData) {
        if (!this.charts.priceRange) return;

        this.charts.priceRange.data.labels = Object.keys(rangeData);
        this.charts.priceRange.data.datasets[0].data = Object.values(rangeData);
        this.charts.priceRange.update('active');
    }

    /**
     * Create a real-time prediction confidence chart
     * @param {HTMLElement} container - Container element for the chart
     * @param {Object} predictionData - Prediction data with confidence intervals
     */
    createPredictionConfidenceChart(container, predictionData) {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const data = {
            labels: ['Confidence Range'],
            datasets: [
                {
                    label: 'Lower Bound',
                    data: [predictionData.lowerBound],
                    backgroundColor: this.chartColors.danger + '60',
                    borderColor: this.chartColors.danger,
                    borderWidth: 2
                },
                {
                    label: 'Predicted Price',
                    data: [predictionData.predicted],
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                    borderWidth: 2
                },
                {
                    label: 'Upper Bound',
                    data: [predictionData.upperBound],
                    backgroundColor: this.chartColors.success + '60',
                    borderColor: this.chartColors.success,
                    borderWidth: 2
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        };

        return new Chart(canvas, config);
    }

    /**
     * Destroy all charts (useful for cleanup)
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    /**
     * Resize all charts (useful for responsive design)
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    /**
     * Get chart colors for external use
     * @returns {Object} Chart colors object
     */
    getColors() {
        return this.chartColors;
    }
}

// Initialize charts when the script loads
window.priceAICharts = new PriceAICharts();

// Handle window resize
window.addEventListener('resize', () => {
    if (window.priceAICharts) {
        window.priceAICharts.resizeCharts();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceAICharts;
}