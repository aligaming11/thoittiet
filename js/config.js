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
        FAVORITES: 'weather_favorites'
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

