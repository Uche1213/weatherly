import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarDays, ChevronDown, CloudSun, Droplets, Gauge, LocateFixed, Menu, Moon, Search, Sun, Sunrise, Sunset, Thermometer, Umbrella, Wind, X, Star, Trash2, RefreshCw } from 'lucide-react'
import { fetchWeather, locationId, searchLocations } from './services/weatherApi'
import type { Location, Weather } from './types/weather'
import { formatClock, formatDay, formatTemperature, formatWind, getCondition, getInsight } from './utils/weather'

const defaultLocation: Location = { id: 'san-francisco-37.7749--122.4194', name: 'San Francisco', region: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194 }
const STORAGE = { favorites: 'weatherly-favorites', recent: 'weatherly-recent', units: 'weatherly-units', theme: 'weatherly-theme' }
type TempUnit = 'C' | 'F'
type WindUnit = 'km/h' | 'mph' | 'm/s'
type Units = { temperature: TempUnit; wind: WindUnit }
const initialUnits: Units = { temperature: 'C', wind: 'km/h' }

const readStorage = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback } }
const saveStorage = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))

function Skeleton() { return <div className="skeleton-panel" aria-label="Loading weather"><span /><span /><span /><span /></div> }

function Chart({ weather, units }: { weather: Weather; units: Units }) {
  const points = weather.hours.slice(0, 10)
  if (!points.length) return null
  const values = points.map((hour) => hour.temperature)
  const min = Math.min(...values) - 1
  const max = Math.max(...values) + 1
  const coords = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - ((value - min) / (max - min)) * 82 - 9}`).join(' ')
  return <section className="panel chart-panel" aria-labelledby="trend-title"><div className="section-title"><div><p className="eyebrow">TEMPERATURE TREND</p><h2 id="trend-title">The next few hours</h2></div><span className="legend"><i /> Temperature</span></div><div className="chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Temperature trend for the next ten hours"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6679e4" stopOpacity=".25" /><stop offset="1" stopColor="#6679e4" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${coords} 100,100`} fill="url(#chart-fill)" /><polyline points={coords} fill="none" stroke="#6679e4" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{values.map((value, index) => <circle key={index} cx={(index / (values.length - 1)) * 100} cy={100 - ((value - min) / (max - min)) * 82 - 9} r="1.8" fill="#fff" stroke="#6679e4" strokeWidth="1.2" vectorEffect="non-scaling-stroke"><title>{formatTemperature(value, units.temperature)}</title></circle>)}</svg><div className="chart-labels">{points.map((hour, index) => <span key={hour.time}>{index === 0 ? 'Now' : formatClock(hour.time, weather.timezone)}</span>)}</div></div></section>
}

