<template>
	<div class="weather-home">
		<form @submit.prevent="fetchWeatherData" class="weather-form">
			<input type="text" v-model="city" placeholder="Enter city name" class="city-input">
			<button type="submit" class="submit-btn">Get Weather</button>
		</form>
		<div v-if="weather" class="weather-info">
			<p>Temperature: {{ displayTemperature }}°{{ tempUnit }}
				<button @click="toggleTempUnit" class="toggle-btn small-btn">Switch to {{ tempUnit === 'F' ? 'Celsius' :
			'Fahrenheit' }}</button>
			</p>
			<p>Feels Like: {{ displayFeelsLike }}°{{ tempUnit }}</p>
			<p>Humidity: {{ weather.humidity }}%</p>
			<p>Cloud Cover: {{ weather.cloud }}%</p>
			<p>It's currently {{ isDay ? 'daytime' : 'nighttime' }}.</p>
			<p>Condition: {{ apiCondition }}</p>
		</div>
		<button v-if="weather" @click="matchVibe" class="match-vibe-btn">Match My Vibe</button>
		<button @click="logout" class="logout-btn">Logout</button>
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
			this.matchedPrompt = null; // Reset the matched prompt at the start of a new search
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
				this.weather = data.current; // Store the weather data
				this.currentCondition = data.current.condition.text;
				this.isDay = data.current.is_day;
				this.apiCondition = data.current.condition.text;
			} catch (error) {
				console.error('Error fetching weather data:', error);
				this.weather = null; // Reset weather data on error
			}
		},
		convertToFahrenheit(celsius) {
			return Math.round(celsius * 9 / 5 + 32);
		},
		matchVibe() {
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
.weather-home,
.weather-info {
	max-width: 600px;
	margin: 2rem auto;
	padding: 1.5rem;
	text-align: center;
	background-color: #F0F2F5;
	border-radius: 12px;
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
	font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
	color: #1C1E21;
}

.weather-form {
	margin-bottom: 2rem;
}

.city-input {
	padding: 0.75rem;
	margin-right: 0.5rem;
	margin-bottom: 1rem;
	border: 2px solid #4267B2;
	border-radius: 6px;
	font-size: 1rem;
	width: calc(100% - 120px);
	display: inline-block;
	vertical-align: top;
}

.submit-btn,
.match-vibe-btn {
	padding: 0.75rem 1rem;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 1rem;
	color: white;
	transition: background-color 0.3s, transform 0.2s;
	display: inline-block;
}

.submit-btn,
.match-vibe-btn {
	background-color: #4267B2;
}

.submit-btn:hover,
.match-vibe-btn:hover {
	background-color: #365899;
	transform: translateY(-2px);
}

.weather-info,
.matched-prompt {
	padding: 1.5rem;
	margin-top: 1rem;
	border-radius: 10px;
	color: #1C1E21;
	background-color: #FFFFFF;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.weather-info p,
.matched-prompt p {
	margin: 1rem 0;
	font-size: 1.1rem;
	line-height: 1.7;
}

.logout-btn {
	padding: 0.75rem 1rem;
	margin-top: 1rem;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 1rem;
	color: white;
	background-color: #D9534F;
	transition: background-color 0.3s, transform 0.2s;
}

.logout-btn:hover {
	background-color: #C9302C;
	transform: translateY(-2px);
}


.toggle-btn {
	padding: 0.5rem 1rem;
	border: 2px solid #4267B2;
	border-radius: 6px;
	background-color: #FFFFFF;
	cursor: pointer;
	font-size: 1rem;
	color: #4267B2;
	transition: background-color 0.3s, color 0.3s;
}

.toggle-btn:hover {
	background-color: #4267B2;
	color: #FFFFFF;
}

.small-btn {
	padding: 0.3rem 0.6rem;
	margin-left: 1rem;
	font-size: 0.9rem;
	vertical-align: middle;
}
</style>