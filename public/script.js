document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.querySelector(".city-input");
    const locationButton = document.querySelector(".location-btn");
    const searchButton = document.querySelector(".search-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");

    // Corrected createWeatherCard function with template literals
    const createWeatherCard = (cityName, weatherItem, index) => {
        if (index === 0) {
            // Return current weather card HTML
            return `
                <div class="current-weather">
                    <div class="details">
                        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    </div>
                    <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                        <h4>${weatherItem.weather[0].description}</h4> 
                    </div>
                </div>
            `;
        } else {
            // Return forecast card HTML
            return `
                <div class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4> 
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
            `;
        }
    };

    const API_KEY = "81ff371f9b6dcb4fc451985501ec224c";

    const getWeatherDetails = (cityName, lat, lon) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

        fetch(WEATHER_API_URL)
            .then(res => res.json())
            .then(data => {
                const uniqueForecastDays = [];
                const fiveDaysForecast = data.list.filter(forecast => {
                    const forecastDate = new Date(forecast.dt_txt).getDate();
                    if (!uniqueForecastDays.includes(forecastDate)) {
                        uniqueForecastDays.push(forecastDate);
                        return true;  
                    }
                    return false;  
                });

                cityInput.value = "";
                
                // Clear only the necessary divs (current weather and forecast cards)
                currentWeatherDiv.innerHTML = "";
                weatherCardsDiv.innerHTML = "";

                console.log(fiveDaysForecast);

                // Add the current weather card first
                fiveDaysForecast.forEach((weatherItem, index) => {  
                    if (index === 0) {
                        currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));  
                    } else {
                        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));  
                    }
                });
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                alert("An error occurred while fetching the weather forecast!");
            });
    };

    const getCityCoordinates = () => {
        const cityName = cityInput.value.trim();
        if (!cityName) return;

        const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
        
        fetch(GEOCODING_API_URL)
            .then(res => res.json())
            .then(data => {
                if (!data.length) {
                    alert(`No coordinates found for ${cityName}`);
                    return;
                }
                const { name, lat, lon } = data[0];
                getWeatherDetails(name, lat, lon);
            })
            .catch(error => {
                console.error("Error fetching coordinates:", error);
                alert("An error occurred while fetching the coordinates!");
            });
    };

    const getUserCoordinates = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                    
                    fetch(REVERSE_GEOCODING_URL)
                        .then(res => res.json())
                        .then(data => {
                            if (!data.length) {
                                alert("An error occurred while fetching the city!");
                                return;
                            }
                            const { name } = data[0];
                            getWeatherDetails(name, latitude, longitude);
                        })
                        .catch(error => {
                            console.error("Error fetching city from coordinates:", error);
                            alert("An error occurred while fetching the coordinates!");
                        });
                },
                error => {
                    if (error.code === error.PERMISSION_DENIED) {
                        alert("Geolocation request denied. Please reset location permission to grant access again.");
                    }
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };

    if (locationButton) {
        locationButton.addEventListener("click", getUserCoordinates);
    } else {
        console.error("Location button not found in the DOM.");
    }

    if (searchButton) {
        searchButton.addEventListener("click", getCityCoordinates);
    } else {
        console.error("Search button not found in the DOM.");
    }

    cityInput.addEventListener("keyup", e => {
        if (e.key === "Enter") {
            getCityCoordinates();
        }
    });
});
