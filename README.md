# AliWeather - Thời Tiết Thông Minh

A beautiful, full-featured weather dashboard built with vanilla HTML, CSS, and JavaScript. Get real-time weather updates, hourly and daily forecasts, air quality information, and more!

![AliWeather](https://img.shields.io/badge/AliWeather-Thời_Tiết-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Current Weather**: Real-time temperature, feels like, humidity, wind speed, pressure, visibility, and cloud coverage
- **7-Day Forecast**: Daily weather predictions with high/low temperatures and precipitation chances
- **Hourly Forecast**: 48-hour detailed forecast with interactive temperature chart
- **Air Quality Index**: Complete AQI data with pollutant breakdown (PM2.5, PM10, CO, NO₂, O₃, SO₂)
- **Weather Alerts**: Real-time severe weather warnings and alerts
- **Location Search**: Search any city worldwide with autocomplete suggestions
- **Geolocation**: Automatic detection of your current location
- **Auto-Refresh**: Updates every 60 seconds to keep data fresh
- **Dark/Light Theme**: Toggle between beautiful themes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Charts**: Visualize temperature trends with Chart.js

## 🚀 Quick Start

### 1. Get WeatherAPI.com API Key

1. Visit [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)
2. Sign up for a FREE account
3. Verify your email
4. Go to your dashboard and copy your API key

**Free Tier Benefits:**
- ✅ **1 Million API calls per month** (much better than competitors!)
- ✅ Real-time weather data
- ✅ 3-day forecast (free tier)
- ✅ Air quality data
- ✅ Weather alerts
- ✅ Astronomy data
- ✅ Perfect for personal and small business use!

### 2. Configure API Key

Open `js/config.js` and replace `YOUR_API_KEY_HERE` with your actual API key:

```javascript
const CONFIG = {
    API_KEY: 'your_actual_api_key_here',
    // ... rest of config
};
```

### 3. Run Locally

#### Option 1: Simple HTTP Server (Python)
```bash
python -m http.server 8000
```
Then open http://localhost:8000

#### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```

#### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live"

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build the image
docker build -t aliweather .

# Run the container
docker run -d \
  --name aliweather \
  -p 8080:80 \
  --restart unless-stopped \
  aliweather
```

Access at: http://localhost:8080

### Deploy to Unraid

If you have the `deploy-github` tool installed:

```bash
deploy-github https://github.com/YOUR_USERNAME/aliweather.git 8080
```

Or manually:

```bash
cd /mnt/user/appdata
git clone https://github.com/YOUR_USERNAME/aliweather.git
cd aliweather

# Edit js/config.js with your API key

docker build -t aliweather .
docker run -d \
  --name aliweather \
  -p 8080:80 \
  --restart unless-stopped \
  aliweather
```

## 📱 Usage

### Search for Location
1. Type city name in the search box
2. Select from the dropdown suggestions
3. Weather data will automatically load

### Use Current Location
1. Click the location crosshair icon
2. Allow location access when prompted
3. Your local weather will be displayed

### Theme Toggle
Click the moon/sun icon in the header to switch between dark and light themes.

### Auto-Refresh
The dashboard automatically refreshes every 60 seconds. You can see the countdown timer in the footer.

## ⚙️ Configuration

All configuration options are in `js/config.js`:

```javascript
const CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE',
    DEFAULT_CITY: 'Hanoi',          // Default city on first load
    UNITS: 'metric',                 // 'metric', 'imperial', or 'standard'
    UPDATE_INTERVAL: 60000,          // Auto-refresh interval (milliseconds)
    LANGUAGE: 'en',                  // API response language
    // ... more options
};
```

### Customization Options

- **Units**: 
  - `metric` - Celsius, km/h
  - `imperial` - Fahrenheit, mph
  - `standard` - Kelvin, m/s

- **Update Interval**: Change `UPDATE_INTERVAL` (in milliseconds)
  - 60000 = 1 minute
  - 300000 = 5 minutes

- **Default Location**: Change `DEFAULT_CITY` and `DEFAULT_COUNTRY`

## 🎨 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Icons**: Font Awesome 6
- **API**: WeatherAPI.com
- **Deployment**: Docker + Nginx

## 📁 Project Structure

```
aliweather/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All styles (responsive, themes)
├── js/
│   ├── config.js          # Configuration & API key
│   ├── api.js             # Weather API wrapper
│   ├── charts.js          # Chart.js utilities
│   ├── app.js             # Main application logic
│   ├── weather-effects.js # Dynamic weather effects
│   └── flood-alert.js     # Flood alert system
├── assets/                # Optional assets folder
├── Dockerfile             # Docker configuration
└── README.md              # This file
```

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 📊 API Endpoints Used

- **Current Weather**: `/current.json` - Real-time weather conditions
- **Forecast**: `/forecast.json` - Up to 14-day forecast with hourly data
- **Search**: `/search.json` - Location search and autocomplete
- **Astronomy**: `/astronomy.json` - Sunrise, sunset, moon phases
- **Air Quality**: Included in current weather with AQI and pollutants

## 🔒 Privacy

- Location data is only used to fetch weather information
- No data is sent to external servers except WeatherAPI.com
- Last location is saved in browser's localStorage
- No cookies or tracking

## 🐛 Troubleshooting

### API Key Error
- Make sure you've activated your API key (can take up to 2 hours)
- Check that the key is correctly pasted in `js/config.js`
- Verify you haven't exceeded the free tier limits

### Location Not Found
- Check your internet connection
- Try different city names (e.g., "New York" instead of "NYC")
- Allow location permissions in your browser

### Chart Not Displaying
- Check browser console for errors
- Ensure Chart.js CDN is accessible
- Try clearing browser cache

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 🙏 Acknowledgments

- Weather data provided by [WeatherAPI.com](https://www.weatherapi.com/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Charts by [Chart.js](https://www.chartjs.org/)
- Weather condition icons by WeatherAPI.com

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Enjoy AliWeather!** ☀️🌧️❄️

