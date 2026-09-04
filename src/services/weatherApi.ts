import type { Day, Hour, Location, Weather } from '../types/weather'

type ApiResponse = {
  timezone: string
  current: { time: string; temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; precipitation: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number; visibility: number; surface_pressure: number }
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[]; wind_speed_10m: number[]; is_day: number[] }
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; sunrise: string[]; sunset: string[]; uv_index_max: number[] }
}

export const locationId = (location: Pick<Location, 'name' | 'latitude' | 'longitude'>) => `${location.name}-${location.latitude}-${location.longitude}`

export const fetchWeather = async (location: Location, signal?: AbortSignal): Promise<Weather> => {
  const params = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility,surface_pressure', hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m,is_day', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max', timezone: 'auto', forecast_days: '7' })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
  if (!response.ok) throw new Error('Weather service unavailable')
  const data = await response.json() as ApiResponse
  const currentIndex = Math.max(0, data.hourly.time.findIndex((time) => time >= data.current.time))
  const hours: Hour[] = data.hourly.time.slice(currentIndex, currentIndex + 12).map((time, index) => {
    const sourceIndex = currentIndex + index
    return { time, temperature: data.hourly.temperature_2m[sourceIndex], code: data.hourly.weather_code[sourceIndex], rain: data.hourly.precipitation_probability[sourceIndex] ?? 0, wind: data.hourly.wind_speed_10m[sourceIndex], isDay: data.hourly.is_day[sourceIndex] === 1 }
  })
  const days: Day[] = data.daily.time.map((date, index) => ({ date, code: data.daily.weather_code[index], high: data.daily.temperature_2m_max[index], low: data.daily.temperature_2m_min[index], rain: data.daily.precipitation_probability_max[index] ?? 0, sunrise: data.daily.sunrise[index], sunset: data.daily.sunset[index] }))
  return { ...location, id: location.id || locationId(location), timezone: data.timezone, temperature: data.current.temperature_2m, feelsLike: data.current.apparent_temperature, code: data.current.weather_code, humidity: data.current.relative_humidity_2m, precipitation: data.current.precipitation, wind: data.current.wind_speed_10m, windDirection: data.current.wind_direction_10m, visibility: data.current.visibility, pressure: data.current.surface_pressure, uvIndex: data.daily.uv_index_max[0] ?? 0, hours, days }
}

export const searchLocations = async (query: string, signal?: AbortSignal): Promise<Location[]> => {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`, { signal })
  if (!response.ok) throw new Error('Location search unavailable')
  const data = await response.json() as { results?: Array<{ name: string; latitude: number; longitude: number; country?: string; admin1?: string }> }
  return (data.results ?? []).map((item) => ({ id: locationId(item), name: item.name, region: item.admin1 || item.country || 'Worldwide', country: item.country, latitude: item.latitude, longitude: item.longitude }))
}
