<template>
    <div class="container">
        <div class="header">
            <form @submit.prevent="fetchWeatherData" class="weather-form">
                <input type="text" v-model="city" placeholder="Enter city name" class="city-input">
                <button type="submit" class="submit-btn">Get Weather</button>
            </form>
            <button type="button" @click="matchVibe" class="forecast-btn"
                v-if="weather && !showHourlyForecast && !showSevenDayForecast">Match My Vibe</button>
            <button @click="logout" class="logout-btn">Logout</button>
        </div>
        <!-- Matched Prompt Section -->
        <div v-if="matchedPrompt && matchedVibeClicked" class="matched-prompt">
            <p>{{ matchedPrompt }}</p>
        </div>
        <!-- Weather Info Section -->
        <div v-if="weather && !showHourlyForecast && !showSevenDayForecast" class="weather-info">
            <h2>Now</h2>
            <button @click="toggleTempUnit" class="toggle-btn small-btn">Switch to {{ tempUnit === 'F' ? 'Celsius' :
                'Fahrenheit' }}</button>
            <p>Temperature: {{ displayTemperature }}°{{ tempUnit }}</p>
            <p>Feels Like: {{ displayFeelsLike }}°{{ tempUnit }}</p>
            <p>Humidity: {{ weather.humidity }}%</p>
            <p>Cloud Cover: {{ weather.cloud }}%</p>
            <p>Condition: {{ apiCondition }}</p>
            <button type="button" @click="showHourlyForecastView" class="forecast-btn">Get 5 Hour Forecast</button>
            <button type="button" @click="showSevenDayForecastView" class="forecast-btn">Get 7-day Forecast</button>
        </div>
        <!-- Hourly Forecast Section -->
        <div v-if="showHourlyForecast" class="hourly-forecast">
            <h2>5 Hour Forecast</h2>
            <button @click="toggleHourlyTempUnit" class="toggle-btn small-btn">Switch to {{ hourlyTempUnit === 'F' ?
                'Celsius' : 'Fahrenheit' }}</button>
            <div class="hour" v-for="(hour, index) in next5HoursForecast" :key="index">
                <p>{{ formatHour(hour.time) }}: {{ formatHourlyTemp(hour.temp_f, hour.temp_c) }}°{{ hourlyTempUnit }},
                    Feels like: {{ formatHourlyTemp(hour.feelslike_f, hour.feelslike_c) }}°{{ hourlyTempUnit }}, Cloud:
                    {{ hour.cloud }}%, Humidity: {{ hour.humidity }}%, {{ hour.condition.text }}</p>
            </div>
            <button type="button" @click="resetView" class="forecast-btn">Back to Weather Info</button>
        </div>
        <!-- 7-day Forecast Section -->
        <div v-if="showSevenDayForecast" class="seven-day-forecast">
            <h2>7-day Forecast</h2>
            <button @click="toggleSevenDayTempUnit" class="toggle-btn small-btn">
                Switch to {{ sevenDayTempUnit === 'F' ? 'Celsius' : 'Fahrenheit' }}
            </button>
            <div class="forecast-container">
                <div class="day" v-for="(day, index) in sevenDayForecast" :key="index">
                    <p>{{ formatDay(day.date) }}</p>
                    <p>{{ day.day.condition.text }}</p>
                    <p>Max: {{ formatTemp(day.day.maxtemp_f, day.day.maxtemp_c) }}°{{ sevenDayTempUnit }}</p>
                    <p>Min: {{ formatTemp(day.day.mintemp_f, day.day.mintemp_c) }}°{{ sevenDayTempUnit }}</p>
                </div>
            </div>
            <button type="button" @click="resetView" class="forecast-btn">Back to Weather Info</button>
        </div>
    </div>
</template>


<script>
import weatherPrompts from '../../weather_prompts.json';

