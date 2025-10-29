// AliWeather Configuration
const CONFIG = {
    // WeatherAPI.com Configuration
    API_KEY: '80a64dd9bada4e08b85152132252810', // WeatherAPI.com API Key
    BASE_URL: 'https://api.weatherapi.com/v1',
    
    // API Endpoints
    ENDPOINTS: {
        CURRENT: '/current.json',
        FORECAST: '/forecast.json',
        SEARCH: '/search.json',
        FUTURE: '/future.json',
        ASTRONOMY: '/astronomy.json'
    },
    
    // Default Settings
    DEFAULT_CITY: 'Hanoi',
    DEFAULT_COUNTRY: 'Vietnam',
    FORECAST_DAYS: 7, // WeatherAPI.com free tier supports up to 3 days, paid up to 14
    LANGUAGE: 'en',
    
    // Update Interval (milliseconds)
    UPDATE_INTERVAL: 60000, // 60 seconds = 1 minute
    
    // Local Storage Keys
    STORAGE_KEYS: {
        LAST_LOCATION: 'weather_last_location',
        THEME: 'weather_theme',
        FAVORITES: 'weather_favorites',
        ALERT_SOUND_ENABLED: 'weather_alert_sound_enabled'
    },
    
    // Alert Sound Configuration - Multi-level Disaster Warning System
    ALERT_SOUND: {
        ENABLED: true, // Default: enabled
        VOLUME: 0.6, // 0.0 to 1.0
        
        // Level 1: INFO - Thông tin (tiếng nhẹ, ngắn)
        INFO_PATTERN: {
            tones: [500],
            duration: 0.15,
            pause: 0.3,
            repetitions: 1,
            totalTime: 0.5,
            waveType: 'sine'
        },
        
        // Level 2: WARNING - Cảnh báo (tiếng vừa, lặp lại)
        WARNING_PATTERN: {
            tones: [600, 750],
            duration: 0.2,
            pause: 0.15,
            repetitions: 2,
            totalTime: 1.0,
            waveType: 'sine'
        },
        
        // Level 3: DANGER - Nguy hiểm (tiếng cao, nhanh, nhiều lớp)
        DANGER_PATTERN: {
            tones: [800, 1000, 1200],
            duration: 0.25,
            pause: 0.08,
            repetitions: 3,
            totalTime: 1.8,
            waveType: 'square',
            hasRumble: true
        },
        
        // Level 4: EXTREME - Cực kỳ nguy hiểm (tiếng cực cao, liên tục, báo động)
        EXTREME_PATTERN: {
            tones: [1000, 1200, 1500, 1800],
            duration: 0.2,
            pause: 0.05,
            repetitions: 4,
            totalTime: 3.0,
            waveType: 'square',
            hasRumble: true,
            hasSiren: true // Thêm hiệu ứng còi báo động
        }
    },
    
    // Disaster Level Definitions
    DISASTER_LEVELS: {
        INFO: {
            level: 1,
            label: 'Thông tin',
            class: 'alert-info',
            emoji: 'ℹ️'
        },
        WARNING: {
            level: 2,
            label: 'Cảnh báo',
            class: 'alert-warning',
            emoji: '⚠️'
        },
        DANGER: {
            level: 3,
            label: 'Nguy hiểm',
            class: 'alert-danger',
            emoji: '🚨'
        },
        EXTREME: {
            level: 4,
            label: 'Cực kỳ nguy hiểm',
            class: 'alert-extreme',
            emoji: '🔴'
        }
    },
    
    // Air Quality Index Ranges (WeatherAPI.com US EPA standard)
    AQI_RANGES: {
        1: { label: 'Tốt', class: 'aqi-good', max: 50 },
        2: { label: 'Trung bình', class: 'aqi-fair', max: 100 },
        3: { label: 'Không tốt cho nhóm nhạy cảm', class: 'aqi-moderate', max: 150 },
        4: { label: 'Có hại', class: 'aqi-poor', max: 200 },
        5: { label: 'Rất có hại', class: 'aqi-very-poor', max: 300 },
        6: { label: 'Nguy hiểm', class: 'aqi-very-poor', max: 500 }
    },
    
    // UV Index Ranges
    UV_RANGES: {
        LOW: { max: 2, label: 'Thấp', color: '#289500' },
        MODERATE: { max: 5, label: 'Trung bình', color: '#f7e401' },
        HIGH: { max: 7, label: 'Cao', color: '#f85900' },
        VERY_HIGH: { max: 10, label: 'Rất cao', color: '#d8001d' },
        EXTREME: { max: Infinity, label: 'Cực cao', color: '#6b49c8' }
    },
    
    // Chart Configuration
    CHART_COLORS: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        grid: 'rgba(0, 0, 0, 0.1)',
        text: '#4a5568'
    },
    
    // Weather Conditions Translation (English to Vietnamese)
    WEATHER_TRANSLATIONS: {
        // Clear
        'Sunny': 'Nắng',
        'Clear': 'Quang đãng',
        
        // Cloudy
        'Partly cloudy': 'Có mây',
        'Partly Cloudy': 'Có mây',
        'Cloudy': 'Nhiều mây',
        'Overcast': 'U ám',
        
        // Rain
        'Patchy rain possible': 'Có thể có mưa rải rác',
        'Patchy light rain': 'Mưa nhẹ rải rác',
        'Patchy Light Rain': 'Mưa nhẹ rải rác',
        'Light rain': 'Mưa nhẹ',
        'Light Rain': 'Mưa nhẹ',
        'Moderate rain': 'Mưa vừa',
        'Moderate Rain': 'Mưa vừa',
        'Heavy rain': 'Mưa to',
        'Heavy Rain': 'Mưa to',
        'Heavy Rain At Times': 'Mưa to từng lúc',
        'Heavy rain at times': 'Mưa to từng lúc',
        'Light rain shower': 'Mưa rào nhẹ',
        'Moderate or heavy rain shower': 'Mưa rào vừa hoặc nặng',
        'Torrential rain shower': 'Mưa rào lớn',
        
        // Drizzle
        'Patchy light drizzle': 'Mưa phùn nhẹ rải rác',
        'Light drizzle': 'Mưa phùn nhẹ',
        'Freezing drizzle': 'Mưa phùn đóng băng',
        
        // Snow
        'Patchy snow possible': 'Có thể có tuyết rải rác',
        'Light snow': 'Tuyết nhẹ',
        'Moderate snow': 'Tuyết vừa',
        'Heavy snow': 'Tuyết to',
        'Light snow showers': 'Tuyết rơi nhẹ',
        'Moderate or heavy snow showers': 'Tuyết rơi vừa hoặc nặng',
        'Blowing snow': 'Tuyết thổi',
        'Blizzard': 'Bão tuyết',
        
        // Sleet
        'Patchy sleet possible': 'Có thể có mưa tuyết rải rác',
        'Light sleet': 'Mưa tuyết nhẹ',
        'Moderate or heavy sleet': 'Mưa tuyết vừa hoặc nặng',
        'Light sleet showers': 'Mưa tuyết rào nhẹ',
        'Moderate or heavy sleet showers': 'Mưa tuyết rào vừa hoặc nặng',
        
        // Freezing
        'Patchy freezing drizzle possible': 'Có thể có mưa phùn đóng băng',
        'Freezing fog': 'Sương mù đóng băng',
        'Light freezing rain': 'Mưa đóng băng nhẹ',
        'Moderate or heavy freezing rain': 'Mưa đóng băng vừa hoặc nặng',
        
        // Ice
        'Ice pellets': 'Mưa đá nhỏ',
        'Light showers of ice pellets': 'Mưa đá nhỏ nhẹ',
        'Moderate or heavy showers of ice pellets': 'Mưa đá nhỏ vừa hoặc nặng',
        
        // Thunder
        'Thundery outbreaks possible': 'Có thể có sấm sét',
        'Patchy light rain with thunder': 'Mưa nhẹ rải rác có sấm sét',
        'Moderate or heavy rain with thunder': 'Mưa vừa hoặc to có sấm sét',
        'Patchy light snow with thunder': 'Tuyết nhẹ rải rác có sấm sét',
        'Moderate or heavy snow with thunder': 'Tuyết vừa hoặc to có sấm sét',
        
        // Fog
        'Mist': 'Sương mù nhẹ',
        'Fog': 'Sương mù',
        'Freezing Fog': 'Sương mù đóng băng'
    }
};

// Validate API Key on load
if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ Please set your WeatherAPI.com API key in js/config.js');
    console.info('📝 Get your free API key at: https://www.weatherapi.com/signup.aspx');
    console.info('🎁 Free tier: 1 million calls/month!');
}

