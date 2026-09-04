import type { LucideIcon } from 'lucide-react'

export type WeatherIcon = LucideIcon

export type Location = {
  id: string
  name: string
  region: string
  country?: string
  latitude: number
  longitude: number
}

export type Hour = {
  time: string
  temperature: number
  code: number
  rain: number
  wind: number
  isDay: boolean
}

export type Day = {
  date: string
  code: number
  high: number
  low: number
  rain: number
  sunrise: string
  sunset: string
}

export type Weather = Location & {
  temperature: number
  feelsLike: number
  code: number
  humidity: number
  precipitation: number
  wind: number
  windDirection: number
  visibility: number
  pressure: number
  uvIndex: number
  timezone: string
  hours: Hour[]
  days: Day[]
}

export type Condition = {
  label: string
  shortLabel: string
  icon: WeatherIcon
  tone: 'clear' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog'
}
