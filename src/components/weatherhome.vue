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
        <div class="content">
            <div v-if="weather" class="weather-info">
                <p>Temperature: {{ displayTemperature }}°{{ tempUnit }}
                    <button @click="toggleTempUnit" class="toggle-btn small-btn">Switch to {{ tempUnit === 'F' ? 'Celsius' : 'Fahrenheit' }}</button>
                </p>
                <p>Feels Like: {{ displayFeelsLike }}°{{ tempUnit }}</p>
                <p>Humidity: {{ weather.humidity }}%</p>
                <p>Cloud Cover: {{ weather.cloud }}%</p>
                <p>It's currently {{ isDay ? 'daytime' : 'nighttime' }}.</p>
                <p>Condition: {{ apiCondition }}</p>
            </div>
            <div v-if="matchedPrompt" class="matched-prompt">
                <p>{{ matchedPrompt }}</p>
            </div>
        </div>
    </div>
</template>


<script>
import weatherPrompts from '../../weather_prompts.json';
export default {
	name: 'weatherhome',
	data() {
		return {
			city: '', // To store the user input
			weather: null, // To store the weather data
			matchedPrompt: null, // To store the matched prompt
			isDay: null,
			userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			apiCondition: '',
			tempUnit: 'F', // Default temperature unit
		};
	},
	computed: {
		displayTemperature() {
			return this.tempUnit === 'C' ? this.weather.temp_c : this.convertToFahrenheit(this.weather.temp_c);
		},
		displayFeelsLike() {
			return this.tempUnit === 'C' ? this.weather.feelslike_c : this.convertToFahrenheit(this.weather.feelslike_c);
		},
	},
	methods: {
		async fetchWeatherData() {
            // Reset the data for a new search
            this.weather = null;
            this.matchedPrompt = null;
            this.apiCondition = '';

			const apiKey = import.meta.env.VITE_API_KEY;
			const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${this.city}`;

			try {
				const response = await fetch(url, {
					method: 'GET',
				});
				if (!response.ok) {
					throw new Error('Failed to fetch weather data');
				}
				const data = await response.json();
				this.weather = data.current;
				this.isDay = data.current.is_day;
				this.apiCondition = data.current.condition.text;
			} catch (error) {
				console.error('Error fetching weather data:', error);
			}
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
			localStorage.removeItem('isAuthenticated'); // Clear authentication flag
			this.$router.push('/'); // Redirect to login page
		},
		toggleTempUnit() {
			this.tempUnit = this.tempUnit === 'F' ? 'C' : 'F';
		},
		isDaytime() {
			const currentTime = new Date().toLocaleTimeString("en-US", { timeZone: this.userTimezone, hour12: false, hour: '2-digit' });
			const currentHour = parseInt(currentTime, 10); // Convert to integer for comparison
			return currentHour >= 6 && currentHour < 18; // Considering day time from 6 AM to 6 PM
		},
	},
};
</script>
<style scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 1.5rem;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 1rem;
    background-color: #F0F2F5;
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    color: #1C1E21;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.weather-form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.city-input {
    padding: 0.75rem;
    border: 2px solid #4267B2;
    border-radius: 6px;
    font-size: 1rem;
}

.submit-btn, .match-vibe-btn, .logout-btn {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    color: white;
    background-color: #4267B2;
    transition: background-color 0.3s, transform 0.2s;
}

.logout-btn {
    margin-left: auto;
    background-color: #D9534F;
}

.submit-btn:hover, .match-vibe-btn:hover, .logout-btn:hover {
    background-color: #365899;
}

.content {
    display: flex;
    gap: 2rem;
}

.weather-info, .matched-prompt {
    padding: 1rem;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.weather-info p, .matched-prompt p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
    line-height: 1.7;
}

.toggle-btn, .small-btn {
    padding: 0.3rem 0.6rem;
    margin-left: 1rem;
    border: 2px solid #4267B2;
    border-radius: 6px;
    background-color: #FFFFFF;
    cursor: pointer;
    font-size: 0.9rem;
    color: #4267B2;
    transition: background-color 0.3s, color 0.3s;
    vertical-align: middle;
}

.toggle-btn:hover, .small-btn:hover {
    background-color: #4267B2;
    color: #FFFFFF;
}
</style>
