// Weather API Service Layer - WeatherAPI.com
class WeatherAPI {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.BASE_URL;
    }

    /**
     * Build API URL with parameters
     */
    buildUrl(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        
        // Add API key
        url.searchParams.append('key', this.apiKey);
        
        // Add other parameters
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        return url.toString();
    }

    /**
     * Make API request with error handling
     */
    async request(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Get current weather and forecast by city name
     */
    async getWeatherByCity(city) {
        const url = this.buildUrl(`${this.baseUrl}${CONFIG.ENDPOINTS.FORECAST}`, { 
            q: city,
            days: CONFIG.FORECAST_DAYS,
            aqi: 'yes',
            alerts: 'yes'
        });
        return await this.request(url);
    }

    /**
     * Get current weather and forecast by coordinates
     */
    async getWeatherByCoords(lat, lon) {
        const query = `${lat},${lon}`;
        const url = this.buildUrl(`${this.baseUrl}${CONFIG.ENDPOINTS.FORECAST}`, { 
            q: query,
            days: CONFIG.FORECAST_DAYS,
            aqi: 'yes',
            alerts: 'yes'
        });
        return await this.request(url);
    }

    /**
     * Search locations by name
     */
    async searchLocations(query) {
        const url = this.buildUrl(`${this.baseUrl}${CONFIG.ENDPOINTS.SEARCH}`, { 
            q: query
        });
        return await this.request(url);
    }

    /**
     * Get complete weather data (current + forecast + air quality)
     */
    async getCompleteWeatherData(lat, lon) {
        return await this.getWeatherByCoords(lat, lon);
    }

    /**
     * Process hourly forecast from WeatherAPI.com response
     */
    processHourlyForecast(weatherData) {
        const hourly = [];
        const currentHour = new Date().getHours();
        
        // Get today's remaining hours
        if (weatherData.forecast?.forecastday?.[0]) {
            const today = weatherData.forecast.forecastday[0];
            today.hour.forEach((hour, index) => {
                if (index >= currentHour) {
                    hourly.push(this.formatHourlyData(hour));
                }
            });
        }
        
        // Get tomorrow's hours to fill up to 24 hours
        if (weatherData.forecast?.forecastday?.[1]) {
            const tomorrow = weatherData.forecast.forecastday[1];
            const needed = 24 - hourly.length;
            tomorrow.hour.slice(0, needed).forEach(hour => {
                hourly.push(this.formatHourlyData(hour));
            });
        }
        
        return hourly;
    }

    /**
     * Format hourly data
     */
    formatHourlyData(hour) {
        return {
            dt: new Date(hour.time).getTime() / 1000,
            temp: hour.temp_c,
            feels_like: hour.feelslike_c,
            weather: {
                description: hour.condition.text,
                icon: this.extractIconCode(hour.condition.icon)
            },
            pop: hour.chance_of_rain / 100,
            wind: {
                speed: hour.wind_kph
            },
            humidity: hour.humidity
        };
    }

    /**
     * Process daily forecast
     */
    processDailyForecast(weatherData) {
        if (!weatherData.forecast?.forecastday) {
            return [];
        }
        
        return weatherData.forecast.forecastday.map(day => ({
            dt: new Date(day.date).getTime() / 1000,
            temp: {
                min: day.day.mintemp_c,
                max: day.day.maxtemp_c,
                avg: day.day.avgtemp_c
            },
            weather: [{
                description: day.day.condition.text,
                icon: this.extractIconCode(day.day.condition.icon)
            }],
            pop: day.day.daily_chance_of_rain / 100,
            humidity: day.day.avghumidity,
            wind_speed: day.day.maxwind_kph,
            uv: day.day.uv
        }));
    }

    /**
     * Extract icon code from WeatherAPI.com icon URL
     * WeatherAPI returns full URL like: //cdn.weatherapi.com/weather/64x64/day/116.png
     * We need just the code like: 116
     */
    extractIconCode(iconUrl) {
        if (!iconUrl) return '113'; // default sunny
        const match = iconUrl.match(/\/(\d+)\.png/);
        return match ? match[1] : '113';
    }

    /**
     * Get weather icon URL from WeatherAPI.com
     */
    getIconUrl(iconCode, size = '64x64') {
        // WeatherAPI uses different icon codes, just return the full URL
        // If iconCode is already a URL, return it
        if (iconCode && iconCode.startsWith('http')) {
            return iconCode;
        }
        
        // If it's a code, build URL
        // WeatherAPI doesn't specify day/night in code, use day as default
        return `https://cdn.weatherapi.com/weather/${size}/day/${iconCode}.png`;
    }

    /**
     * Get AQI level from US EPA index
     */
    getAQILevel(aqiValue) {
        for (const [level, data] of Object.entries(CONFIG.AQI_RANGES)) {
            if (aqiValue <= data.max) {
                return { level: parseInt(level), ...data };
            }
        }
        return { level: 6, ...CONFIG.AQI_RANGES[6] };
    }

    /**
     * Get UV Index level
     */
    getUVLevel(uvValue) {
        for (const [key, data] of Object.entries(CONFIG.UV_RANGES)) {
            if (uvValue <= data.max) {
                return { level: key, ...data };
            }
        }
        return { level: 'EXTREME', ...CONFIG.UV_RANGES.EXTREME };
    }
}

// Create global API instance
const weatherAPI = new WeatherAPI();
