const apiKey = '571926bfc6ffe7cf4955d87a47c3a8ec'; // Substitua pela sua chave da OpenWeatherMap
const baseUrl = 'https://api.openweathermap.org/geo/1.0/direct';
const inputWeather = document.getElementById('weather-location');
let cityChoice = {};

const typeWeather = {
  "Thunderstorm": "bx-cloud-drizzle",
  "Drizzle": "bx-cloud-drizzle",
  "Rain": "bx-cloud-rain",
  "Snow": "bx-cloud",
  "Clear": "bxs-sun",
  "Clouds": "bx-cloud",
  "Standard": "bxs-sun"
}

// Função para buscar sugestões de cidades
async function getCitySuggestions(cityName, limit = 3) {
  const url = `${baseUrl}?q=${encodeURIComponent(cityName)}&limit=${limit}&appid=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    const data = await response.json();
    const dataFiltered = data.filter((obj, index, self) => 
      index === self.findIndex((t) => t.name === obj.name) // Compara os objetos por id para ver se é duplicado
    )
    return dataFiltered;
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [{ name: 'Não Encontrado' }];
  }
}

async function getWeatherLocation(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
}

async function getWeeklyWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  
  try {
    const response = await fetch(url);
    const data = await response.json(); 
    console.log(data)
    const dataFiltered = data.list.filter((obj, index, self) => 
      index === self.findIndex((t) => t.dt_txt.substring(0, 10) === obj.dt_txt.substring(0, 10) && t.dt_txt.includes("15:00:00"))
    )
    return dataFiltered.slice(1, 5);
  } catch (error) {
    console.error("Erro ao obter os dados da previsão:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').innerHTML = getFormattedDate();
  document.getElementById('day').innerHTML = getCurrentDay(0);

  for (let i = 0; i < 4; i++) {
    document.getElementById(`day-${i+1}`).innerHTML = getCurrentDay(i + 1, true);
  }

});

function getFormattedDate() {
  const today = new Date();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const day = String(today.getDate()).padStart(2, '0'); // Dia com 2 dígitos
  const month = months[today.getMonth() + 1] // Mês com 2 dígitos (0-11, por isso +1)
  const year = today.getFullYear(); // Ano com 4 dígitos

  return `${day} ${month} de ${year}`;
}

function getCurrentDay(ind, small = false) {
  const daysOfWeek = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
  ];

  const daysOfWeekSmall = [
    "Domingo", "Segunda", "Terça", "Quarta",
    "Quinta", "Sexta", "Sábado"
  ];

  const currentDayIndex = new Date().getDay() + ind; // Índice do dia (0-6)
  const currentDayMax = currentDayIndex > 6 ? (currentDayIndex - 7) : currentDayIndex
  const daysReturn = small ? daysOfWeekSmall : daysOfWeek

  return daysReturn[currentDayMax];
}

document.getElementById('weather-location').addEventListener('input', async (event) => {
  const cityName = event.target.value;

  if (cityName.length > 0) {
    const suggestions = await getCitySuggestions(cityName);
    cityChoice = suggestions;
    displayResults(suggestions);  
    console.log('Sugestões de cidades:', suggestions);
  } else {
    displayResults([]); 
  }
});

document.getElementById('search-button').addEventListener('click', async () => {
  
  const weather = await getWeatherLocation(cityChoice.lat, cityChoice.lon);
  const weatherAll = await getWeeklyWeather(cityChoice.lat, cityChoice.lon);
  console.log(weather)

  if (weather) {
    document.getElementById('weather-temp').innerHTML = `${Math.ceil(weather.main.temp)} °C`;
    document.getElementById('city').innerHTML = `${weather.name}, ${weather.sys.country}`;
    document.getElementById('velocity').innerHTML = `${Math.ceil(weather.wind.speed)} km/h`;
    document.getElementById('humidity').innerHTML = `${weather.main.humidity} %`;
    document.getElementById('rain').innerHTML = `${weather.clouds.all} %`;
    document.getElementById('weather-type').innerHTML = `${weather.weather[0].description}`;
    document.getElementById('weather-0').className = `bx ${typeWeather[weather.weather[0].main]}`;
    displayResults([]);
  }

  if(weatherAll) {

    weatherAll.map((data, ind) => {
      document.getElementById(`temp-${ind+1}`).innerHTML = `${Math.ceil(data.main.temp)} °C`;
      document.getElementById(`weather-${ind+1}`).className = `bx ${typeWeather[data.weather[0].main]}`;
    })
  }
})

function displayResults(results) {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = ''; // Limpa os resultados anteriores

  results.forEach(result => {
    const listItem = document.createElement('li');
    listItem.textContent = `${result.name}, ${result.state}, ${result.country}`;

    listItem.addEventListener('click', async () => {
      cityChoice = result;
      inputWeather.value = `${result.name}, ${result.state}, ${result.country}`
      displayResults([]);
      // Aqui você pode adicionar mais lógica, como atualizar outro elemento do DOM
    });

    resultsList.appendChild(listItem);
  });
}
