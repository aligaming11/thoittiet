// Main Application Logic - WeatherAPI.com

class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.searchTimeout = null;
        this.isRefreshing = false;
        
        this.init();
    }
    
    /**
     * Translate weather condition to Vietnamese
     */
    translateWeather(englishText) {
        return CONFIG.WEATHER_TRANSLATIONS[englishText] || englishText;
    }

    /**
     * Translate country name to Vietnamese
     */
    translateCountry(countryName) {
        const countryTranslations = {
            'Vietnam': 'Việt Nam',
            'United States': 'Hoa Kỳ',
            'United States of America': 'Hoa Kỳ',
            'USA': 'Hoa Kỳ',
            'China': 'Trung Quốc',
            'Japan': 'Nhật Bản',
            'South Korea': 'Hàn Quốc',
            'Thailand': 'Thái Lan',
            'Singapore': 'Singapore',
            'Malaysia': 'Malaysia',
            'Indonesia': 'Indonesia',
            'Philippines': 'Philippines',
            'Cambodia': 'Campuchia',
            'Laos': 'Lào',
            'Myanmar': 'Myanmar',
            'United Kingdom': 'Anh',
            'France': 'Pháp',
            'Germany': 'Đức',
            'Italy': 'Ý',
            'Spain': 'Tây Ban Nha',
            'Australia': 'Úc',
            'Canada': 'Canada',
            'Russia': 'Nga',
            'India': 'Ấn Độ'
        };
        return countryTranslations[countryName] || countryName;
    }

    /**
     * Initialize application
     */
    async init() {
        this.setupEventListeners();
        this.loadTheme();
        await this.loadLastLocation();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshWeather();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Location search
        const searchInput = document.getElementById('locationSearch');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 3) {
                this.searchTimeout = setTimeout(() => {
                    this.searchLocations(query);
                }, 500);
            } else {
                this.hideSearchResults();
            }
        });

        // Current location button
        document.getElementById('currentLocationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadWeatherData();
        });

        // Click outside search results to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
        this.updateThemeIcon(newTheme);
        
        // Update chart theme if exists
        weatherCharts.updateChartTheme();
    }

    /**
     * Update theme icon
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    /**
     * Load last saved location
     */
    async loadLastLocation() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_LOCATION);
        
        if (saved) {
            this.currentLocation = JSON.parse(saved);
            await this.loadWeatherData();
        } else {
            // Try to get current location or use default
            await this.getCurrentLocation();
        }
    }

    /**
     * Get current geolocation
     */
    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Trình duyệt của bạn không hỗ trợ xác định vị trí');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    name: 'Vị trí hiện tại'
                };
                await this.loadWeatherData();
            },
            async (error) => {
                console.error('Geolocation error:', error);
                // Fallback to default city
                await this.searchAndLoadCity(CONFIG.DEFAULT_CITY);
            }
        );
    }

    /**
     * Search locations
     */
    async searchLocations(query) {
        try {
            const results = await weatherAPI.searchLocations(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError(error.message);
        }
    }
    
    /**
     * Display search error
     */
    displaySearchError(message) {
        const container = document.getElementById('searchResults');
        // Translate common error messages
        let translatedMessage = message;
        const errorTranslations = {
            'API request failed': 'Yêu cầu API thất bại',
            'Network error': 'Lỗi kết nối mạng',
            'Invalid API key': 'API key không hợp lệ',
            'Rate limit exceeded': 'Đã vượt quá giới hạn yêu cầu',
            'Location not found': 'Không tìm thấy địa điểm'
        };
        for (const [en, vi] of Object.entries(errorTranslations)) {
            if (message.toLowerCase().includes(en.toLowerCase())) {
                translatedMessage = vi;
                break;
            }
        }
        container.innerHTML = `
            <div class="search-result-item" style="color: var(--error); text-align: center;">
                <i class="fas fa-exclamation-circle"></i>
                Lỗi tìm kiếm: ${translatedMessage}
                <br>
                <small>Kiểm tra kết nối internet hoặc API key</small>
            </div>
        `;
        container.classList.remove('hidden');
    }

    /**
     * Display search results
     */
    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        
        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="search-result-item" style="text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-search"></i>
                    Không tìm thấy địa điểm nào
                </div>
            `;
            container.classList.remove('hidden');
            return;
        }

        container.innerHTML = results.map(location => `
            <div class="search-result-item" 
                 data-lat="${location.lat}" 
                 data-lon="${location.lon}" 
                 data-name="${location.name}" 
                 data-country="${location.country}">
                <i class="fas fa-map-marker-alt" style="color: var(--accent-primary); margin-right: 8px;"></i>
                ${location.name}${location.region ? ', ' + location.region : ''}, ${location.country}
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectLocation({
                    lat: parseFloat(item.dataset.lat),
                    lon: parseFloat(item.dataset.lon),
                    name: item.dataset.name,
                    country: item.dataset.country
                });
            });
        });

        container.classList.remove('hidden');
    }

    /**
     * Hide search results
     */
    hideSearchResults() {
        document.getElementById('searchResults').classList.add('hidden');
    }

    /**
     * Select location from search
     */
    async selectLocation(location) {
        this.currentLocation = location;
        this.hideSearchResults();
        document.getElementById('locationSearch').value = '';
        
        // Save to localStorage
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
        
        await this.loadWeatherData();
    }

    /**
     * Search and load city by name
     */
    async searchAndLoadCity(cityName) {
        try {
            const results = await weatherAPI.searchLocations(cityName);
            if (results && results.length > 0) {
                await this.selectLocation({
                    lat: results[0].lat,
                    lon: results[0].lon,
                    name: results[0].name,
                    country: results[0].country
                });
            }
        } catch (error) {
            this.showError('Không thể tải vị trí mặc định');
        }
    }

    /**
     * Load all weather data
     */
    async loadWeatherData() {
        if (!this.currentLocation) return;

        this.showLoading();

        try {
            const data = await weatherAPI.getCompleteWeatherData(
                this.currentLocation.lat,
                this.currentLocation.lon
            );

            this.displayCurrentWeather(data);
            this.displayAirQuality(data);
            this.displayAlerts(data);
            
            const dailyForecast = weatherAPI.processDailyForecast(data);
            const hourlyForecast = weatherAPI.processHourlyForecast(data);
            
            this.displayDailyForecast(dailyForecast);
            this.displayHourlyForecast(hourlyForecast);
            
            // Check for flood alerts
            if (typeof floodAlertSystem !== 'undefined') {
                floodAlertSystem.checkFloodRisk(data);
            }
            
            this.updateLastUpdateTime();
            this.hideLoading();
            this.showWeatherContent();
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showError(error.message || 'Không thể tải dữ liệu thời tiết. Vui lòng kiểm tra API key của bạn.');
        }
    }

    /**
     * Display current weather
     */
    displayCurrentWeather(data) {
        const current = data.current;
        const location = data.location;
        
        // Location info
        document.getElementById('locationName').textContent = location.name;
        const countryTranslated = this.translateCountry(location.country);
        document.getElementById('locationCountry').textContent = `${location.region ? location.region + ', ' : ''}${countryTranslated}`;
        
        const localTime = new Date(location.localtime);
        document.getElementById('currentDateTime').textContent = localTime.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Temperature and condition
        document.getElementById('currentTemp').textContent = Math.round(current.temp_c);
        document.getElementById('feelsLike').textContent = Math.round(current.feelslike_c);
        document.getElementById('weatherCondition').textContent = this.translateWeather(current.condition.text);
        
        // Set weather effects based on condition
        const isNight = current.is_day === 0;
        if (typeof weatherEffects !== 'undefined') {
            weatherEffects.setWeather(current.condition.text, isNight);
        }
        
        document.getElementById('currentWeatherIcon').src = 'https:' + current.condition.icon;
        document.getElementById('currentWeatherIcon').alt = current.condition.text;

        // Details
        document.getElementById('humidity').textContent = current.humidity + '%';
        document.getElementById('windSpeed').textContent = Math.round(current.wind_kph) + ' km/h';
        document.getElementById('pressure').textContent = current.pressure_mb + ' mb';
        document.getElementById('visibility').textContent = current.vis_km + ' km';
        document.getElementById('clouds').textContent = current.cloud + '%';
        document.getElementById('uvIndex').textContent = current.uv;

        // Sun times (from forecast)
        if (data.forecast?.forecastday?.[0]?.astro) {
            const astro = data.forecast.forecastday[0].astro;
            document.getElementById('sunrise').textContent = astro.sunrise;
            document.getElementById('sunset').textContent = astro.sunset;
        }
    }

    /**
     * Display air quality
     */
    displayAirQuality(data) {
        if (!data.current?.air_quality) {
            return;
        }

        const aqi = data.current.air_quality;
        
        // WeatherAPI provides US EPA index
        const aqiValue = aqi['us-epa-index'] || 1;
        const aqiInfo = weatherAPI.getAQILevel(aqiValue);

        document.getElementById('aqiValue').textContent = aqiValue;
        document.getElementById('aqiLabel').textContent = aqiInfo.label;
        document.getElementById('aqiValue').className = 'aqi-value ' + aqiInfo.class;

        // Pollutants
        document.getElementById('pm25').textContent = aqi.pm2_5?.toFixed(1) || '--';
        document.getElementById('pm10').textContent = aqi.pm10?.toFixed(1) || '--';
        document.getElementById('co').textContent = aqi.co?.toFixed(1) || '--';
        document.getElementById('no2').textContent = aqi.no2?.toFixed(1) || '--';
        document.getElementById('o3').textContent = aqi.o3?.toFixed(1) || '--';
        document.getElementById('so2').textContent = aqi.so2?.toFixed(1) || '--';
    }

    /**
     * Display weather alerts
     */
    displayAlerts(data) {
        const alertsSection = document.getElementById('alertsSection');
        const alertsContent = document.getElementById('alertsContent');
        
        if (!data.alerts || !data.alerts.alert || data.alerts.alert.length === 0) {
            alertsSection.classList.add('hidden');
            return;
        }

        const alertsHtml = data.alerts.alert.map(alert => `
            <div class="alert-item">
                <div class="alert-title">${alert.event}</div>
                <div class="alert-description">${alert.headline}</div>
                ${alert.desc ? `<div class="alert-description" style="margin-top: 5px; font-size: 0.9rem;">${alert.desc}</div>` : ''}
            </div>
        `).join('');

        alertsContent.innerHTML = alertsHtml;
        alertsSection.classList.remove('hidden');
    }

    /**
     * Display hourly forecast
     */
    displayHourlyForecast(hourlyData) {
        const container = document.getElementById('hourlyScroll');
        
        container.innerHTML = hourlyData.map(hour => {
            const time = new Date(hour.dt * 1000);
            const iconUrl = weatherAPI.getIconUrl(hour.weather.icon);
            const rainChance = Math.round(hour.pop * 100);

            return `
                <div class="hourly-item">
                    <div class="hourly-time">${time.getHours()}:00</div>
                    <div class="hourly-icon">
                        <img src="${iconUrl}" alt="${hour.weather.description}">
                    </div>
                    <div class="hourly-temp">${Math.round(hour.temp)}°C</div>
                    <div class="hourly-desc">${this.translateWeather(hour.weather.description)}</div>
                    <div class="hourly-rain">
                        <i class="fas fa-droplet"></i>
                        ${rainChance}%
                    </div>
                </div>
            `;
        }).join('');

        // Create chart
        weatherCharts.createHourlyChart(hourlyData);
    }

    /**
     * Display daily forecast
     */
    displayDailyForecast(dailyData) {
        const container = document.getElementById('forecastGrid');
        
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        container.innerHTML = dailyData.map((day, index) => {
            const date = new Date(day.dt * 1000);
            const dayName = index === 0 ? 'Hôm nay' : dayNames[date.getDay()];
            const dateStr = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
            const iconUrl = weatherAPI.getIconUrl(day.weather[0].icon, '128x128');
            const rainChance = Math.round(day.pop * 100);

            return `
                <div class="forecast-card">
                    <div class="forecast-day">${dayName}</div>
                    <div class="forecast-date">${dateStr}</div>
                    <div class="forecast-icon">
                        <img src="${iconUrl}" alt="${day.weather[0].description}">
                    </div>
                    <div class="forecast-temps">
                        <span class="forecast-temp-high">${Math.round(day.temp.max)}°</span>
                        <span class="forecast-temp-low">${Math.round(day.temp.min)}°</span>
                    </div>
                    <div class="forecast-desc">${this.translateWeather(day.weather[0].description)}</div>
                    <div class="forecast-rain">
                        <i class="fas fa-droplet"></i>
                        ${rainChance}%
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update last update timestamp
     */
    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Manual refresh weather data
     */
    async refreshWeather() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.classList.add('refreshing');
        refreshBtn.disabled = true;
        
        try {
            await this.loadWeatherData();
        } finally {
            setTimeout(() => {
                refreshBtn.classList.remove('refreshing');
                refreshBtn.disabled = false;
                this.isRefreshing = false;
            }, 500);
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('weatherContent').classList.add('hidden');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
    }

    /**
     * Show weather content
     */
    showWeatherContent() {
        document.getElementById('weatherContent').classList.remove('hidden');
    }

    /**
     * Show error state
     */
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('weatherContent').classList.add('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new WeatherApp();
});
