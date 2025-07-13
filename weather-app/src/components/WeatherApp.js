import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Oslo, Norway');
  const [coordinates, setCoordinates] = useState({ lat: 59.9139, lon: 10.7522 }); // Oslo coordinates

  const MET_NO_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
  
  // Popular cities with their coordinates
  const popularCities = {
    'Oslo, Norway': { lat: 59.9139, lon: 10.7522 },
    'Bergen, Norway': { lat: 60.3913, lon: 5.3221 },
    'Trondheim, Norway': { lat: 63.4305, lon: 10.3951 },
    'London, UK': { lat: 51.5074, lon: -0.1278 },
    'New York, USA': { lat: 40.7128, lon: -74.0060 },
    'Tokyo, Japan': { lat: 35.6762, lon: 139.6503 },
    'Paris, France': { lat: 48.8566, lon: 2.3522 },
    'Sydney, Australia': { lat: -33.8688, lon: 151.2093 }
  };

  const fetchWeatherData = async (lat, lon) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${MET_NO_BASE_URL}?lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'WeatherApp/1.0 (contact@example.com)' // Met.no requires a User-Agent
          }
        }
      );
      
      const data = response.data;
      const currentWeather = data.properties.timeseries[0].data.instant.details;
      const next1Hour = data.properties.timeseries[0].data.next_1_hours;
      const next6Hours = data.properties.timeseries[0].data.next_6_hours;
      
      // Transform Met.no data to our format
      const transformedData = {
        coordinates: { lat, lon },
        current: {
          temperature: currentWeather.air_temperature,
          humidity: currentWeather.relative_humidity,
          pressure: currentWeather.air_pressure_at_sea_level,
          windSpeed: currentWeather.wind_speed,
          windDirection: currentWeather.wind_from_direction,
          cloudCover: currentWeather.cloud_area_fraction
        },
        forecast: {
          symbol: next1Hour?.summary?.symbol_code || next6Hours?.summary?.symbol_code || 'clearsky_day',
          precipitation: next1Hour?.details?.precipitation_amount || next6Hours?.details?.precipitation_amount || 0
        },
        updated: data.properties.meta.updated_at
      };
      
      setWeatherData(transformedData);
    } catch (err) {
      setError('Failed to fetch weather data from Met.no API');
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather data for default location (Oslo)
    fetchWeatherData(coordinates.lat, coordinates.lon);
  }, [coordinates.lat, coordinates.lon]);

  const handleLocationChange = (e) => {
    e.preventDefault();
    const selectedCity = popularCities[location];
    if (selectedCity) {
      setCoordinates(selectedCity);
      fetchWeatherData(selectedCity.lat, selectedCity.lon);
    }
  };

  const getWeatherIcon = (symbolCode) => {
    // Map Met.no symbol codes to emoji icons
    const iconMap = {
      'clearsky_day': '☀️',
      'clearsky_night': '🌙',
      'fair_day': '🌤️',
      'fair_night': '🌙',
      'partlycloudy_day': '⛅',
      'partlycloudy_night': '☁️',
      'cloudy': '☁️',
      'rainshowers_day': '🌦️',
      'rainshowers_night': '🌧️',
      'rain': '🌧️',
      'lightrain': '🌦️',
      'heavyrain': '🌧️',
      'snow': '❄️',
      'snowshowers_day': '🌨️',
      'snowshowers_night': '🌨️',
      'fog': '🌫️',
      'sleet': '🌨️',
      'thunderstorm': '⛈️'
    };
    
    return iconMap[symbolCode] || '🌤️';
  };

  const getWeatherDescription = (symbolCode) => {
    const descriptions = {
      'clearsky_day': 'Clear sky',
      'clearsky_night': 'Clear sky',
      'fair_day': 'Fair',
      'fair_night': 'Fair',
      'partlycloudy_day': 'Partly cloudy',
      'partlycloudy_night': 'Partly cloudy',
      'cloudy': 'Cloudy',
      'rainshowers_day': 'Rain showers',
      'rainshowers_night': 'Rain showers',
      'rain': 'Rain',
      'lightrain': 'Light rain',
      'heavyrain': 'Heavy rain',
      'snow': 'Snow',
      'snowshowers_day': 'Snow showers',
      'snowshowers_night': 'Snow showers',
      'fog': 'Fog',
      'sleet': 'Sleet',
      'thunderstorm': 'Thunderstorm'
    };
    
    return descriptions[symbolCode] || 'Unknown';
  };

  return (
    <div className="weather-app">
      <div className="weather-container">
        <h1>Weather App</h1>
        
        <form onSubmit={handleLocationChange} className="search-form">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
          >
            {Object.keys(popularCities).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <button type="submit" className="search-button">
            Get Weather
          </button>
        </form>

        {loading && <div className="loading">Loading...</div>}
        
        {error && <div className="error">Error: {error}</div>}
        
        {weatherData && !loading && (
          <div className="weather-info">
            <div className="city-name">{location}</div>
            
            <div className="weather-main">
              <div className="weather-icon">
                <span className="demo-icon">
                  {getWeatherIcon(weatherData.forecast.symbol)}
                </span>
              </div>
              
              <div className="temperature">
                {Math.round(weatherData.current.temperature)}°C
              </div>
              
              <div className="weather-description">
                {getWeatherDescription(weatherData.forecast.symbol)}
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="label">Humidity:</span>
                <span className="value">{Math.round(weatherData.current.humidity)}%</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Pressure:</span>
                <span className="value">{Math.round(weatherData.current.pressure)} hPa</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Wind Speed:</span>
                <span className="value">{Math.round(weatherData.current.windSpeed * 10) / 10} m/s</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Cloud Cover:</span>
                <span className="value">{Math.round(weatherData.current.cloudCover)}%</span>
              </div>

              {weatherData.forecast.precipitation > 0 && (
                <div className="detail-item">
                  <span className="label">Precipitation:</span>
                  <span className="value">{weatherData.forecast.precipitation} mm</span>
                </div>
              )}

              <div className="detail-item">
                <span className="label">Coordinates:</span>
                <span className="value">
                  {weatherData.coordinates.lat.toFixed(2)}, {weatherData.coordinates.lon.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="api-notice">
          <p>🌤️ <strong>Weather data provided by:</strong></p>
          <p>
            <a href="https://api.met.no/" target="_blank" rel="noopener noreferrer">
              Norwegian Meteorological Institute (Met.no)
            </a>
          </p>
          <p>No API key required! Select a city from the dropdown to see current weather conditions.</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