export default {
    name: 'weatherhome',
    data() {
        return {
            city: '',
            weather: null,
            matchedPrompt: null,
            isDay: null,
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Captures the user's current timezone
            apiCondition: '',
            tempUnit: 'F',
            hourlyForecast: [],
            sevenDayForecast: [],
            sevenDayTempUnit: 'F',
            hourlyTempUnit: 'F',
            showHourlyForecast: false,
            showSevenDayForecast: false,
            matchedVibeClicked: false,
        };
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
        next5HoursForecast() {
            const currentHour = new Date().getHours();
            return this.hourlyForecast.filter(hour => {
                const hourDate = new Date(hour.time);
                const hourOfForecast = hourDate.getHours();
                return hourOfForecast > currentHour && hourOfForecast <= currentHour + 5;
            });
        }
    },
    methods: {
        async fetchWeatherData() {
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
                console.error('Error fetching weather data:', error);
            }
        },
        async fetchCurrentWeather(apiKey) {
            const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${this.city}&tz=${this.userTimezone}`;
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch current weather data');
            const data = await response.json();
            this.weather = data.current;
            this.isDay = data.current.is_day;
            this.apiCondition = data.current.condition.text;
        },
        async fetchSevenDayForecast(apiKey) {
            const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${this.city}&days=8&aqi=no&alerts=no`; // Request 8 days to ensure we have 7 days excluding today
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch 7-day forecast data');
            const data = await response.json();

            // Skip the first day's data (today) and keep the next 7 days
            this.sevenDayForecast = data.forecast.forecastday.slice(1); // Start from index 1 to exclude today
        },
        async fetchForecast(apiKey) {
            const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${this.city}&days=1&aqi=no&alerts=no&tz=${this.userTimezone}`;
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch forecast data');
            const data = await response.json();
            this.hourlyForecast = data.forecast.forecastday[0].hour;
        },
        convertToFahrenheit(celsius) {
            return Math.round(celsius * 9 / 5 + 32);
        },
        matchVibe() {
            if (!this.weather) return;

            const temperatureFahrenheit = this.convertToFahrenheit(this.weather.temp_c);
            let condition = this.apiCondition;
            const isDayTime = this.isDay === 1;
            this.matchedVibeClicked = true; // Ensure this is set to true when the method is called

            // Iterating through each temperature range to find a match
            for (let tempRange in weatherPrompts) {
                const [min, max] = tempRange.split('-').map(Number);
                if (temperatureFahrenheit >= min && temperatureFahrenheit <= max) {
                    // Accessing the daytime or nighttime prompts within the matched temperature range
                    const prompts = isDayTime ? weatherPrompts[tempRange].daytime : weatherPrompts[tempRange].nighttime;

                    // If the API condition matches one of the conditions in the prompts, use it
                    if (prompts[condition]) {
                        this.matchedPrompt = prompts[condition];
                        return;
                    }
                }
            }
            // Fallback to custom logic or default prompt if no match found
            this.matchedPrompt = "Enjoy the weather, no matter the vibe!";
        },

        logout() {
            localStorage.removeItem('isAuthenticated');
            this.$router.push('/');
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
            hours = hours ? hours : 12; // the hour '0' should be '12'
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
            // Create a Date object using the dateString and the user's time zone
            const date = new Date(dateString + 'T00:00:00' + this.userTimezoneOffset);

            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day}`;
        },
        resetData() {
            this.weather = null;
            this.matchedPrompt = null;
            this.apiCondition = '';
            this.hourlyForecast = [];
            this.showHourlyForecast = false;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;
        },
        resetView() {
            this.showHourlyForecast = false;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;
        },
        showHourlyForecastView() {
            this.showHourlyForecast = true;
            this.showSevenDayForecast = false;
            this.matchedVibeClicked = false;
        },

        showSevenDayForecastView() {
            this.showHourlyForecast = false;
            this.showSevenDayForecast = true;
            this.matchedVibeClicked = false;
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
    width: 100%;
    margin: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: left;
    background-color: #F0F2F5;
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
    height: auto;
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
    width: auto;
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
</style>
