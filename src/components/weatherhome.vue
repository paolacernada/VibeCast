<template>
    <div class="container">
        <div class="header">
            <form @submit.prevent="fetchWeatherData" class="weather-form">
                <input type="text" v-model="zipCode" placeholder="Enter ZIP code" class="city-input"
                    @focus="clearZipCode">
                <button type="submit" class="submit-btn">Get Weather</button>
            </form>
            <button type="button" @click="matchVibe" class="forecast-btn"
                v-if="weather && !showHourlyForecast && !showSevenDayForecast">VibeSync</button>
            <button @click="logout" class="logout-btn">Logout</button>
        </div>
        <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
        </div>
        <div v-if="geoLocationError" class="error-message">{{ geoLocationError }}</div>
        <!-- Matched Prompt Section -->
        <transition name="fade">
            <div v-if="matchedPrompt && matchedVibeClicked" class="matched-prompt">
                <p>{{ matchedPrompt }}</p>
            </div>
        </transition>
        <!-- Weather Info Section -->
        <div v-if="weather && !showHourlyForecast && !showSevenDayForecast" class="weather-info">
            <div class="location-info">
                <h3>{{ cityName }}, {{ regionName }}</h3>
            </div>
            <h2>Now</h2>
            <button @click="toggleTempUnit" class="toggle-btn small-btn">Switch to {{ tempUnit === 'F' ? 'Celsius' :
                'Fahrenheit' }}</button>
            <p><span class="descriptive">Temperature:</span> {{ displayTemperature }}°{{ tempUnit }}</p>
            <p><span class="descriptive">Feels Like:</span> {{ displayFeelsLike }}°{{ tempUnit }}</p>
            <p><span class="descriptive">Humidity:</span> {{ weather.humidity }}%</p>
            <p><span class="descriptive">Cloud Cover:</span> {{ weather.cloud }}%</p>
            <p><span class="descriptive">Condition:</span> {{ apiCondition }}</p>
            <button type="button" @click="showHourlyForecastView" class="forecast-btn">8-Hour Forecast</button>
            <button type="button" @click="showSevenDayForecastView" class="forecast-btn">7-day Forecast</button>
        </div>
        <!-- Hourly Forecast Section -->
        <div v-if="showHourlyForecast" class="hourly-forecast">
            <div class="location-info">
                <h3>{{ cityName }}, {{ regionName }}</h3>
            </div>
            <h2>Hourly Forecast</h2>
            <button @click="toggleHourlyTempUnit" class="toggle-btn small-btn">Switch to {{
                hourlyTempUnit === 'F' ?
                    'Celsius' : 'Fahrenheit' }}</button>
            <div v-if="forecastErrorMessage" class="error-message">
                {{ forecastErrorMessage }}
            </div>
            <div class="hour" v-for="(hour, index) in nextEightHoursData" :key="index">
                <p>
                    <span class="descriptive">{{ hour.time }}:</span>
                    {{ formatHourlyTemp(hour.temp_f, hour.temp_c) }}°{{ hourlyTempUnit }},
                    <strong>Feels like:</strong> {{ formatHourlyTemp(hour.feelsLike_f, hour.feelsLike_c) }}°{{
                hourlyTempUnit }},
                    <strong>Cloud:</strong> {{ hour.cloud }}, <strong>Humidity:</strong> {{ hour.humidity }},
                    {{ hour.condition }}
                </p>
            </div>
            <button type="button" @click="resetView" class="forecast-btn">Back to Weather Info</button>
        </div>
        <!-- 7-day Forecast Section -->
        <div v-if="showSevenDayForecast" class="seven-day-forecast">
            <div class="location-info">
                <h3>{{ cityName }}, {{ regionName }}</h3>
            </div>
            <h2>7-day Forecast</h2>
            <button @click="toggleSevenDayTempUnit" class="toggle-btn small-btn">
                Switch to {{ sevenDayTempUnit === 'F' ? 'Celsius' : 'Fahrenheit' }}
            </button>
            <div class="forecast-container">
                <div class="day" v-for="(day, index) in sevenDayForecast" :key="index">
                    <p><span class="descriptive">{{ formatDay(day.date) }}</span></p>
                    <p>{{ day.day.condition.text }}</p>
                    <p><strong>Max: </strong>{{ formatTemp(day.day.maxtemp_f, day.day.maxtemp_c) }}°{{ sevenDayTempUnit
                        }}</p>
                    <p><strong>Min: </strong>{{ formatTemp(day.day.mintemp_f, day.day.mintemp_c) }}°{{ sevenDayTempUnit
                        }}</p>
                </div>
            </div>
            <button type="button" @click="resetView" class="forecast-btn">Back to Weather Info</button>
        </div>
    </div>
