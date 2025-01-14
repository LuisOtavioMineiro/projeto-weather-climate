const apiKey = '571926bfc6ffe7cf4955d87a47c3a8ec'; // Substitua pela sua chave da OpenWeatherMap
const baseUrl = 'https://api.openweathermap.org/geo/1.0/direct';

const inputWeather = document.getElementById('weather-location');

// Função para buscar sugestões de cidades
async function getCitySuggestions(cityName, limit = 3) {
  const url = `${baseUrl}?q=${encodeURIComponent(cityName)}&limit=${limit}&appid=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    const data = await response.json();
    return data;
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
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(data)
    // A previsão semanal está no array 'daily'
    // const weeklyForecast = data.daily;

    // // Exibindo os dados da semana
    // weeklyForecast.forEach(day => {
    //   const date = new Date(day.dt * 1000); // Convertendo timestamp para data
    //   const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    //   const temperature = day.temp.day;
    //   const weatherDescription = day.weather[0].description;
      
    //   console.log(`${dayOfWeek}: ${temperature}°C, ${weatherDescription}`);
    // });
  } catch (error) {
    console.error("Erro ao obter os dados da previsão:", error);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').innerHTML = getFormattedDate();
  document.getElementById('day').innerHTML = getCurrentDay();
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

function getCurrentDay() {
  const daysOfWeek = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
  ];

  const currentDayIndex = new Date().getDay(); // Índice do dia (0-6)
  return daysOfWeek[currentDayIndex];
}

// document.getElementById('weather-location').addEventListener('input', async (event) => {
//   const cityName = event.target.value;
//   console.log(cityName)

//   if (cityName.length > 0) {
//     const suggestions = await getCitySuggestions(cityName);
//     displayResults(suggestions); 
//     console.log('Sugestões de cidades:', suggestions);
//   } else {
//     displayResults([]); 
//   }
// });

document.getElementById('search-button').addEventListener('click', async () => {
  
  const cityName = inputWeather.value;
  console.log(cityName)

  if (cityName.length > 0) {
    const suggestions = await getCitySuggestions(cityName);
    displayResults(suggestions); 
    console.log('Sugestões de cidades:', suggestions);
  } else {
    displayResults([]); 
  }
})

function displayResults(results) {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = ''; // Limpa os resultados anteriores

  results.forEach(result => {
    const listItem = document.createElement('li');
    listItem.textContent = `${result.name}, ${result.state}, ${result.country}`;

    listItem.addEventListener('click', async () => {
      const weather = await getWeatherLocation(result.lat, result.lon);
      const weatherAll = await getWeeklyWeather(result.lat, result.lon);
      console.log(weatherAll)
      if (weather) {
        document.getElementById('weather-temp').innerHTML = `${Math.ceil(weather.main.temp)} °C`;
        document.getElementById('city').innerHTML = `${weather.name}, ${weather.sys.country}`;
        document.getElementById('velocity').innerHTML = `${Math.ceil(weather.wind.speed)} km/h`;
        document.getElementById('humidity').innerHTML = `${weather.main.humidity} %`;
        document.getElementById('rain').innerHTML = `${weather.clouds.all} %`;
        document.getElementById('weather-type').innerHTML = `${weather.weather[0].description}`;
        displayResults([]);
      }
      console.log(weather);
      // Aqui você pode adicionar mais lógica, como atualizar outro elemento do DOM
    });

    resultsList.appendChild(listItem);
  });
}
