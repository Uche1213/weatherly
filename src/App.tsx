import { useState } from 'react'
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
type City = { name: string; region: string; temp: number; condition: string; icon: Icon; feels: number; high: number; low: number; humidity: number; wind: string; visibility: string; pressure: string; sunrise: string; sunset: string; days: Day[] }

const days = (items: Array<[string, string, Icon, string, number, number, number]>): Day[] =>
  items.map(([day, date, icon, condition, high, low, rain]) => ({ day, date, icon, condition, high, low, rain }))

const cities: City[] = [
  { name: 'San Francisco', region: 'California, United States', temp: 18, condition: 'Partly cloudy', icon: CloudSun, feels: 18, high: 20, low: 13, humidity: 72, wind: 'SW 14 km/h', visibility: '16 km', pressure: '1018 hPa', sunrise: '6:42 AM', sunset: '7:38 PM', days: days([['Today', 'Aug 24', CloudSun, 'Partly cloudy', 20, 13, 12], ['Mon', 'Aug 25', CloudSun, 'Mostly sunny', 21, 14, 4], ['Tue', 'Aug 26', CloudSun, 'Mostly sunny', 22, 14, 3], ['Wed', 'Aug 27', CloudRain, 'Light rain', 18, 13, 58], ['Thu', 'Aug 28', CloudSun, 'Clearing up', 20, 12, 18], ['Fri', 'Aug 29', CloudSun, 'Sunny', 23, 13, 2], ['Sat', 'Aug 30', CloudSun, 'Sunny', 24, 14, 1]]) },
  { name: 'London', region: 'England, United Kingdom', temp: 16, condition: 'Light rain', icon: CloudRain, feels: 15, high: 18, low: 12, humidity: 80, wind: 'W 12 km/h', visibility: '10 km', pressure: '1012 hPa', sunrise: '5:58 AM', sunset: '8:09 PM', days: days([['Today', 'Aug 24', CloudRain, 'Light rain', 18, 12, 70], ['Mon', 'Aug 25', CloudSun, 'Cloudy', 19, 13, 42], ['Tue', 'Aug 26', CloudSun, 'Partly cloudy', 21, 14, 20], ['Wed', 'Aug 27', CloudRain, 'Showers', 17, 12, 65], ['Thu', 'Aug 28', CloudSun, 'Sunny spells', 20, 11, 18], ['Fri', 'Aug 29', CloudSun, 'Mostly sunny', 22, 13, 12], ['Sat', 'Aug 30', CloudSun, 'Sunny', 23, 14, 9]]) },
  { name: 'Tokyo', region: 'Kanto, Japan', temp: 27, condition: 'Mostly sunny', icon: CloudSun, feels: 29, high: 29, low: 22, humidity: 64, wind: 'S 9 km/h', visibility: '13 km', pressure: '1009 hPa', sunrise: '5:08 AM', sunset: '6:19 PM', days: days([['Today', 'Aug 24', CloudSun, 'Mostly sunny', 29, 22, 8], ['Mon', 'Aug 25', CloudSun, 'Sunny', 30, 23, 5], ['Tue', 'Aug 26', CloudRain, 'Scattered rain', 28, 22, 38], ['Wed', 'Aug 27', CloudRain, 'Heavy showers', 26, 21, 72], ['Thu', 'Aug 28', CloudSun, 'Clearing up', 28, 21, 22], ['Fri', 'Aug 29', CloudSun, 'Sunny', 30, 22, 5], ['Sat', 'Aug 30', CloudSun, 'Sunny', 31, 23, 4]]) },
]

const metricCards = [
  { label: 'Feels like', key: 'feels' as const, icon: Thermometer, suffix: '°' },
  { label: 'Humidity', key: 'humidity' as const, icon: Droplets, suffix: '%' },
  { label: 'Wind', key: 'wind' as const, icon: Wind, suffix: '' },
  { label: 'Visibility', key: 'visibility' as const, icon: LocateFixed, suffix: '' },
]

