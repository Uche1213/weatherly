import { useEffect, useState } from 'react'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  LocateFixed,
  Menu,
  Search,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind,
  X,
} from 'lucide-react'

type Icon = typeof CloudSun
type Day = { day: string; date: string; icon: Icon; condition: string; high: number; low: number; rain: number }
type City = { name: string; region: string; latitude: number; longitude: number; temp: number; condition: string; icon: Icon; feels: number; high: number; low: number; humidity: number; wind: string; visibility: string; pressure: string; sunrise: string; sunset: string; days: Day[] }
type Outlook = { title: string; copy: string }

const days = (items: Array<[string, string, Icon, string, number, number, number]>): Day[] =>
  items.map(([day, date, icon, condition, high, low, rain]) => ({ day, date, icon, condition, high, low, rain }))

const cities: City[] = [
  { name: 'San Francisco', region: 'California, United States', latitude: 37.7749, longitude: -122.4194, temp: 18, condition: 'Partly cloudy', icon: CloudSun, feels: 18, high: 20, low: 13, humidity: 72, wind: 'SW 14 km/h', visibility: '16 km', pressure: '1018 hPa', sunrise: '6:42 AM', sunset: '7:38 PM', days: days([['Today', 'Aug 24', CloudSun, 'Partly cloudy', 20, 13, 12], ['Mon', 'Aug 25', CloudSun, 'Mostly sunny', 21, 14, 4], ['Tue', 'Aug 26', CloudSun, 'Mostly sunny', 22, 14, 3], ['Wed', 'Aug 27', CloudRain, 'Light rain', 18, 13, 58], ['Thu', 'Aug 28', CloudSun, 'Clearing up', 20, 12, 18], ['Fri', 'Aug 29', CloudSun, 'Sunny', 23, 13, 2], ['Sat', 'Aug 30', CloudSun, 'Sunny', 24, 14, 1]]) },
  { name: 'London', region: 'England, United Kingdom', latitude: 51.5072, longitude: -0.1276, temp: 16, condition: 'Light rain', icon: CloudRain, feels: 15, high: 18, low: 12, humidity: 80, wind: 'W 12 km/h', visibility: '10 km', pressure: '1012 hPa', sunrise: '5:58 AM', sunset: '8:09 PM', days: days([['Today', 'Aug 24', CloudRain, 'Light rain', 18, 12, 70], ['Mon', 'Aug 25', CloudSun, 'Cloudy', 19, 13, 42], ['Tue', 'Aug 26', CloudSun, 'Partly cloudy', 21, 14, 20], ['Wed', 'Aug 27', CloudRain, 'Showers', 17, 12, 65], ['Thu', 'Aug 28', CloudSun, 'Sunny spells', 20, 11, 18], ['Fri', 'Aug 29', CloudSun, 'Mostly sunny', 22, 13, 12], ['Sat', 'Aug 30', CloudSun, 'Sunny', 23, 14, 9]]) },
  { name: 'Tokyo', region: 'Kanto, Japan', latitude: 35.6762, longitude: 139.6503, temp: 27, condition: 'Mostly sunny', icon: CloudSun, feels: 29, high: 29, low: 22, humidity: 64, wind: 'S 9 km/h', visibility: '13 km', pressure: '1009 hPa', sunrise: '5:08 AM', sunset: '6:19 PM', days: days([['Today', 'Aug 24', CloudSun, 'Mostly sunny', 29, 22, 8], ['Mon', 'Aug 25', CloudSun, 'Sunny', 30, 23, 5], ['Tue', 'Aug 26', CloudRain, 'Scattered rain', 28, 22, 38], ['Wed', 'Aug 27', CloudRain, 'Heavy showers', 26, 21, 72], ['Thu', 'Aug 28', CloudSun, 'Clearing up', 28, 21, 22], ['Fri', 'Aug 29', CloudSun, 'Sunny', 30, 22, 5], ['Sat', 'Aug 30', CloudSun, 'Sunny', 31, 23, 4]]) },
]

const metricCards = [
  { label: 'Feels like', key: 'feels' as const, icon: Thermometer, suffix: '°' },
  { label: 'Humidity', key: 'humidity' as const, icon: Droplets, suffix: '%' },
  { label: 'Wind', key: 'wind' as const, icon: Wind, suffix: '' },
  { label: 'Visibility', key: 'visibility' as const, icon: LocateFixed, suffix: '' },
]