</template>

<script>
import weatherPrompts from '../../weather_prompts.json';
import moment from 'moment';
import 'moment-timezone';

export default {
    name: 'weatherhome',
    data() {
        return {
            zipCode: '',
            weather: null,
            matchedPrompt: null,
            isDay: null,
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Capture the user's current timezone
            apiCondition: '',
            tempUnit: 'F',
            hourlyForecast: [],
            sevenDayForecast: [],
            sevenDayTempUnit: 'F',
            hourlyTempUnit: 'F',
            showHourlyForecast: false,
            showSevenDayForecast: false,
            matchedVibeClicked: false,
            cityName: '',
            regionName: '',
            backgroundImage: null,
            locationTimezone: '',
            nextEightHoursData: [],
            errorMessage: '',
            forecastErrorMessage: '',
            geoLocationError: ''
        };
    },
    mounted() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.getZipCode(latitude, longitude);
                },
                (error) => {
                    this.geoLocationError = "We're having a little trouble finding you. Let's try a different way.";
                    // Fallback to IP-based location if Geolocation fails
                    this.fetchLocationFromIP();
                }
            );
        } else {
            this.geoLocationError = "It seems your device is a bit shy and doesn't want to share its location. No worries, we have another trick up our sleeve.";
            // Fallback to IP-based location if Geolocation is not supported
            this.fetchLocationFromIP();
        }
    },
    computed: {
        displayTemperature() {
            return this.tempUnit === 'C' ? this.weather.temp_c : this.convertToFahrenheit(this.weather.temp_c);
        },
        displayFeelsLike() {
            return this.tempUnit === 'C' ? this.weather.feelslike_c : this.convertToFahrenheit(this.weather.feelslike_c);
        },
        userTimezoneOffset() {
            const offset = new Date().getTimezoneOffset();
            const absOffset = Math.abs(offset);
            const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
            const minutes = String(absOffset % 60).padStart(2, '0');
            const sign = offset > 0 ? '-' : '+';
            return `${sign}${hours}:${minutes}`;
        },
    },
    methods: {
        async fetchWeatherData() {
            this.errorMessage = '';
            this.resetData();
            this.showHourlyForecast = false;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;

            const apiKey = import.meta.env.VITE_API_KEY;
            try {
                await this.fetchCurrentWeather(apiKey);
                await this.fetchForecast(apiKey);
                await this.fetchSevenDayForecast(apiKey);

            } catch (error) {
                if (this.zipCode.trim() === '') {
                    this.errorMessage = "Looks like we're missing a zipcode. Enter one to get started 📍";
                } else {
                    this.errorMessage = "Hmm, we couldn't find that location. Please double-check your zipcode and try again. 🔍";
                }
            }
        },
        async fetchCurrentWeather(apiKey) {
            const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${this.zipCode}&tz=${this.userTimezone}`;
            try {
                const response = await fetch(url, { method: 'GET' });
                if (!response.ok) {
                    this.errorMessage = "We're stumped! Couldn't find that location. Could you double-check and try again?";
                    return;
                }
                const data = await response.json();
                this.weather = data.current;
                this.isDay = data.current.is_day;
                this.apiCondition = data.current.condition.text;
                this.cityName = data.location.name;
                this.regionName = data.location.region;
                this.locationTimezone = data.location.tz_id;
            } catch (error) {
                this.errorMessage = "Oh no! We couldn't pinpoint your weather right now. Maybe double-check that ZIP code?";
            }
        },
        async fetchSevenDayForecast(apiKey) {
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${this.zipCode}&days=8&aqi=no&alerts=no`; // Request 8 days to ensure we have 7 days excluding today
            const response = await fetch(url);
            if (!response.ok) throw new Error("Looks like the 7-day outlook is playing hard to get. We couldn't fetch it this time.");
            const data = await response.json();

            // Skip the first day's data and keep the next 7 days
            this.sevenDayForecast = data.forecast.forecastday.slice(1); // Start from index 1 to exclude today
        },
        async fetchForecast(apiKey) {
            const currentHour = new Date().getHours();
            let daysToFetch = 1;

            // If it's late in the day, fetch the forecast for one more day
            if (currentHour > 18) {
                daysToFetch = 2; // Fetch forecast for the next 2 days to include the next day's hourly forecast
            }

            const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${this.zipCode}&days=${daysToFetch}&aqi=no&alerts=no`;
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error("🤔 we're having trouble peeking into the future. Forecast data is currently unavailable.");
            const data = await response.json();

            if (data && data.forecast && data.forecast.forecastday) {
                this.nextEightHoursData = this.getNextEightHoursForecast(data.forecast.forecastday);
            }
        },
        convertToLocationTimeZone(dateStr) {
            const dateInLocationTimeZone = moment(dateStr).tz(this.locationTimezone);
            return dateInLocationTimeZone.toDate();
        },
        getNextEightHoursForecast(forecastData) {
            const nowInLocationTimeZone = moment.tz(this.locationTimezone);
            let startHour = nowInLocationTimeZone.hours();

            if (nowInLocationTimeZone.minutes() > 0) {
                startHour += 1; // Advance to the next hour if current minutes are not 0
            }

            let hoursNeeded = 8;
            const result = [];

            for (let i = 0; i < hoursNeeded; i++) {
                const forecastHour = (startHour + i) % 24;
                const isTomorrow = startHour + i >= 24;

                if (isTomorrow && forecastData.length < 2) {
                    this.forecastErrorMessage = "We can't peek into tomorrow's 🕒 hourly forecast just yet. Check back later for updates!";
                    break; // Exit the loop if forecast data for the next day is not available
                }

                const dayIndex = isTomorrow ? 1 : 0;
                const dayForecast = forecastData[dayIndex].hour;
                const hourForecast = dayForecast.find(h => {
                    const hourDate = moment.tz(h.time, this.locationTimezone);
                    return hourDate.hours() === forecastHour;
                });

                if (hourForecast) {
                    const forecastDateTime = new Date(hourForecast.time);

                    result.push({
                        time: this.formatTime(forecastDateTime),
                        temp_f: hourForecast.temp_f,
                        temp_c: hourForecast.temp_c,
                        feelsLike_f: hourForecast.feelslike_f,
                        feelsLike_c: hourForecast.feelslike_c,
                        cloud: `${hourForecast.cloud}%`,
                        humidity: `${hourForecast.humidity}%`,
                        condition: hourForecast.condition.text.trim()
                    });
                }
            }
            return result;
        },
        convertToFahrenheit(celsius) {
            return Math.round(celsius * 9 / 5 + 32);
        },
        matchVibe() {
            if (!this.weather) return;

            let condition = this.normalizeConditionText(this.apiCondition);
            this.matchedVibeClicked = true;
            this.getBackground();

            this.matchedPrompt = this.getMatchedPrompt(condition) || "Sunshine or Rain, Our Spirits Remain Unchained!";
        },
        toggleTempUnit() {
            this.tempUnit = this.tempUnit === 'F' ? 'C' : 'F';
        },
        toggleSevenDayTempUnit() {
            this.sevenDayTempUnit = this.sevenDayTempUnit === 'F' ? 'C' : 'F';
        },
        toggleHourlyTempUnit() {
            this.hourlyTempUnit = this.hourlyTempUnit === 'F' ? 'C' : 'F';
        },
        formatHour(hourString) {
            const date = new Date(hourString);
            let hours = date.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' is '12'
            const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            return `${hours}:${minutes} ${ampm}`;
        },
        formatTemp(tempF, tempC) {
            return this.sevenDayTempUnit === 'F' ? tempF : tempC;
        },
        formatHourlyTemp(tempF, tempC) {
            return this.hourlyTempUnit === 'F' ? tempF : tempC;
        },
        formatDay(dateString) {
            const date = new Date(dateString + 'T00:00:00' + this.userTimezoneOffset);

            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day}`;
        },
        formatTime(date) {
            let hours = date.getHours();
            let minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours || 12; // the hour '0' is '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        },
        resetData() {
            this.weather = null;
            this.matchedPrompt = null;
            this.apiCondition = '';
            this.hourlyForecast = [];
            this.showHourlyForecast = false;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;
            this.backgroundImage = null;
            document.body.style.backgroundImage = 'none';
        },
        resetView() {
            this.showHourlyForecast = false;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;
            document.body.style.backgroundImage = 'none';
        },
        showHourlyForecastView() {
            this.showHourlyForecast = true;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;
            document.body.style.backgroundImage = 'none';
        },
        showSevenDayForecastView() {
            this.showHourlyForecast = false;
            this.showSevenDayForecast = true;
            this.matchedVibeClicked = false;
            document.body.style.backgroundImage = 'none';
        },
        getBackground() {
            let condition = this.normalizeConditionText(this.apiCondition);
            this.backgroundImage = this.getBackgroundImage(condition);
            if (this.backgroundImage) {
                document.body.style.backgroundImage = `url('/backgrounds/${this.backgroundImage}')`;
            } else {
                this.clearBackgroundImage();
            }
        },
        getBackgroundImage(condition) {
            const conditionMap = {
                "Light rain shower": "light-rain-shower.png",
                "Thundery outbreaks possible": "thundery-outbreaks-possible.png",
                "Patchy light rain with thunder": "thundery-outbreaks-possible.png",
                "Moderate or heavy rain with thunder": "thundery-outbreaks-possible.png",
                "Patchy light snow with thunder": "thundery-outbreaks-possible.png",
                "Heavy snow": "heavy-snow.png",
                "Moderate or heavy snow showers": "heavy-snow.png",
                "Patchy heavy snow": "heavy-snow.png",
                "Blowing snow": "heavy-snow.png",
                "Moderate snow": "moderate-snow.png",
                "Light snow": "moderate-snow.png",
                "Light snow showers": "moderate-snow.png",
                "Patchy moderate snow": "moderate-snow.png",
                "Patchy light rain": "patchy-light-rain.png",
                "Patchy rain nearby": "patchy-light-rain.png",
                "Light rain": "light-rain.png",
                "Light rain shower": "light-rain.png",
                "Moderate rain at times": "light-rain.png",
                "Moderate rain": "light-rain.png",
                "Patchy light drizzle": "light-rain.png",
                "Light drizzle": "light-rain.png",
                "Blizzard": "blizzard.png",
                "Fog": "fog.png",
                "Freezing fog": "fog.png",
                "Overcast": "overcast.png",
                "Partly cloudy": "partly-cloudy.png",
                "Partly Cloudy": "partly-cloudy.png",
                "Sunny": "sunny.png",
                "Clear": "clear.png",
                "Cloudy": "cloudy.png",
                "Mist": "mist.png",
                "Heavy rain": "heavy-rain.png",
                "Moderate or heavy rain shower": "heavy-rain.png",
                "Torrential rain shower": "heavy-rain.png",
            };
            return conditionMap[condition] || null;
        },
        getMatchedPrompt(condition) {
            const temperatureFahrenheit = this.convertToFahrenheit(this.weather.temp_c);
            const tempRanges = Object.keys(weatherPrompts);

            for (let range of tempRanges) {
                const [min, max] = range.split('-').map(Number);
                if (temperatureFahrenheit >= min && temperatureFahrenheit <= max) {
                    const { daytime, nighttime } = weatherPrompts[range];
                    return daytime[condition] || nighttime[condition];
                }
            }
            return null;
        },
        normalizeConditionText(conditionText) {
            return conditionText.trim().replace(/\s+/g, ' ');
        },
        beforeDestroy() {
            document.body.style.backgroundImage = 'none';
        },
        clearBackgroundImage() {
            this.backgroundImage = null;
            document.body.style.backgroundImage = 'none';
        },
        logout() {
            document.body.style.backgroundImage = 'none';
            localStorage.removeItem('isAuthenticated');
            this.$router.push('/');
        },
        beforeDestroy() {
            document.body.style.backgroundImage = 'none';
        },
        clearZipCode() {
            this.zipCode = '';
        },
        async promptForCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        this.getZipCode(latitude, longitude);
                    },
                    (error) => {
                        this.errorMessage = "We're a bit lost ourselves and couldn't find your location. Mind entering it manually?";
                        // Fallback to IP-based location
                        this.fetchLocationFromIP();
                    }
                );
            } else {
                // Fallback to IP-based location if geolocation is not supported
                this.fetchLocationFromIP();
            }
        },
        async fetchLocationFromIP() {
            const apiKey = import.meta.env.VITE_IPAPI_API_KEY;
            const url = `https://ipapi.co/json/?access_key=${apiKey}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    this.errorMessage = "Hmm, we're having trouble pinpointing your location. Please enter it manually.";
                    return;
                }

                const data = await response.json();

                if (data.latitude && data.longitude) {
                    this.getZipCode(data.latitude, data.longitude);
                } else {
                    this.errorMessage = "We found your location, but couldn't figure out the zip code. Mind entering it?";
                }
            } catch (error) {
                this.errorMessage = "Oops, we hit a snag while trying to automatically find your location. Could you type it in instead?";
            }
        },
        async getZipCode(latitude, longitude) {
            this.loadingZipCode = true;
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            if (data.postcode) {
                this.zipCode = data.postcode;
                this.fetchWeatherData();
            } else {
                return "Zip code not found";
            }
            this.loadingZipCode = false;
        },
    },
};
</script>

<style scoped>
.seven-day-forecast {
    margin-top: 2%;
    padding: 0.8rem;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    width: fit-content;
    height: auto;
}

.seven-day-forecast .forecast-container {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;

}

.container {
    max-width: 800px;
    width: auto;
    margin: 0.6em;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(240, 242, 245, 0.75);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    color: #1C1E21;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.weather-form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.city-input,
.submit-btn,
.match-vibe-btn,
.logout-btn {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 1rem;
    margin-right: 1.5rem;
}

.city-input {
    flex-grow: 1;
    border: 2px solid #4267B2;
}

.submit-btn,
.match-vibe-btn,
.logout-btn {
    border: none;
    color: white;
    background-color: #4267B2;
}

.logout-btn {
    margin-left: auto;
    background-color: #6A5ACD;
}

.submit-btn:hover,
.match-vibe-btn:hover,
.logout-btn:hover {
    background-color: #365899;
}

.content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
}

.weather-info {
    flex-basis: auto;
    padding: 0.8rem;
    margin-top: 2%;
    margin-right: 2%;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);

    width: fit-content;
}

.seven-day-forecast .day {
    margin-right: 0.5rem;
}

.hourly-forecast {
    margin-top: 2%;
    padding: 0.8rem;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    height: fit-content;
    width: fit-content;
}

.matched-prompt {
    width: fit-content;
    padding: 1rem;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    margin-top: 2%;
}

.weather-info p,
.weather-info h2,
.matched-prompt p,
.seven-day-forecast .day p,
.seven-day-forecast h2,
.hourly-forecast h2,
.hourly-forecast p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.7;
}

.matched-prompt p {
    color: #6A5ACD;
}

.seven-day-forecast .day p {
    margin-top: 0.6rem;
}

.toggle-btn,
.small-btn {
    padding: 0.3rem 0.6rem;
    border: 2px solid #4267B2;
    border-radius: 6px;
    background-color: #FFFFFF;
    cursor: pointer;
    font-size: 0.9rem;
    color: #4267B2;
}

.toggle-btn:hover,
.small-btn:hover {
    background-color: #4267B2;
    color: #FFFFFF;
}

.forecast-btn {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 1rem;
    margin-right: 1.5rem;
    border: none;
    color: white;
    background-color: #4267B2;
    cursor: pointer;
}

.forecast-btn:hover {
    background-color: #365899;
}

.weather-info,
.hourly-forecast,
.seven-day-forecast,
.matched-prompt {
    margin-bottom: 2px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.05);
}

.matched-prompt {
    padding: 13px;
}

.location-info h3 {
    margin-top: 0;
    font-size: 1.2rem;
    color: #333;
}

.weather-info p,
.hourly-forecast p,
.seven-day-forecast .day p {
    font-weight: 500;
    line-height: 1.6;
    color: #555;
    margin-bottom: 0.8rem;
}

.descriptive {
    font-weight: bold;
    color: #4267B2;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 2.5s ease, transform 2.5s ease;
}

.fade-enter,
.fade-enter-to,
.fade-leave-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-enter-from,
.fade-leave-active {
    opacity: 0;
    transform: translateY(-20px);
}

.fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.error-message {
    margin: 1rem 0;
    padding: 0.75rem;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 0.25rem;
    text-align: center;
    width: fit-content;
}

body {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 111vh;
    overflow: hidden;
    background-attachment: fixed;
}

/* Media Queries */
@media (max-width: 600px) {

    .container,
    .weather-info,
    .hourly-forecast,
    .seven-day-forecast,
    .matched-prompt {
        margin: 10px;
        padding: 15px;
        width: calc(100% - 20px);
        box-sizing: border-box;
    }

    .weather-form {
        width: 100%;
    }

    .city-input {
        width: calc(100% - 20px);
        margin-bottom: 10px;
    }

    .submit-btn,
    .forecast-btn,
    .toggle-btn,
    .small-btn,
    .logout-btn {
        width: 100%;
        margin: 5px 0;
    }

    .forecast-container,
    .hourly-forecast .hour,
    .seven-day-forecast .day {
        flex-direction: column;
        align-items: center;
    }

    .location-info h3 {
        font-size: 1.1rem;
    }

    .weather-info h2,
    .hourly-forecast h2,
    .seven-day-forecast h2 {
        font-size: 1.3rem;
    }

    .descriptive {
        display: block;
        font-size: 0.9rem;
    }

    .seven-day-forecast .forecast-container {
        flex-direction: column;
        gap: none;
    }

    .seven-day-forecast .day {
        width: 100%;
        margin-right: 0;
        box-sizing: border-box;
    }

    .seven-day-forecast,
    .hourly-forecast,
    .weather-info {
        width: auto;
        margin: 0;
        padding: 1em;
    }

    .location-info h3,
    .weather-info h2,
    .seven-day-forecast h2,
    .hourly-forecast h2 {
        font-size: 1.1rem;
    }

    .descriptive {
        display: block;
        font-weight: 600;
    }

    .toggle-btn,
    .forecast-btn,
    .logout-btn,
    .small-btn {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .submit-btn {
        margin-top: -3px;
    }

    .logout-btn {
        margin-bottom: 15px;
    }
}
</style>