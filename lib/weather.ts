export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels: number;
  desc: string;
  is_day: boolean;
}

export async function getWeather(location: string, lang: "en" | "ja"): Promise<WeatherData> {
  const API_KEY = process.env.WEATHERAPI_KEY;
  if (!API_KEY) throw new Error("Missing WEATHERAPI_KEY");

  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
    location
  )}&lang=${lang}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error("WeatherAPI error: " + err);
  }

  const data = await res.json();

  return {
    city: data.location?.name ?? location,
    country: data.location?.country ?? "",
    temp: data.current?.temp_c ?? 0,
    feels: data.current?.feelslike_c ?? 0,
    desc: data.current?.condition?.text ?? "",
    is_day: data.current?.is_day === 1,
  };
}