function App() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [location, setLocation] = useState(defaultLocation)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Location[]>([])
  const [favorites, setFavorites] = useState<Location[]>(() => readStorage(STORAGE.favorites, []))
  const [recent, setRecent] = useState<Location[]>(() => readStorage(STORAGE.recent, []))
  const [units, setUnits] = useState<Units>(() => readStorage(STORAGE.units, initialUnits))
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStorage(STORAGE.theme, 'light'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notice, setNotice] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { document.documentElement.dataset.theme = theme; saveStorage(STORAGE.theme, theme) }, [theme])
  useEffect(() => { const controller = new AbortController(); loadWeather(defaultLocation, controller.signal); return () => controller.abort() }, [])
  useEffect(() => { saveStorage(STORAGE.favorites, favorites) }, [favorites])
  useEffect(() => { saveStorage(STORAGE.recent, recent) }, [recent])
  useEffect(() => { saveStorage(STORAGE.units, units) }, [units])
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const controller = new AbortController(); setSearching(true)
    const timer = window.setTimeout(() => searchLocations(query.trim(), controller.signal).then(setResults).catch(() => { if (!controller.signal.aborted) setResults([]) }).finally(() => { if (!controller.signal.aborted) setSearching(false) }), 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(timer) }, [notice])

  const loadWeather = async (next: Location, signal?: AbortSignal) => {
    setLoading(true); setError('')
    try { const fresh = await fetchWeather(next, signal); setWeather(fresh); setLocation(next); setRecent((items) => [next, ...items.filter((item) => item.id !== next.id)].slice(0, 5)); setQuery('') }
    catch (reason) { if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError('Unable to load weather data. Check your connection and try again.') }
    finally { if (!signal?.aborted) setLoading(false) }
  }
  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Location services are not supported by this browser.'); return }
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition((position) => loadWeather({ id: `current-${position.coords.latitude}`, name: 'My location', region: 'Current position', latitude: position.coords.latitude, longitude: position.coords.longitude }), (reason) => { setLoading(false); setError(reason.code === 1 ? 'Location permission was denied. You can search for a city instead.' : 'We could not determine your location. Please try again.') }, { enableHighAccuracy: false, timeout: 10000 })
  }
  const choose = (next: Location) => { loadWeather(next); setNotice(`${next.name} weather updated`) }
  const toggleFavorite = () => { if (!location) return; const exists = favorites.some((item) => item.id === location.id); setFavorites(exists ? favorites.filter((item) => item.id !== location.id) : [...favorites, location]); setNotice(exists ? 'Removed from favorites' : 'Saved to favorites') }
  const isFavorite = favorites.some((item) => item.id === location.id)
  const selectSearch = (next?: Location) => { const item = next || results[0]; if (item) choose(item); else if (query.trim()) setError("We couldn't find that location.") }
  const condition = weather ? getCondition(weather.code, weather.hours[0]?.isDay ?? true) : getCondition(0)

  return <div className={`app-shell atmosphere-${condition.tone}`}>
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><CloudSun size={21} /></span>weatherly</a><nav aria-label="Main navigation"><a className="nav-active" href="#top">Overview</a><a href="#forecast">Forecast</a><a href="#insights">Insights</a></nav><div className="header-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setNotice('You are all caught up')}><Bell size={18} /></button><button className="avatar" onClick={() => setShowSettings(!showSettings)} aria-label="Open settings">IU</button><span className="profile-name">Ijere Uchenna</span><ChevronDown size={15} /><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button></div>{menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation"><a href="#top" onClick={() => setMenuOpen(false)}>Overview</a><a href="#forecast" onClick={() => setMenuOpen(false)}>Forecast</a><a href="#insights" onClick={() => setMenuOpen(false)}>Insights</a></nav>}</header>
    <main id="top"><section className="intro-row"><div><p className="eyebrow">LIVE WORLDWIDE FORECAST</p><h1>Weather, made <em>clear.</em></h1><p className="subtitle">Understand what is happening now, and plan the hours ahead.</p></div><div className="search-wrap"><Search size={18} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') selectSearch(); if (event.key === 'Escape') setQuery('') }} placeholder="Search any city or country..." aria-label="Search locations" aria-expanded={query.length > 1} /><kbd>⌘ K</kbd>{query && <button className="clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}{query.length > 1 && <div className="search-results">{searching ? <p className="search-state">Searching worldwide...</p> : results.length ? results.map((item) => <button key={item.id} onClick={() => selectSearch(item)}><LocateFixed size={17} /><span><b>{item.name}</b><small>{item.region}{item.country ? `, ${item.country}` : ''}</small></span><strong>→</strong></button>) : <p className="search-state">No locations found. Press Enter to retry.</p>}</div>}</div></section>
      <section className="location-bar" aria-label="Saved locations"><div className="location-scroll">{favorites.map((item) => <button key={item.id} className={item.id === location.id ? 'selected' : ''} onClick={() => choose(item)}><Star size={15} fill="currentColor" />{item.name}</button>)}{recent.filter((item) => !favorites.some((favorite) => favorite.id === item.id)).slice(0, 3).map((item) => <button key={item.id} className={item.id === location.id ? 'selected' : ''} onClick={() => choose(item)}>{item.name}</button>)}<button className="location-action" onClick={useMyLocation}><LocateFixed size={15} /> Use my location</button></div>{recent.length > 0 && <button className="clear-recent" onClick={() => { setRecent([]); setNotice('Recent searches cleared') }}>Clear recent</button>}</section>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => loadWeather(location)}><RefreshCw size={14} /> Try again</button></div>}
      {loading ? <Skeleton /> : weather && <><section className="hero-grid"><article className="current-card"><div className="card-top"><div><p className="eyebrow">CURRENT WEATHER</p><h2>{weather.name}</h2><p className="muted">{weather.region}{weather.country ? `, ${weather.country}` : ''}</p></div><button className="favorite-button" onClick={toggleFavorite} aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}><Star size={20} fill={isFavorite ? 'currentColor' : 'none'} /></button></div><div className="current-reading"><condition.icon className="hero-icon" size={85} strokeWidth={1.4} /><div><div className="temperature">{formatTemperature(weather.temperature, units.temperature)}<sup>{units.temperature}</sup></div><div className="condition">{condition.label}</div><div className="range">H: {formatTemperature(weather.days[0].high, units.temperature)} &nbsp; L: {formatTemperature(weather.days[0].low, units.temperature)}</div></div></div><div className="updated"><span className="pulse" /> Live from Open-Meteo <span>•</span> Feels like {formatTemperature(weather.feelsLike, units.temperature)}</div></article><article className="outlook-card" id="insights"><div className="card-top"><div><p className="eyebrow">TODAY'S OUTLOOK</p><h3>{getInsight(weather).split('.')[0]}</h3></div><CalendarDays size={20} className="soft-icon" /></div><p className="outlook-copy">{getInsight(weather)}</p><div className="outlook-line"><span><Umbrella size={17} /> Chance of rain</span><strong>{weather.days[0].rain}%</strong><div className="progress"><i style={{ width: `${weather.days[0].rain}%` }} /></div></div><div className="outlook-line"><span><Wind size={17} /> Wind</span><strong>{formatWind(weather.wind, units.wind)}</strong></div></article></section>
        <section className="metrics-grid" aria-label="Current weather details"><Metric icon={Thermometer} label="Feels like" value={formatTemperature(weather.feelsLike, units.temperature)} /><Metric icon={Droplets} label="Humidity" value={`${weather.humidity}%`} /><Metric icon={Wind} label="Wind" value={formatWind(weather.wind, units.wind)} /><Metric icon={LocateFixed} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} /><Metric icon={Gauge} label="Pressure" value={`${Math.round(weather.pressure)} hPa`} /><Metric icon={Sun} label="UV index" value={weather.uvIndex.toFixed(1)} /></section>
        <section className="panel hourly-panel" id="forecast"><div className="section-title"><div><p className="eyebrow">HOURLY FORECAST</p><h2>Plan the next 12 hours</h2></div><span className="section-note">Local time</span></div><div className="hourly-scroll">{weather.hours.map((hour, index) => { const detail = getCondition(hour.code, hour.isDay); return <div className={`hour ${index === 0 ? 'now' : ''}`} key={hour.time}><b>{index === 0 ? 'Now' : formatClock(hour.time, weather.timezone)}</b><detail.icon size={24} /><strong>{formatTemperature(hour.temperature, units.temperature)}</strong><small><Droplets size={12} />{hour.rain}%</small></div> })}</div></section>
        <Chart weather={weather} units={units} />
        <section className="section-title daily-heading"><div><p className="eyebrow">7-DAY FORECAST</p><h2>What is coming next</h2></div></section><section className="daily-grid">{weather.days.map((day, index) => { const detail = getCondition(day.code, true); return <article className={`day-card ${index === 0 ? 'today' : ''}`} key={day.date}><div><b>{index === 0 ? 'Today' : formatDay(day.date, weather.timezone).split(',')[0]}</b><small>{formatDay(day.date, weather.timezone).split(',').slice(1).join(',')}</small></div><detail.icon size={29} /><span>{detail.shortLabel}</span><strong>{formatTemperature(day.high, units.temperature)} <i>{formatTemperature(day.low, units.temperature)}</i></strong><small className="rain"><Droplets size={12} /> {day.rain}%</small></article> })}</section></>}
      {showSettings && <aside className="settings" aria-label="Display settings"><div className="settings-head"><b>Display settings</b><button onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={16} /></button></div><label>Temperature <span><button className={units.temperature === 'C' ? 'active' : ''} onClick={() => setUnits({ ...units, temperature: 'C' })}>°C</button><button className={units.temperature === 'F' ? 'active' : ''} onClick={() => setUnits({ ...units, temperature: 'F' })}>°F</button></span></label><label>Wind speed <select value={units.wind} onChange={(event) => setUnits({ ...units, wind: event.target.value as WindUnit })}><option>km/h</option><option>mph</option><option>m/s</option></select></label><label>Theme <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={15} /> : <Sun size={15} />} {theme === 'light' ? 'Dark mode' : 'Light mode'}</button></label>{favorites.length > 0 && <button className="remove-all" onClick={() => { setFavorites([]); setNotice('Favorites cleared') }}><Trash2 size={14} /> Clear favorites</button>}</aside>}
    </main><footer><span>Weatherly</span><span>Forecasts powered by Open-Meteo</span><span>Updated on demand</span></footer>{notice && <div className="toast" role="status">{notice}</div>}
  </div>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Thermometer; label: string; value: string }) { return <article className="metric"><span><Icon size={17} /></span><div><small>{label}</small><strong>{value}</strong></div></article> }

export default App