function App() {
  const [city, setCity] = useState(cities[0])
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const results = cities.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><CloudSun size={22} /></span><span>weatherly</span></div>
      <nav><button className="nav-active">Overview</button><button>Locations</button><button>Map</button></nav>
      <div className="header-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19} /></button><div className="avatar">JD</div><span className="profile-name">Jordan Davis</span><ChevronDown size={15} /></div>
      <button className="menu-button" onClick={() => setShowSearch(!showSearch)} aria-label="Toggle search"><Menu size={22} /></button>
    </header>
    <main>
      <section className="intro-row">
        <div><p className="eyebrow">Saturday, August 24, 2024</p><h1>Good morning, Jordan <span>✦</span></h1><p className="subtitle">Here’s your weather outlook for today.</p></div>
        <div className="search-wrap"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city..." /><kbd>⌘ K</kbd>{query && <button onClick={() => setQuery('')} className="clear"><X size={15} /></button>}{query && results.length > 0 && <div className="search-results">{results.map((item) => <button key={item.name} onClick={() => { setCity(item); setQuery('') }}><item.icon size={18} /><span><b>{item.name}</b><small>{item.region}</small></span><strong>{item.temp}°</strong></button>)}</div>}</div>
      </section>
      <div className="location-tabs">{cities.map((item) => <button className={city.name === item.name ? 'selected' : ''} key={item.name} onClick={() => setCity(item)}><item.icon size={17} />{item.name}</button>)}<button className="add-location">+ Add location</button></div>
      <section className="hero-grid">
        <div className="current-card"><div className="card-top"><div><p className="eyebrow">CURRENT WEATHER</p><h2>{city.name}</h2><p className="muted">{city.region}</p></div><button className="more">•••</button></div><div className="current-reading"><city.icon className="hero-icon" size={92} strokeWidth={1.4} /><div><div className="temperature">{city.temp}<sup>°C</sup></div><div className="condition">{city.condition}</div><div className="range">H:{city.high}° &nbsp; L:{city.low}°</div></div></div><div className="updated"><span className="pulse" /> Updated just now <span>•</span> Feels like {city.feels}°</div></div>
        <div className="outlook-card"><div className="card-top"><div><p className="eyebrow">TODAY'S OUTLOOK</p><h3>Comfortable day ahead</h3></div><CalendarDays size={20} className="soft-icon" /></div><p className="outlook-copy">A mix of sun and clouds with a light breeze. Perfect conditions for being outdoors.</p><div className="outlook-line"><span><Umbrella size={17} /> Chance of rain</span><strong>{city.days[0].rain}%</strong><div className="progress"><i style={{ width: `${city.days[0].rain}%` }} /></div></div><div className="outlook-line"><span><Wind size={17} /> Wind conditions</span><strong>{city.wind}</strong></div></div>
      </section>
      <section className="section-heading"><div><p className="eyebrow">NEXT 7 DAYS</p><h2>Weekly forecast</h2></div><button className="link-button">View details <span>→</span></button></section>
      <section className="forecast-grid">{city.days.map((day) => <article className={`forecast-card ${day.day === 'Today' ? 'today' : ''}`} key={day.day}><div className="day-label">{day.day}</div><div className="date-label">{day.date}</div><day.icon size={32} strokeWidth={1.5} className="forecast-icon" /><div className="day-condition">{day.condition}</div><div className="day-temps"><b>{day.high}°</b><span>{day.low}°</span></div><div className="rain-chance"><Droplets size={13} /> {day.rain}%</div></article>)}</section>
      <section className="section-heading stats-heading"><div><p className="eyebrow">DETAILS</p><h2>Weather stats</h2></div></section>
      <section className="stats-grid">{metricCards.map((metric) => <div className="stat-card" key={metric.label}><div className="stat-icon"><metric.icon size={18} /></div><div><p>{metric.label}</p><strong>{city[metric.key]}{metric.suffix}</strong></div><span className="trend">{metric.label === 'Wind' ? 'Breezy' : metric.label === 'Humidity' ? 'Moderate' : 'Good'}</span></div>)}<div className="stat-card sun-card"><div className="sun-times"><div><Sunrise size={19} /><span>Sunrise</span><b>{city.sunrise}</b></div><div><Sunset size={19} /><span>Sunset</span><b>{city.sunset}</b></div></div></div><div className="stat-card pressure-card"><div className="stat-icon"><Gauge size={18} /></div><div><p>Pressure</p><strong>{city.pressure}</strong></div><span className="trend">Steady</span></div></section>
    </main>
    <footer><span>Weatherly</span><span>Local forecast, thoughtfully made.</span><span>Data refreshes every 10 minutes</span></footer>
  </div>
}

export default App
