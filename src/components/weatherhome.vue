<!-- Use the current location of the user from mongodb and make a callout to the Weather API -->
<!--Render the response in this component and use this component in the App.vue-->

// Declaring the variables
let lon;
let lat;
let temperature = document.querySelector(".temp");
let summary = document.querySelector(".summary");
let loc = document.querySelector(".location");
let icon = document.querySelector(".icon");
const kelvin = 273;

window.addEventListener("load", () => {
if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition((position) => {
	console.log(position);
	lon = position.coords.longitude;
	lat = position.coords.latitude;

	// API ID
	const api = "65448fd6dae44d71810232128240503;

	// API URL
	const base =
JSON: http://api.weatherapi.com/v1/forecast.json?key=65448fd6dae44d71810232128240503&q=27612&days=7

	// Calling the API
	
    fetch(base)
		.then((response) => {
		return response.json();
		})
		.then((data) => {
		console.log(data);
		temperature.textContent = 
			Math.floor(data.main.temp - kelvin) + "°C";
		summary.textContent = data.weather[0].description;
		loc.textContent = data.name + "," + data.sys.country;
		let icon1 = data.weather[0].icon;
		icon.innerHTML = 
			`<img src="icons/${icon1}.svg" style= 'height:10rem'/>`;
		});
	});
}
});