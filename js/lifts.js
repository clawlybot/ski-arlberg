// Live Lift Status via Liftie API
// Free API: https://liftie.info/api/resort/st-anton-am-arlberg
// Updates every 65 seconds, cached server-side for 1 minute

const LIFTIE_API_URL = 'https://liftie.info/api/resort/st-anton-am-arlberg';
const CACHE_DURATION = 60 * 1000; // 60 seconds (matching Liftie's cache)

// Fetch lift data from Liftie API
async function fetchLiftData() {
    try {
        // Use CORS proxy for GitHub Pages (public CORS proxy)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const encodedUrl = encodeURIComponent(LIFTIE_API_URL);
        
        const response = await fetch(proxyUrl + encodedUrl, {
            headers: {
                'User-Agent': 'SkiArlberg-Website/1.0 (https://clawlybot.github.io/ski-arlberg/)'
            }
        });
        
        if (!response.ok) {
            console.warn('Liftie API via proxy failed, trying direct...');
            return null;
        }
        
        const proxyData = await response.json();
        if (!proxyData.contents) {
            console.warn('No contents in proxy response');
            return null;
        }
        
        return JSON.parse(proxyData.contents);
    } catch (error) {
        console.error('Error fetching lift data:', error);
        return null;
    }
}

// Convert Fahrenheit to Celsius
function fahrenheitToCelsius(f) {
    return Math.round((f - 32) * 5 / 9);
}

// Map weather icons to our emojis
function mapWeatherIcon(liftieIcon) {
    const iconMap = {
        'icon-sunny': '☀️',
        'icon-cloud': '☁️',
        'icon-overcast': '☁️',
        'icon-snow': '🌨️',
        'icon-rain': '🌧️',
        'icon-windy': '💨',
        'icon-fog': '🌫️',
        'icon-clear': '🌙'
    };
    return iconMap[liftieIcon] || '⛅';
}

// Calculate lift stats from API data
function calculateLiftStats(lifts) {
    // API returns status object with lift names as keys
    // Status values: open, closed, hold
    
    const liftNames = Object.keys(lifts.status || {});
    const totalLifts = liftNames.length || 87; // Fallback to 87
    const openLifts = liftNames.filter(name => lifts.status[name] === 'open').length;
    const holdLifts = liftNames.filter(name => lifts.status[name] === 'hold').length;
    const closedLifts = liftNames.filter(name => lifts.status[name] === 'closed').length;
    
    return {
        open: openLifts,
        closed: closedLifts,
        hold: holdLifts,
        total: totalLifts,
        percentage: totalLifts > 0 ? Math.round((openLifts / totalLifts) * 100) : 0
    };
}

// Update all lift displays
function updateLiftDisplay(stats) {
    // Update hero widget
    const liftsEl = document.getElementById('liftsOpen');
    if (liftsEl) {
        liftsEl.textContent = `${stats.open}/${stats.total}`;
    }
    
    // Update status cards
    const statusGrids = document.querySelectorAll('.status-grid');
    statusGrids.forEach(grid => {
        // Update the first card (Lech-Zürs)
        const firstCard = grid.querySelector('.status-card');
        if (firstCard) {
            const badge = firstCard.querySelector('.status-badge');
            if (badge) {
                badge.textContent = `${stats.open} von ${stats.total} geöffnet`;
                badge.className = `status-badge ${stats.percentage > 50 ? 'open' : 'limited'}`;
            }
        }
    });
}

// Update weather from Liftie (more accurate than Open-Meteo for mountain weather)
function updateLiftieWeather(weather) {
    const weatherTal = document.getElementById('weatherTal');
    const weatherBerg = document.getElementById('weatherBerg');
    
    if (!weather || !weather.temperature) return;
    
    const tempC = fahrenheitToCelsius(weather.temperature.max);
    const weatherIcon = weather.icon && weather.icon[0] ? mapWeatherIcon(weather.icon[0]) : '⛅';
    
    // Update main weather display
    const currentTemp = document.getElementById('currentTemp');
    if (currentTemp) {
        currentTemp.textContent = `${tempC}°`;
    }
    
    const weatherIconEl = document.getElementById('weatherIcon');
    if (weatherIconEl) {
        weatherIconEl.textContent = weatherIcon;
    }
}

// Main update function
async function updateLiftData() {
    const data = await fetchLiftData();
    
    if (!data) {
        console.log('No lift data available, keeping fallback values');
        return;
    }
    
    // Update lift stats
    if (data.lifts) {
        const stats = calculateLiftStats(data.lifts);
        
        // Only update if we have actual lift data
        if (stats.total > 0) {
            updateLiftDisplay(stats);
            
            // Store last update
            localStorage.setItem('liftData', JSON.stringify({
                ...stats,
                timestamp: Date.now()
            }));
            
            console.log(`Lift update: ${stats.open}/${stats.total} open (${stats.percentage}%)`);
        }
    }
    
    // Update weather from Liftie
    if (data.weather) {
        updateLiftieWeather(data.weather);
    }
}

// Load cached data on page load
function loadCachedData() {
    try {
        const cached = localStorage.getItem('liftData');
        if (cached) {
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            
            // Use cached data if less than 5 minutes old
            if (age < 5 * 60 * 1000) {
                updateLiftDisplay(data);
                console.log('Using cached lift data');
            }
        }
    } catch (e) {
        console.log('No cached lift data');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Try to load cached data first
    loadCachedData();
    
    // Then fetch fresh data
    updateLiftData();
    
    // Auto-refresh every 65 seconds (matching Liftie's rate limit)
    setInterval(updateLiftData, 65000);
    
    // Also refresh on window focus (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateLiftData();
        }
    });
});

// Export for manual testing
window.SkiArlbergLifts = {
    refresh: updateLiftData,
    getStats: calculateLiftStats
};
