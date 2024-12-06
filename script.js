document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.querySelector(".city-input");
    const locationButton = document.querySelector(".location-btn");
    const searchButton = document.querySelector(".search-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");
    const messagesDiv = document.querySelector(".messages");
    const sendButton = document.querySelector(".send-btn");
    const userInput = document.querySelector(".user-input");

    const API_KEY = "81ff371f9b6dcb4fc451985501ec224c";

    // Create weather card function
    const createWeatherCard = (cityName, weatherItem, index) => {
        if (index === 0) {
            // Current weather card
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
            // Forecast card
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

    // Function to fetch weather details
    const getWeatherDetails = (cityName, lat, lon) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        fetch(WEATHER_API_URL)
            .then(res => res.json())
            .then(data => {
                // Declare uniqueForecastDays before the filter method
                const uniqueForecastDays = [];
                
                // Filter the forecast data for unique days
                const sixDaysForecast = data.list.filter(forecast => {
                    // Extract date in YYYY-MM-DD format from forecast.dt_txt
                    const forecastDate = new Date(forecast.dt_txt).toLocaleDateString('en-CA'); // 'en-CA' format is YYYY-MM-DD
                    
                    // If this date is not in uniqueForecastDays, add it
                    if (!uniqueForecastDays.includes(forecastDate)) {
                        uniqueForecastDays.push(forecastDate); // Add the unique date
                        return true; // Keep this forecast
                    }
                    return false; // Skip duplicate forecasts
                });
    
                console.log("Full forecast data:", data);
                console.log(`Captured forecast for ${sixDaysForecast.length} unique days.`);
    
                // Clear previous weather cards
                currentWeatherDiv.innerHTML = "";
                weatherCardsDiv.innerHTML = "";
    
                // Add the current weather card (for today) first
                sixDaysForecast.forEach((weatherItem, index) => {  
                    if (index === 0) {
                        // Add current weather card
                        currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
                    } else {
                        // Add forecast cards for the next days
                        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                    }
                });
    
                // Clear the city input after fetching data
                cityInput.value = "";
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                alert("An error occurred while fetching the weather forecast!");
            });
    };
    

    // Function to get the coordinates of a city from user input
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

        // Clear the city input after fetching coordinates
        cityInput.value = "";
    };

    // Function to get the user's coordinates using geolocation
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

        // Clear the city input after using current location
        cityInput.value = "";
    };

    // Function to handle the chatbot interaction
    const sendMessage = () => {
        const message = userInput.value.trim();
        if (message) {
            messagesDiv.innerHTML += `<div class="user-message"><p>${message}</p></div>`;
            userInput.value = "";

            if (message.includes("cold") || message.includes("coolest")) {
                messagesDiv.innerHTML += `<div class="bot-message"><p>Fetching the coolest place for you...</p></div>`;
                getColdPlaces();
            } else if (message.includes("travel") || message.includes("best")) {
                messagesDiv.innerHTML += `<div class="bot-message"><p>Fetching the recomment travel place...</p></div>`;
                getTravelDestinations();
            } else {
                messagesDiv.innerHTML += `<div class="bot-message"><p>I didn't understand that. You can ask about cold places or recoomend travel place or use the button below.</p></div>`;
            }

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    };

    // Display message for a given duration in the chatbot
    const displayMessage = (message, duration) => {
        // Create a new message element
        const messageElement = document.createElement("div");
        messageElement.classList.add("bot-message");
        messageElement.innerHTML = `<p>${message}</p>`;
        
        // Add the message to the messages div
        messagesDiv.appendChild(messageElement);

        // Scroll to the bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Remove the message after the specified duration
        setTimeout(() => {
            messageElement.style.display = "none";
        }, duration);
    };

    // Function to get the cold places
    const getColdPlaces = () => {
        const coldPlaces = [
            { name: "Antarctica", lat: -82.8628, lon: 135.0 },
            { name: "Siberia", lat: 55.0, lon: 105.0 },
            { name: "Greenland", lat: 71.7069, lon: -42.6043 },
            { name: "Alaska", lat: 61.3850, lon: -152.2683 }
        ];

        // Randomly select a cold place
        const randomColdPlace = coldPlaces[Math.floor(Math.random() * coldPlaces.length)];
        getWeatherDetails(randomColdPlace.name, randomColdPlace.lat, randomColdPlace.lon);
    };

    // Function to get the best travel destinations
    const getTravelDestinations = () => {
        const travelDestinations = [
            { name: "Paris", lat: 48.8566, lon: 2.3522 },  
            { name: "New York", lat: 40.7128, lon: -74.0060 },  
            { name: "Rome", lat: 41.9028, lon: 12.4964 }, 
            { name: "Kyoto", lat: 35.0116, lon: 135.7681 }, 
            { name: "London", lat: 51.5074, lon: -0.1278 }, 
            { name: "Sydney", lat: -33.8688, lon: 151.2093 },  
            { name: "Bangkok", lat: 13.7563, lon: 100.5018 },  
            { name: "Istanbul", lat: 41.0082, lon: 28.9784 }, 
            { name: "Machu Picchu", lat: -13.1631, lon: -72.5450 }  
        ];

        // Randomly select a travel destination
        const randomTravelPlace = travelDestinations[Math.floor(Math.random() * travelDestinations.length)];
        getWeatherDetails(randomTravelPlace.name, randomTravelPlace.lat, randomTravelPlace.lon);
    };

    // Event listeners for the buttons
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    document.querySelector(".option-btn-cold").addEventListener("click", () => {
        displayMessage("Fetching the coolest place for you...",500 );
        getColdPlaces();
    });

    document.querySelector(".option-btn-travel").addEventListener("click", () => {
        displayMessage("Fetching the best travel destination...", 500);
        getTravelDestinations();
    });

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