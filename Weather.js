// Weather App JavaScript Code
// API key
const apiKey = '7cbc0d03e8f85d158d4b7aaa75faae0d';

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const loading = document.getElementById('loading');
const locationStatus = document.getElementById('location-status');
const retryBtn = document.getElementById('retry-btn');


// Weather data storage
let weatherData = {};
let units = 'metric'; // Default units (metric = Celsius, imperial = Fahrenheit)

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Convert temperature
function convertTemperature(temp, targetUnit) {
    if (targetUnit === 'imperial') {
        return (temp * 9/5) + 32; // Convert Celsius to Fahrenheit
    } else {
        return (temp - 32) * 5/9; // Convert Fahrenheit to Celsius
    }
}

// Update weather UI
function updateWeatherUI() {

    const tempSymbol = units === 'metric' ? '°C' : '°F';
    const speedUnit = units === 'metric' ? 'km/h' : 'mph';
    
    let temp, feels;
    
    if (units === 'metric') {
        temp = weatherData.temperature;
        feels = weatherData.feelsLike;
    } else {
        temp = convertTemperature(weatherData.temperature, 'imperial');
        feels = convertTemperature(weatherData.feelsLike, 'imperial');
    }
    
    cityName.textContent = `${weatherData.city}, ${weatherData.country}`;
    dateElement.textContent = formatDate(weatherData.date);
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`;
    weatherIcon.alt = weatherData.description;
    temperature.textContent = `${Math.round(temp)}${tempSymbol}`;
    weatherCondition.textContent = weatherData.description;
    feelsLike.textContent = `${Math.round(feels)}${tempSymbol}`;
    humidity.textContent = `${weatherData.humidity}%`;
    
    // Update wind speed based on units
    let windSpeed = weatherData.windSpeed;
    if (units === 'imperial' && weatherData.speedUnit === 'km/h') {
        windSpeed = windSpeed * 0.621371; // Convert km/h to mph
    } else if (units === 'metric' && weatherData.speedUnit === 'mph') {
        windSpeed = windSpeed * 1.60934; // Convert mph to km/h
    }
    
    wind.textContent = `${Math.round(windSpeed)} ${speedUnit}`;
    
    // Show weather card
    weatherCard.style.display = 'block';
    errorMessage.style.display = 'none';
    updateBackground(weatherData.description);

}

// Fetch weather data
async function fetchWeather(city) {
    weatherCard.style.display = 'none';
    errorMessage.style.display = 'none';
    loading.style.display = 'block';
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        console.log('API Request URL:', response.url);
        console.log('Status:', response.status);

        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        // Store weather data
        weatherData = {
            city: data.name,
            country: data.sys.country,
            date: data.dt,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            speedUnit: 'km/h', // API returns m/s, converted to km/h
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };
        
        // Convert wind speed from m/s to km/h
        weatherData.windSpeed = weatherData.windSpeed * 3.6;
        
        updateWeatherUI();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorMessage.style.display = 'block';
        weatherCard.style.display = 'none';
    } finally {
        loading.style.display = 'none';
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

celsiusBtn.addEventListener('click', () => {
    if (units !== 'metric') {
        units = 'metric';
        celsiusBtn.classList.add('unit-active');
        fahrenheitBtn.classList.remove('unit-active');
        updateWeatherUI();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (units !== 'imperial') {
        units = 'imperial';
        fahrenheitBtn.classList.add('unit-active');
        celsiusBtn.classList.remove('unit-active');
        updateWeatherUI();
    }
});

async function fetchWeatherByCoords(lat, lon) {
try {
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
);
if (!response.ok) throw new Error('Location weather fetch failed');

const data = await response.json();

weatherData = {
    city: data.name,
    country: data.sys.country,
    date: data.dt,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed * 3.6,
    speedUnit: 'km/h',
    description: data.weather[0].description,
    icon: data.weather[0].icon
};

updateWeatherUI();
updateBackground(weatherData.description);
} catch (err) {
console.error('Error using geolocation:', err);
errorMessage.style.display = 'block';
} finally {
loading.style.display = 'none';
locationStatus.textContent = '';
}
}

function initializeWithLocation() {
loading.style.display = 'block';
locationStatus.textContent = 'Fetching your location...';
retryBtn.style.display = 'none';

if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(
    position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
    },
    error => {
        console.error('Geolocation error:', error);
        locationStatus.textContent = 'Location access denied or unavailable.';
        retryBtn.style.display = 'inline-block';
        fetchWeather('New York');
    }
);
} else {
locationStatus.textContent = 'Geolocation not supported on this browser.';
retryBtn.style.display = 'inline-block';
fetchWeather('New York');
}
}

window.addEventListener('load', initializeWithLocation);
retryBtn.addEventListener('click', initializeWithLocation);
function updateBackground(description) {
const desc = description.toLowerCase();
let gradient = '';

if (desc.includes('clear')) {
gradient = 'linear-gradient(135deg, #fceabb, #f8b500)';
} else if (desc.includes('cloud')) {
gradient = 'linear-gradient(135deg, #d7d2cc, #304352)';
} else if (desc.includes('rain')) {
gradient = 'linear-gradient(135deg, #667db6, #0082c8)';
} else if (desc.includes('snow')) {
gradient = 'linear-gradient(135deg, #e6dada, #274046)';
} else if (desc.includes('thunderstorm')) {
gradient = 'linear-gradient(135deg, #373B44, #4286f4)';
} else {
gradient = 'linear-gradient(135deg, #00b4db, #0083b0)';
}

document.body.style.background = gradient;
}
