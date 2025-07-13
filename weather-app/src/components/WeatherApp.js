import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('London');

  // You'll need to get your own API key from https://openweathermap.org/api
  const API_KEY = 'YOUR_API_KEY_HERE';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For demo purposes, we'll use mock data if no API key is provided
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      setWeatherData({
        name: 'London',
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 65,
          pressure: 1013
        },
        weather: [
          {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d'
          }
        ],
        wind: {
          speed: 3.5
        },
        visibility: 10000
      });
    } else {
      fetchWeatherData(city);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
    }
  };

  const getWeatherIcon = (iconCode) => {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      // Return a generic icon for demo
      return '☀️';
    }
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="weather-app">
      <div className="weather-container">
        <h1>Weather App</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {loading && <div className="loading">Loading...</div>}
        
        {error && <div className="error">Error: {error}</div>}
        
        {weatherData && !loading && (
          <div className="weather-info">
            <div className="city-name">{weatherData.name}</div>
            
            <div className="weather-main">
              <div className="weather-icon">
                {API_KEY === 'YOUR_API_KEY_HERE' ? (
                  <span className="demo-icon">☀️</span>
                ) : (
                  <img 
                    src={getWeatherIcon(weatherData.weather[0].icon)} 
                    alt={weatherData.weather[0].description}
                  />
                )}
              </div>
              
              <div className="temperature">{Math.round(weatherData.main.temp)}°C</div>
              
              <div className="weather-description">
                {weatherData.weather[0].description}
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="label">Feels like:</span>
                <span className="value">{Math.round(weatherData.main.feels_like)}°C</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Humidity:</span>
                <span className="value">{weatherData.main.humidity}%</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Pressure:</span>
                <span className="value">{weatherData.main.pressure} hPa</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Wind Speed:</span>
                <span className="value">{weatherData.wind.speed} m/s</span>
              </div>
              
              {weatherData.visibility && (
                <div className="detail-item">
                  <span className="label">Visibility:</span>
                  <span className="value">{weatherData.visibility / 1000} km</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {API_KEY === 'YOUR_API_KEY_HERE' && (
          <div className="api-notice">
            <p>📝 <strong>Note:</strong> This is using demo data. To get real weather data:</p>
            <ol>
              <li>Get a free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></li>
              <li>Replace 'YOUR_API_KEY_HERE' in WeatherApp.js with your actual API key</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
