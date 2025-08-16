// script.js

// Weather API Configuration
const API_KEY = '7e15f5ac74e2fa04242710a6901d7eaa';
const API_URL = 'https://api.openweathermap.org/data/2.5';


// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const refreshBtn = document.getElementById('refresh-btn');
const loadingSpinner = document.getElementById('loading');
const weatherDisplay = document.getElementById('weather-display');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDesc = document.getElementById('weather-desc');
const weatherIcon = document.getElementById('weather-icon');
const windSpeed = document.getElementById('wind-speed');
const rainChance = document.getElementById('rain-chance');
const visibility = document.getElementById('visibility');
const hourlyContainer = document.getElementById('hourly-container');

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth Scrolling
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal', 'active');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Weather Functions
async function getCurrentWeather(lat, lon) {
    try {
        const response = await fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Weather data not available');
        return await response.json();
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
}

async function getForecast(lat, lon) {
    try {
        const response = await fetch(`${API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Forecast data not available');
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

function updateWeatherDisplay(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDesc.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.className = getWeatherIcon(iconCode);
    
    windSpeed.textContent = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    rainChance.textContent = data.rain ? Math.round(data.rain['1h'] || 0) : 0;
    visibility.textContent = (data.visibility / 1000).toFixed(1); // Convert meters to km
}

function updateHourlyForecast(forecastData) {
    hourlyContainer.innerHTML = '';
    
    // Get next 24 hours of data
    const hourlyData = forecastData.list.slice(0, 8);
    
    hourlyData.forEach(item => {
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        
        const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const iconCode = item.weather[0].icon;
        const iconClass = getWeatherIcon(iconCode);
        
        hourlyItem.innerHTML = `
            <p>${time}</p>
            <i class="${iconClass}"></i>
            <p>${Math.round(item.main.temp)}°C</p>
        `;
        
        hourlyContainer.appendChild(hourlyItem);
    });
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-clouds',
        '04n': 'fas fa-clouds',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    return iconMap[iconCode] || 'fas fa-cloud';
}

async function fetchWeatherByCoords(lat, lon) {
    showLoading();
    try {
        const [weatherData, forecastData] = await Promise.all([
            getCurrentWeather(lat, lon),
            getForecast(lat, lon)
        ]);
        
        updateWeatherDisplay(weatherData);
        updateHourlyForecast(forecastData);
        hideLoading();
        showWeatherDisplay();
    } catch (error) {
        hideLoading();
        alert('Error fetching weather data. Please try again.');
    }
}

async function fetchWeatherByCity(city) {
    try {
        const geocodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.length === 0) {
            alert('City not found. Please try again.');
            return;
        }
        
        const { lat, lon } = geocodeData[0];
        await fetchWeatherByCoords(lat, lon);
    } catch (error) {
        alert('Error searching for city. Please try again.');
    }
}

function showLoading() {
    loadingSpinner.style.display = 'flex';
    weatherDisplay.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showWeatherDisplay() {
    weatherDisplay.style.display = 'block';
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = locationInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    }
});

currentLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                alert('Unable to get your location. Please allow location access.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

refreshBtn.addEventListener('click', () => {
    if (navigator.geolocation && !locationInput.value.trim()) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            }
        );
    } else if (locationInput.value.trim()) {
        fetchWeatherByCity(locationInput.value.trim());
    }
});

// Testimonial Slider
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
        dots[i].classList.toggle('active', i === index);
    });
    currentTestimonial = index;
}

// Auto-rotate testimonials
setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}, 5000);

// Contact Form
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // Here you would normally send the form data to your server
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load user's current location weather on page load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                // Default to New York if location is not available
                fetchWeatherByCity('New York');
            }
        );
    } else {
        fetchWeatherByCity('New York');
    }
});