import { CloudDrizzle, CloudFog, CloudRain, CloudSun, Moon, Snowflake, Sun, Zap } from 'lucide-react'
import type { Condition, Weather } from '../types/weather'

export const getCondition = (code: number, isDay = true): Condition => {
  if (code === 0) return { label: isDay ? 'Clear sky' : 'Clear night', shortLabel: 'Clear', icon: isDay ? Sun : Moon, tone: 'clear' }
  if ([1, 2].includes(code)) return { label: code === 1 ? 'Mainly clear' : 'Partly cloudy', shortLabel: code === 1 ? 'Clear' : 'Partly cloudy', icon: isDay ? CloudSun : Moon, tone: 'clear' }
  if (code === 3) return { label: 'Overcast', shortLabel: 'Cloudy', icon: CloudDrizzle, tone: 'cloud' }
  if ([45, 48].includes(code)) return { label: 'Foggy', shortLabel: 'Fog', icon: CloudFog, tone: 'fog' }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', shortLabel: 'Drizzle', icon: CloudDrizzle, tone: 'rain' }
  if ([61, 63, 80, 81].includes(code)) return { label: 'Rain', shortLabel: 'Rain', icon: CloudRain, tone: 'rain' }
  if ([65, 66, 67, 82].includes(code)) return { label: 'Heavy rain', shortLabel: 'Heavy rain', icon: CloudRain, tone: 'rain' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', shortLabel: 'Snow', icon: Snowflake, tone: 'snow' }
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', shortLabel: 'Storm', icon: Zap, tone: 'storm' }
  return { label: 'Mixed conditions', shortLabel: 'Mixed', icon: CloudSun, tone: 'cloud' }
}

export const celsiusToFahrenheit = (value: number) => value * 9 / 5 + 32
export const kmhToMph = (value: number) => value * 0.621371
export const kmhToMs = (value: number) => value / 3.6
export const formatTemperature = (value: number, unit: 'C' | 'F') => `${Math.round(unit === 'C' ? value : celsiusToFahrenheit(value))}°`
export const formatWind = (value: number, unit: 'km/h' | 'mph' | 'm/s') => `${Math.round(unit === 'km/h' ? value : unit === 'mph' ? kmhToMph(value) : kmhToMs(value))} ${unit}`
export const formatClock = (value: string, timezone?: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(new Date(value))
export const formatDay = (value: string, timezone?: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone }).format(new Date(`${value}T12:00:00`))

export const getInsight = (weather: Weather): string => {
  const today = weather.days[0]
  const condition = getCondition(weather.code).tone
  if (condition === 'storm') return 'Thunderstorms are possible. Stay indoors when storms are nearby and avoid exposed areas.'
  if (condition === 'snow') return 'Snow is expected today. Dress warmly and allow extra time for travel.'
  if (condition === 'fog') return 'Low visibility is possible. Take extra care when travelling, especially this morning.'
  if (today?.rain >= 60) return 'Rain is likely today. Consider carrying an umbrella and allow extra time for travel.'
  if (weather.uvIndex >= 6) return 'UV levels may be high around midday. Water and sun protection are a good idea.'
  if (weather.wind >= 30) return 'Strong winds are expected. Secure loose items and take care around exposed paths.'
  if (condition === 'clear') return 'Clear skies are expected. It is a good day to spend time outdoors.'
  return 'Clouds will come and go today, with comfortable conditions for errands and time outdoors.'
}
