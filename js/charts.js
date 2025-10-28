// Chart.js Utilities for AliWeather

class WeatherCharts {
    constructor() {
        this.hourlyChart = null;
    }

    /**
     * Create or update hourly temperature chart
     */
    createHourlyChart(hourlyData) {
        const ctx = document.getElementById('hourlyChart');
        if (!ctx) return;

        // Extract data
        const labels = hourlyData.map(item => {
            const date = new Date(item.dt * 1000);
            return date.getHours() + ':00';
        });

        const temperatures = hourlyData.map(item => Math.round(item.temp));
        const feelsLike = hourlyData.map(item => Math.round(item.feels_like));

        // Get theme colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#cbd5e0' : '#4a5568';

        // Destroy existing chart
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }

        // Create new chart
        this.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Nhiệt độ (°C)',
                        data: temperatures,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Cảm giác như (°C)',
                        data: feelsLike,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#8b5cf6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '°C';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Update chart theme when theme changes
     */
    updateChartTheme() {
        if (this.hourlyChart) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            const textColor = isDark ? '#cbd5e0' : '#4a5568';

            // Update scales
            this.hourlyChart.options.scales.x.grid.color = gridColor;
            this.hourlyChart.options.scales.x.ticks.color = textColor;
            this.hourlyChart.options.scales.y.grid.color = gridColor;
            this.hourlyChart.options.scales.y.ticks.color = textColor;

            // Update legend
            this.hourlyChart.options.plugins.legend.labels.color = textColor;

            // Update tooltip
            const tooltipBg = isDark ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)';
            this.hourlyChart.options.plugins.tooltip.backgroundColor = tooltipBg;
            this.hourlyChart.options.plugins.tooltip.titleColor = textColor;
            this.hourlyChart.options.plugins.tooltip.bodyColor = textColor;

            this.hourlyChart.update();
        }
    }

    /**
     * Destroy chart instance
     */
    destroy() {
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
            this.hourlyChart = null;
        }
    }
}

// Create global charts instance
const weatherCharts = new WeatherCharts();