const weatherCode = (code: number): { condition: string; icon: Icon } => {
  if (code === 0) return { condition: 'Clear sky', icon: CloudSun }
  if ([1, 2].includes(code)) return { condition: code === 1 ? 'Mainly clear' : 'Partly cloudy', icon: CloudSun }
  if (code === 3) return { condition: 'Overcast', icon: CloudDrizzle }
  if ([45, 48].includes(code)) return { condition: 'Foggy', icon: CloudDrizzle }
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', icon: CloudDrizzle }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: 'Rain', icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snow', icon: CloudDrizzle }
  if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorms', icon: CloudRain }
  return { condition: 'Mixed conditions', icon: CloudSun }
}

const getOutlook = (city: City): Outlook => {
  const condition = city.condition.toLowerCase()
  const rain = city.days[0]?.rain ?? 0
  const windSpeed = Number.parseInt(city.wind, 10) || 0

  if (condition.includes('thunder')) {
    return { title: 'Stormy conditions expected', copy: 'Thunderstorms are possible today. Stay indoors when storms are nearby and avoid exposed areas.' }
  }
  if (condition.includes('snow')) {
    return { title: 'A wintry day ahead', copy: 'Snow is expected today. Allow extra time for travel, dress warmly, and watch for slippery surfaces.' }
  }
  if (condition.includes('fog')) {
    return { title: 'Low visibility this morning', copy: 'Fog may reduce visibility today. Take care on the road and allow conditions to improve before travelling.' }
  }
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower') || rain >= 60) {
    return { title: 'Keep an umbrella nearby', copy: 'Wet weather is likely today. Plan for showers, choose waterproof layers, and leave extra time for travel.' }
  }
  if (windSpeed >= 30) {
    return { title: 'A blustery day ahead', copy: 'Strong winds are expected today. Secure loose items and take care around trees and exposed paths.' }
  }
  if (condition.includes('overcast') || condition.includes('cloud')) {
    return { title: 'A calm, cloudy day', copy: 'Clouds will shape much of the day with comfortable conditions for errands, walks, and time outdoors.' }
  }
  if (condition.includes('clear') || condition.includes('sunny')) {
    return { title: 'Bright conditions ahead', copy: 'Clear skies make this a good day to be outside. Bring water, use sun protection, and enjoy the brighter weather.' }
  }
  return { title: 'Changeable conditions today', copy: 'Conditions may shift through the day. Keep a light layer handy and check the forecast before heading out.' }
}

const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const formatTime = (value: string) => new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

type ForecastResponse = {
  current: { temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number; visibility: number; surface_pressure: number }
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; sunrise: string[]; sunset: string[] }
}

type GeocodeResult = { name: string; latitude: number; longitude: number; country?: string; admin1?: string }

const fetchWeather = async (location: City): Promise<City> => {
  const params = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,surface_pressure', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset', timezone: 'auto', forecast_days: '7' })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error('Weather service unavailable')
  const data = await response.json() as ForecastResponse
  const current = weatherCode(data.current.weather_code)
  return { ...location, temp: Math.round(data.current.temperature_2m), condition: current.condition, icon: current.icon, feels: Math.round(data.current.apparent_temperature), high: Math.round(data.daily.temperature_2m_max[0]), low: Math.round(data.daily.temperature_2m_min[0]), humidity: Math.round(data.current.relative_humidity_2m), wind: `${Math.round(data.current.wind_speed_10m)} km/h`, visibility: `${(data.current.visibility / 1000).toFixed(1)} km`, pressure: `${Math.round(data.current.surface_pressure)} hPa`, sunrise: formatTime(data.daily.sunrise[0]), sunset: formatTime(data.daily.sunset[0]), days: data.daily.time.map((date, index) => ({ day: index === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }), date: formatDate(date), ...weatherCode(data.daily.weather_code[index]), high: Math.round(data.daily.temperature_2m_max[index]), low: Math.round(data.daily.temperature_2m_min[index]), rain: data.daily.precipitation_probability_max[index] ?? 0 })) }
}

