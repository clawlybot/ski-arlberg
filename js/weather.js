// Live Weather Data for Ski Arlberg
// Uses Open-Meteo API (free, no API key required)
// Coordinates: Lech (47.2103, 10.1419), Valluga (47.1556, 10.2111)

const LOCATIONS = {
    lech: { lat: 47.2103, lon: 10.1419, elev: 1450, name: 'Lech (Tal)' },
    valluga: { lat: 47.1556, lon: 10.2111, elev: 2811, name: 'Valluga (Berg)' },
    stanton: { lat: 47.1295, lon: 10.2645, elev: 1304, name: 'St. Anton' }
};

// Weather code to emoji/icon mapping
const WEATHER_ICONS = {
    0: { icon: '☀️', desc: 'Klar' },
    1: { icon: '🌤️', desc: 'Meist klar' },
    2: { icon: '⛅', desc: 'Teilweise bewölkt' },
    3: { icon: '☁️', desc: 'Bedeckt' },
    45: { icon: '🌫️', desc: 'Nebel' },
    48: { icon: '🌫️', desc: 'Reifnebel' },
    51: { icon: '🌧️', desc: 'Nieselregen' },
    53: { icon: '🌧️', desc: 'Nieselregen' },
    55: { icon: '🌧️', desc: 'Nieselregen' },
    61: { icon: '🌧️', desc: 'Regen' },
    63: { icon: '🌧️', desc: 'Regen' },
    65: { icon: '🌧️', desc: 'Starker Regen' },
    71: { icon: '🌨️', desc: 'Schneefall' },
    73: { icon: '🌨️', desc: 'Schneefall' },
    75: { icon: '🌨️', desc: 'Starker Schneefall' },
    77: { icon: '🌨️', desc: 'Schneegriesel' },
    80: { icon: '🌧️', desc: 'Schauer' },
    81: { icon: '🌧️', desc: 'Schauer' },
    82: { icon: '🌧️', desc: 'Starke Schauer' },
    85: { icon: '🌨️', desc: 'Schneeschauer' },
    86: { icon: '🌨️', desc: 'Starke Schneeschauer' },
    95: { icon: '⛈️', desc: 'Gewitter' },
    96: { icon: '⛈️', desc: 'Gewitter mit Hagel' },
    99: { icon: '⛈️', desc: 'Gewitter mit Hagel' }
};

// Get weather icon and description
function getWeatherInfo(code) {
    return WEATHER_ICONS[code] || { icon: '❓', desc: 'Unbekannt' };
}

// Fetch weather data from Open-Meteo
async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,weather_code,snow_depth&daily=weather_code,temperature_2m_max,temperature_2m_min,snow_depth_max&timezone=Europe%2FBerlin`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
}

// Update hero weather widget
async function updateHeroWeather() {
    const data = await fetchWeatherData(LOCATIONS.lech.lat, LOCATIONS.lech.lon);
    if (!data) return;

    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);
    
    // Update hero widget
    const tempEl = document.getElementById('currentTemp');
    const iconEl = document.getElementById('weatherIcon');
    
    if (tempEl) tempEl.textContent = `${Math.round(current.temperature_2m)}°`;
    if (iconEl) iconEl.textContent = weatherInfo.icon;
}

// Update weather page data
async function updateWeatherPage() {
    // Fetch data for all locations
    const [lechData, vallugaData] = await Promise.all([
        fetchWeatherData(LOCATIONS.lech.lat, LOCATIONS.lech.lon),
        fetchWeatherData(LOCATIONS.valluga.lat, LOCATIONS.valluga.lon)
    ]);
    
    if (!lechData || !vallugaData) return;

    // Lech (Tal) -45°C adjustment for valley station
    const lechCurrent = lechData.current;
    const lechInfo = getWeatherInfo(lechCurrent.weather_code);
    
    // Update Lech weather
    const lechTempEl = document.getElementById('weatherTal');
    if (lechTempEl) {
        lechTempEl.innerHTML = `
            <div class="weather-temp-large">${Math.round(lechCurrent.temperature_2m)}°</div>
            <div class="weather-condition">${lechInfo.icon} ${lechInfo.desc}</div>
            <div class="weather-snow-depth">❄️ Schnee: ${Math.round(lechData.daily.snow_depth_max[0] * 100) || 85} cm</div>
        `;
    }
    
    // Valluga (Berg) - Adjust for elevation
    const vallugaCurrent = vallugaData.current;
    const vallugaInfo = getWeatherInfo(vallugaCurrent.weather_code);
    // Temperature adjustment: -0.6°C per 100m elevation difference
    const elevgain = 1361; // 2811 - 1450
    const tempAdjustment = (elevgain / 100) * 0.6;
    const adjustedTemp = Math.round(vallugaCurrent.temperature_2m - tempAdjustment);
    
    const vallugaTempEl = document.getElementById('weatherBerg');
    if (vallugaTempEl) {
        vallugaTempEl.innerHTML = `
            <div class="weather-temp-large">${adjustedTemp}°</div>
            <div class="weather-condition">${vallugaInfo.icon} ${vallugaInfo.desc}</div>
            <div class="weather-snow-depth">❄️ Schnee: ${Math.round(vallugaData.daily.snow_depth_max[0] * 100) || 125} cm</div>
        `;
    }

    // Update 7-day forecast if container exists
    updateForecast(lechData, vallugaData);
}

// Update 7-day forecast
function updateForecast(lechData, vallugaData) {
    const forecastGrid = document.getElementById('forecastGrid');
    if (!forecastGrid) return;

    let html = '';
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = i === 0 ? 'Heute' : days[date.getDay()];
        
        const weatherCode = lechData.daily.weather_code[i];
        const info = getWeatherInfo(weatherCode);
        const maxTemp = Math.round(lechData.daily.temperature_2m_max[i]);
        const minTemp = Math.round(lechData.daily.temperature_2m_min[i]);
        
        html += `
            <div class="forecast-day">
                <span class="forecast-date">${dayName}</span>
                <span class="forecast-icon">${info.icon}</span>
                <span class="forecast-desc">${info.desc}</span>
                <span class="forecast-temp">${maxTemp}° / ${minTemp}°</span>
            </div>
        `;
    }
    
    forecastGrid.innerHTML = html;
}

// Initialize weather data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update hero widget on all pages
    updateHeroWeather();
    
    // Update detailed weather on wetter.html
    if (document.querySelector('.current-weather')) {
        updateWeatherPage();
    }
    
    // Refresh every 30 minutes
    setInterval(() => {
        updateHeroWeather();
        if (document.querySelector('.current-weather')) {
            updateWeatherPage();
        }
    }, 30 * 60 * 1000);
});

// Export for use in other scripts
window.SkiArlbergWeather = {
    fetchWeather: fetchWeatherData,
    getWeatherInfo: getWeatherInfo,
    LOCATIONS: LOCATIONS
};
