<template>
    <div class="container">
        <div class="header">
            <form @submit.prevent="fetchWeatherData" class="weather-form">
                <input type="text" v-model="city" placeholder="Enter city name" class="city-input">
                <button type="submit" class="submit-btn">Get Weather</button>
                <button type="button" @click="matchVibe" class="match-vibe-btn" v-if="weather">Match My Vibe</button>
            </form>
            <button @click="logout" class="logout-btn">Logout</button>
        </div>
        <div v-if="weather" class="weather-info">
            <button @click="toggleTempUnit" class="toggle-btn small-btn">Switch to {{ tempUnit === 'F' ? 'Celsius' :
                'Fahrenheit' }}</button>

            <p>Temperature: {{ displayTemperature }}°{{ tempUnit }}
            </p>
            <p>Feels Like: {{ displayFeelsLike }}°{{ tempUnit }}</p>
            <p>Humidity: {{ weather.humidity }}%</p>
            <p>Cloud Cover: {{ weather.cloud }}%</p>
            <p>It's currently {{ isDay ? 'daytime' : 'nighttime' }}.</p>
            <p>Condition: {{ apiCondition }}</p>
        </div>
        <div v-if="hourlyForecast.length > 0" class="hourly-forecast">
            <h2>Next 5 Hours Forecast</h2>
            <div class="hour" v-for="(hour, index) in next5HoursForecast" :key="index">
                <p>{{ formatHour(hour.time) }}: {{ hour.temp_f }}°F, Feels like: {{ hour.feelslike_f }}°F, Cloud: {{
                hour.cloud }}%, Humidity: {{ hour.humidity }}%, {{ hour.condition.text }}</p>
            </div>
        </div>
        <div v-if="matchedPrompt" class="matched-prompt">
            <p>{{ matchedPrompt }}</p>
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
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            apiCondition: '',
            tempUnit: 'F',
            hourlyForecast: [],
        };
    },
    computed: {
        displayTemperature() {
            return this.tempUnit === 'C' ? this.weather.temp_c : this.convertToFahrenheit(this.weather.temp_c);
        },
        displayFeelsLike() {
            return this.tempUnit === 'C' ? this.weather.feelslike_c : this.convertToFahrenheit(this.weather.feelslike_c);
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

            const apiKey = import.meta.env.VITE_API_KEY;
            try {
                await this.fetchCurrentWeather(apiKey);
                await this.fetchForecast(apiKey);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        },
        async fetchCurrentWeather(apiKey) {
            const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${this.city}`;
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch current weather data');
            const data = await response.json();
            this.weather = data.current;
            this.isDay = data.current.is_day;
            this.apiCondition = data.current.condition.text;
        },
        async fetchForecast(apiKey) {
            const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${this.city}&days=1&aqi=no&alerts=no`;
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch forecast data');
            const data = await response.json();
            this.hourlyForecast = data.forecast.forecastday[0].hour;
        },
        convertToFahrenheit(celsius) {
            return Math.round(celsius * 9 / 5 + 32);
        },
        matchVibe() {
            console.log("Matching vibe...");
            if (!this.weather) return;

            const temperatureFahrenheit = this.convertToFahrenheit(this.weather.temp_c);
            let condition = this.apiCondition;
            const isDayTime = this.isDay === 1;

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
        formatHour(hourString) {
            const date = new Date(hourString);
            let hours = date.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            return `${hours}:${minutes} ${ampm}`;
        },

        resetData() {
            this.weather = null;
            this.matchedPrompt = null;
            this.apiCondition = '';
            this.hourlyForecast = [];
        }
    },
};
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
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
    gap: 1rem;
    width: 100%;
}

.weather-info {
    flex-basis: 300px;
    padding: 1rem;
    margin-top: 2%;
    margin-right: 2%;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    min-height: 265px;
}

.hourly-forecast {
    flex-grow: 2;
    margin-top: 2%;
    padding: 1rem;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    min-height: 265px;
}

.matched-prompt {
    width: 100%;
    padding: 1rem;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    margin-top: 2%;
}

.weather-info p,
.matched-prompt p,
.hourly-forecast h2,
.hourly-forecast p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
    line-height: 1.7;
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
</style>
