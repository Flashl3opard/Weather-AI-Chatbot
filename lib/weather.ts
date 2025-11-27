
export interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  mainWeather: string;
  condition: string;
  visibility: number;
  clouds: number;
  sunrise: string;
  sunset: string;
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error("Missing OPENWEATHER_API_KEY");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error("Failed to fetch weather");
  }

  return {
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    wind_deg: data.wind.deg,
    mainWeather: data.weather?.[0]?.main ?? "Unknown",
    condition: data.weather?.[0]?.description ?? "Unknown",
    visibility: data.visibility ?? 0,
    clouds: data.clouds?.all ?? 0,
    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
  };
}