const findLocation = async (name: string): Promise<City> => {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`)
  if (!response.ok) throw new Error('Location search unavailable')
  const data = await response.json() as { results?: GeocodeResult[] }
  const result = data.results?.[0]
  if (!result) throw new Error('Location not found')
  return makeLocation(result)
}

const makeLocation = (result: GeocodeResult): City => ({ name: result.name, region: [result.admin1, result.country].filter(Boolean).join(', '), latitude: result.latitude, longitude: result.longitude, temp: 0, condition: 'Loading...', icon: CloudSun, feels: 0, high: 0, low: 0, humidity: 0, wind: '0 km/h', visibility: '0 km', pressure: '0 hPa', sunrise: '--', sunset: '--', days: [] })

function App() {
  const [city, setCity] = useState(cities[0])
  const [locations, setLocations] = useState(cities)
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [showDetails, setShowDetails] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [globalResults, setGlobalResults] = useState<GeocodeResult[]>([])
  const results = locations.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  const outlook = getOutlook(city)

  useEffect(() => {
    fetchWeather(cities[0]).then((freshCity) => {
      setCity(freshCity)
      setLocations((saved) => saved.map((item) => item.name === freshCity.name ? freshCity : item))
      setError('')
    }).catch(() => setError('Live weather could not be loaded. Check your connection.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setGlobalResults([])
      return
    }
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`, { signal: controller.signal })
        .then((response) => response.json() as Promise<{ results?: GeocodeResult[] }>)
        .then((data) => setGlobalResults(data.results ?? []))
        .catch(() => { if (!controller.signal.aborted) setGlobalResults([]) })
    }, 250)
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowSearch(true)
        document.querySelector<HTMLInputElement>('.search-wrap input')?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const chooseCity = async (nextCity: City) => {
    setLoading(true)
    setError('')
    setQuery('')
    try {
      const freshCity = await fetchWeather(nextCity)
      setCity(freshCity)
      setLocations((saved) => saved.map((item) => item.name === freshCity.name ? freshCity : item))
      setNotice(`${freshCity.name} weather updated`)
    } catch {
      setError('Live weather could not be loaded. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const chooseGlobalLocation = (result: GeocodeResult) => chooseCity(makeLocation(result))

  const addLocation = async () => {
    const name = window.prompt('Enter a city to search:')?.trim()
    if (!name) return
    setLoading(true)
    setError('')
    try {
      const location = await findLocation(name)
      const freshCity = await fetchWeather(location)
      setLocations((saved) => saved.some((item) => item.name === freshCity.name) ? saved : [...saved, freshCity])
      setCity(freshCity)
      setNotice(`${freshCity.name} added`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Location could not be loaded')
    } finally {
      setLoading(false)
    }
  }

  const handleNav = (label: string) => {
    setActiveNav(label)
    if (label === 'Locations') document.querySelector('.location-tabs')?.scrollIntoView({ behavior: 'smooth' })
    if (label === 'Map') setNotice('Map view is coming soon')
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><CloudSun size={22} /></span><span>weatherly</span></div>
       <nav>{['Overview', 'Locations', 'Map'].map((label) => <button key={label} className={activeNav === label ? 'nav-active' : ''} onClick={() => handleNav(label)}>{label}</button>)}</nav>
       <div className="header-actions"><button className="icon-button" onClick={() => setNotice('You are all caught up')} aria-label="Notifications"><Bell size={19} /></button><div className="avatar">IU</div><span className="profile-name">Ijere Uchenna</span><ChevronDown size={15} /></div>
      <button className="menu-button" onClick={() => setShowSearch(!showSearch)} aria-label="Toggle search"><Menu size={22} /></button>
    </header>
    <main>
      <section className="intro-row">
        <div><p className="eyebrow">Live worldwide forecast</p><h1>Good morning, Ijere Uchenna <span>✦</span></h1><p className="subtitle">Search any city to see its current weather and forecast.</p></div>
         <div className="search-wrap"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any city or country..." /><kbd>⌘ K</kbd>{query && <button onClick={() => setQuery('')} className="clear" aria-label="Clear search"><X size={15} /></button>}{query && <div className="search-results">{globalResults.length > 0 ? globalResults.map((item) => <button key={`${item.name}-${item.latitude}`} onClick={() => chooseGlobalLocation(item)}><CloudSun size={18} /><span><b>{item.name}</b><small>{[item.admin1, item.country].filter(Boolean).join(', ')}</small></span><strong>→</strong></button>) : results.length > 0 ? results.map((item) => <button key={item.name} onClick={() => chooseCity(item)}><item.icon size={18} /><span><b>{item.name}</b><small>{item.region}</small></span><strong>{item.temp}°</strong></button>) : <p className="no-results">Searching worldwide locations...</p>}</div>}</div>
      </section>
       <div className="location-tabs">{locations.map((item) => <button className={city.name === item.name ? 'selected' : ''} key={item.name} onClick={() => chooseCity(item)}><item.icon size={17} />{item.name}</button>)}<button className="add-location" onClick={addLocation}>+ Add location</button></div>
       {error && <div className="error-banner" role="alert">{error}</div>}
      <section className="hero-grid">
          <div className="current-card"><div className="card-top"><div><p className="eyebrow">CURRENT WEATHER</p><h2>{city.name}</h2><p className="muted">{city.region}</p></div><button className="more" onClick={() => chooseCity(city)} aria-label="Refresh forecast">•••</button></div><div className="current-reading"><city.icon className="hero-icon" size={92} strokeWidth={1.4} /><div><div className="temperature">{loading ? '...' : city.temp}<sup>°C</sup></div><div className="condition">{loading ? 'Fetching live conditions...' : city.condition}</div><div className="range">H:{city.high}° &nbsp; L:{city.low}°</div></div></div><div className="updated"><span className="pulse" /> {loading ? 'Updating weather...' : 'Live data from Open-Meteo'} <span>•</span> Feels like {city.feels}°</div></div>
         <div className="outlook-card"><div className="card-top"><div><p className="eyebrow">TODAY'S OUTLOOK</p><h3>{outlook.title}</h3></div><CalendarDays size={20} className="soft-icon" /></div><p className="outlook-copy">{outlook.copy}</p><div className="outlook-line"><span><Umbrella size={17} /> Chance of rain</span><strong>{city.days[0]?.rain ?? 0}%</strong><div className="progress"><i style={{ width: `${city.days[0]?.rain ?? 0}%` }} /></div></div><div className="outlook-line"><span><Wind size={17} /> Wind conditions</span><strong>{city.wind}</strong></div></div>
      </section>
       <section className="section-heading"><div><p className="eyebrow">NEXT 7 DAYS</p><h2>Weekly forecast</h2></div><button className="link-button" onClick={() => setShowDetails(!showDetails)}>{showDetails ? 'Hide details' : 'View details'} <span>→</span></button></section>
       <section className="forecast-grid">{city.days.map((day) => <article className={`forecast-card ${day.day === 'Today' ? 'today' : ''}`} key={day.day}><div className="day-label">{day.day}</div><div className="date-label">{day.date}</div><day.icon size={32} strokeWidth={1.5} className="forecast-icon" /><div className="day-condition">{day.condition}</div><div className="day-temps"><b>{day.high}°</b><span>{day.low}°</span></div><div className="rain-chance"><Droplets size={13} /> {day.rain}%</div>{showDetails && <div className="forecast-detail">Feels like {Math.round((day.high + day.low) / 2)}°</div>}</article>)}</section>
      <section className="section-heading stats-heading"><div><p className="eyebrow">DETAILS</p><h2>Weather stats</h2></div></section>
      <section className="stats-grid">{metricCards.map((metric) => <div className="stat-card" key={metric.label}><div className="stat-icon"><metric.icon size={18} /></div><div><p>{metric.label}</p><strong>{city[metric.key]}{metric.suffix}</strong></div><span className="trend">{metric.label === 'Wind' ? 'Breezy' : metric.label === 'Humidity' ? 'Moderate' : 'Good'}</span></div>)}<div className="stat-card sun-card"><div className="sun-times"><div><Sunrise size={19} /><span>Sunrise</span><b>{city.sunrise}</b></div><div><Sunset size={19} /><span>Sunset</span><b>{city.sunset}</b></div></div></div><div className="stat-card pressure-card"><div className="stat-icon"><Gauge size={18} /></div><div><p>Pressure</p><strong>{city.pressure}</strong></div><span className="trend">Steady</span></div></section>
    </main>
     <footer><span>Weatherly</span><span>Local forecast, thoughtfully made.</span><span>Data refreshes every 10 minutes</span></footer>{notice && <div className="toast" role="status">{notice}</div>}
  </div>
}

export default App
