let key = 'b4c5704e16f64f039dc130347230711';
let spinner = document.querySelector(".loader-container");
let temperature = document.getElementById("main-temp");
let hourlyForecastsContainer = document.getElementById("hours");
let daysForecastsContainer = document.getElementById("days");
let conditionText = document.getElementById("condition");
let backgroundVideo = document.getElementById("bgVideo");  
let city = document.getElementById("city");
let locationInput = document.getElementById("input-container");
let locationButton = document.getElementById("location-button");
let closeButton = document.getElementById("close-input");
let searchbar = document.getElementById("location-input");

let weathercodes = {
    'sunny': [1000],
    'cloudy': [1003, 1006],
    'rainy': [1063,1180,1183,1189,1192,1195,1198,1201,1240,1243,1246],
    'sleet': [1069,1204,1207,1249,1252],
    'fog': [1030,1135,1147],
    'overcast': [1009],
    'drizzle': [1072,1150,1153,1168,1171],
    'snow': [1066,1114,1117,1210,1213,1216,1219,1222,1225,1237,1255,1258,1261,1264,1279,1282],
    'thunderstorms' : [1087,1273,1276]
} 

function hideSpinner() {

    spinner.style.display = "none";

}

function showSpinner() {

    spinner.style.display = "grid";

}

function convertTime(hours, minutes) {

    let text = "AM";
    // checking the meridiem
    if (hours == 0 || hours < 12) {
        text  = "AM"
    }
    else {
        text = "PM"
    }
    // converts 24 hrs time to display in 12hrs format
    if (hours == 0) {
        hours = 12
    }
    else if (hours > 12) {
        hours -= 12
    }
    
    // adds zero before digits
    if (hours < 10)
    {
        hours = addZero(hours);    
    }
    
    if (minutes != undefined) {
        
        if (minutes < 10) {
        
            minutes = addZero(minutes);
        }

        return {
            hour: hours,
            minute: minutes,
            meridiem : text
        }
    }

    return {
        hour: hours,
        meridiem : text
    }

}

function addZero(text) {

    text = "0" + text;
    return text;
}

function getTodaysDate() {
    let currentDate = new Date()
    let date = currentDate.getDate();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    if (date < 10) {
        date = addZero(date);
    }
    if (month < 10) {
        month = addZero(month)
    }

    return `${year}-${month + 1}-${date}`
    
}


function updateTemp(temp) {
    temperature.innerText = temp;
}

//updates hourly forecasts
function updateHourly(hourData) {
    
    hourlyForecastsContainer.innerHTML = "";
    for (let hour of hourData) {
        
        let timeHour = new Date(hour.time).getHours();
        let formattedTime = convertTime(timeHour);
        let div = document.createElement('div');
        div.classList.add("forecast")
        div.innerHTML = `
            <p class="forecast-head">${formattedTime.hour} ${formattedTime.meridiem}</p>
            <p class="temp sm-temp">${hour.temp_c}</p>
        `
        hourlyForecastsContainer.appendChild(div);
    }

}

// adds daily forecast to DOM
function updateDays(dayForecasts) {
    daysForecastsContainer.innerHTML = "";
    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let dayForecast of dayForecasts) {
        let daysAvgTemp = dayForecast.day.avgtemp_c;
        let day = new Date(dayForecast.date).getDay();
        let todaysDay = new Date().getDay();
        if (day == todaysDay) {
            day = "Today"
        }
        else {
            day = days[day]
        }
        let div = document.createElement('div');
        div.classList.add("forecast")
        div.innerHTML = `
            <p class="forecast-head">${day}</p>
            <p class="temp sm-temp">${daysAvgTemp}</p>
        `
        daysForecastsContainer.appendChild(div);
    }

}

function hideElement(element) {
    element.style.display = "none";
}

function showElement(element) {
    element.style.display = "block";
}

// gets the name of the video
function checkName(code) {

    for (let i in weathercodes) {
        if (weathercodes[i].includes(code)) {
            return i;
        }
    }

}
//update background
function updateBackground(code, text) {
    conditionText.innerText = text;
    let weather = checkName(code)
    backgroundVideo.setAttribute(`src`, `./assets/${weather}.mp4`);
}

//updates location

function updateLocation(area) {
    city.innerText = area;
}

// fetch data from api
async function fetchForecast(location) {
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${location}&days=7&aqi=yes&alerts=no`
    let forecast = await fetch(url).then(res => res.json());
    return forecast;
}

async function updateDOM(location) {
    let forecastWeather = await fetchForecast(location);
    console.log(forecastWeather)
    if ('error' in forecastWeather) {  
        hideSpinner();
        window.alert("Please enter valid location");
        return;
    }
    else {
        let currentTemp = forecastWeather.current.temp_c;
        let hourlyForecasts = forecastWeather.forecast.forecastday;
        let todaysDate = getTodaysDate();
        let todaysHourlyForecasts = hourlyForecasts.find((forecast) => forecast.date == todaysDate);
        let forecastCode = forecastWeather.current.condition.code;
        let forecastText = forecastWeather.current.condition.text;
        await updateTemp(currentTemp);
        await updateBackground(forecastCode, forecastText);
        await updateLocation(forecastWeather.location.name);
        await hideElement(locationInput);
        await showElement(locationButton);
        await updateHourly(todaysHourlyForecasts.hour);
        await updateDays(forecastWeather.forecast.forecastday);
        // hideSpinner();
    }
}


locationButton.addEventListener('click', () => {

    hideElement(locationButton);
    showElement(locationInput);

});

closeButton.addEventListener('click', () => {
    searchbar.value = "";
    hideElement(locationInput);
    showElement(locationButton);
});

backgroundVideo.addEventListener('play', () => {
    hideSpinner();
});


searchbar.addEventListener('keydown', (e) => {

    if (e.code == "Enter") {
        
        showSpinner();
        let searchQuery = searchbar.value;
        searchbar.value = "";
        updateDOM(searchQuery);

    }

})

updateDOM("karimnagar");
