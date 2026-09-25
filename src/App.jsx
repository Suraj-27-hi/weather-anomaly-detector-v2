import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "./App.css"
import {
  STATE_LOCATIONS_MAP,
  searchLocalLocations,
} from "./data/stateLocationsData"
import { analyzeWeatherWithAI } from "./services/aiWeatherService"
import { generateVoiceScript } from "./services/aiVoiceService"
import AIWeatherPanel from "./components/AIWeatherPanel"
import AIVoicePlayer from "./components/AIVoicePlayer"

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------

const BACKEND_URL =
  "https://weather-anomaly-backend--duttasayan976.replit.app"

const POPULAR_LOCATIONS = [
  { name: "Bengaluru, Karnataka", latitude: 12.9716, longitude: 77.5946, state: "Karnataka" },
  { name: "Mumbai, Maharashtra", latitude: 19.076, longitude: 72.8777, state: "Maharashtra" },
  { name: "Delhi", latitude: 28.6139, longitude: 77.209, state: "Delhi" },
  { name: "Chennai, Tamil Nadu", latitude: 13.0827, longitude: 80.2707, state: "Tamil Nadu" },
  { name: "Hyderabad, Telangana", latitude: 17.385, longitude: 78.4867, state: "Telangana" },
  { name: "Kolkata, West Bengal", latitude: 22.5726, longitude: 88.3639, state: "West Bengal" },
  { name: "Pune, Maharashtra", latitude: 18.5204, longitude: 73.8567, state: "Maharashtra" },
  { name: "Patna, Bihar", latitude: 25.5941, longitude: 85.1376, state: "Bihar" },
  { name: "Jaipur, Rajasthan", latitude: 26.9124, longitude: 75.7873, state: "Rajasthan" },
]

// Dynamically generate all 32 Indian states and UTs with coordinates from the catalog
const STATES = Object.keys(STATE_LOCATIONS_MAP).map((stateName) => {
  const firstLoc = STATE_LOCATIONS_MAP[stateName][0]
  return {
    name: stateName,
    latitude: firstLoc.latitude,
    longitude: firstLoc.longitude,
  }
})

// ------------------------------------------------------------
// LEAFLET MARKER
// ------------------------------------------------------------

const locationIcon = L.divIcon({
  className: "custom-location-marker",
  html: `<div class="location-marker-pin">●</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

// ------------------------------------------------------------
// MAP HELPERS
// ------------------------------------------------------------

function MapMover({ latitude, longitude, zoom = 11 }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([latitude, longitude], zoom, {
      duration: 1.2,
    })
  }, [latitude, longitude, zoom, map])

  return null
}

function MapClickHandler({ onLocationClick }) {
  useMapEvents({
    click(event) {
      onLocationClick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function LocateButton({ onLocate, isLocating }) {
  return (
    <button
      className={`map-locate-button ${isLocating ? "locating" : ""}`}
      onClick={onLocate}
      title="Ask browser permission for live location"
      aria-label="Detect live location"
      disabled={isLocating}
    >
      {isLocating ? "⟳" : "⦿"}
    </button>
  )
}

function highlightMatch(text, query) {
  if (!query || !query.trim()) return text
  const q = query.trim()
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text

  return (
    <>
      {text.substring(0, idx)}
      <mark className="search-match-mark">{text.substring(idx, idx + q.length)}</mark>
      {text.substring(idx + q.length)}
    </>
  )
}

// ------------------------------------------------------------
// WEATHER HELPERS
// ------------------------------------------------------------

function getWeatherCondition(code) {
  const weatherCodes = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  }

  return weatherCodes[code] || "Unknown"
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️"
  if ([1, 2].includes(code)) return "🌤️"
  if ([3].includes(code)) return "☁️"
  if ([45, 48].includes(code)) return "🌫️"
  if ([51, 53, 55].includes(code)) return "🌦️"
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️"
  if ([95, 96, 99].includes(code)) return "⛈️"

  return "🌤️"
}

function getWindDirection(degrees) {
  if (degrees === undefined || degrees === null) return "—"

  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
  ]

  return directions[Math.round(degrees / 45) % 8]
}

function getSeverityClass(severity) {
  if (!severity) return "normal"

  return severity.toLowerCase()
}

// ------------------------------------------------------------
// GRAPH
// ------------------------------------------------------------

function WeatherGraph({ hourlyWeather }) {
  if (!hourlyWeather?.time?.length) {
    return (
      <div className="graph-empty">
        Loading 24-hour weather data...
      </div>
    )
  }

  const temperatures = hourlyWeather.temperature_2m || []
  const rainfall = hourlyWeather.precipitation || []

  const width = 700
  const height = 250
  const left = 45
  const right = 25
  const top = 25
  const bottom = 45

  const plotWidth = width - left - right
  const plotHeight = height - top - bottom

  const maxTemp = Math.max(...temperatures, 35)
  const minTemp = Math.min(...temperatures, 15)

  const maxRain = Math.max(...rainfall, 5)

  const getX = (index) => {
    if (temperatures.length <= 1) return left

    return left + (index / (temperatures.length - 1)) * plotWidth
  }

  const getTempY = (temp) => {
    const range = maxTemp - minTemp || 1

    return (
      top +
      plotHeight -
      ((temp - minTemp) / range) * plotHeight
    )
  }

  const getRainHeight = (rain) => {
    return (rain / maxRain) * plotHeight * 0.55
  }

  const temperaturePoints = temperatures
    .map((temp, index) => `${getX(index)},${getTempY(temp)}`)
    .join(" ")

  const timeLabels = hourlyWeather.time.map((time) => {
    const date = new Date(time)

    return date.toLocaleTimeString([], {
      hour: "numeric",
    })
  })

  const labelIndexes = [0, 6, 12, 18, 23].filter(
    (index) => index < hourlyWeather.time.length
  )

  return (
    <div className="weather-graph">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Grid */}
        {[0, 1, 2, 3].map((line) => {
          const y = top + (plotHeight / 3) * line

          return (
            <line
              key={line}
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              className="graph-grid"
            />
          )
        })}

        {/* Rainfall bars */}
        {rainfall.map((rain, index) => {
          const barWidth =
            Math.max(plotWidth / rainfall.length - 3, 3)

          const barHeight = getRainHeight(rain)

          return (
            <rect
              key={index}
              x={getX(index) - barWidth / 2}
              y={top + plotHeight - barHeight}
              width={barWidth}
              height={barHeight}
              rx="2"
              className="rain-bar"
            />
          )
        })}

        {/* Temperature line */}
        <polyline
          points={temperaturePoints}
          fill="none"
          className="temperature-line"
        />

        {/* Temperature points */}
        {temperatures.map((temp, index) => {
          if (index % 3 !== 0) return null

          return (
            <circle
              key={index}
              cx={getX(index)}
              cy={getTempY(temp)}
              r="3"
              className="temperature-point"
            />
          )
        })}

        {/* X labels */}
        {labelIndexes.map((index) => (
          <text
            key={index}
            x={getX(index)}
            y={height - 14}
            textAnchor="middle"
            className="graph-label"
          >
            {timeLabels[index]}
          </text>
        ))}

        {/* Y labels */}
        <text x="8" y={top + 5} className="graph-label">
          {Math.round(maxTemp)}°
        </text>

        <text
          x="8"
          y={top + plotHeight}
          className="graph-label"
        >
          {Math.round(minTemp)}°
        </text>
      </svg>

      <div className="graph-legend">
        <span>
          <i className="legend-dot temp-dot" />
          Temperature (°C)
        </span>

        <span>
          <i className="legend-box rain-dot" />
          Rainfall (mm)
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// MAIN APP
// ------------------------------------------------------------

export default function App() {
  const [latitude, setLatitude] = useState(12.9716)
  const [longitude, setLongitude] = useState(77.5946)
  const [mapZoom, setMapZoom] = useState(11)

  const [selectedLocation, setSelectedLocation] = useState({
    name: "Bengaluru, Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    state: "Karnataka",
  })

  const [selectedState, setSelectedState] = useState("Karnataka")

  // Search & Typeahead autocomplete state
  const [searchPlace, setSearchPlace] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Live location permission & detection state
  const [isLocating, setIsLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState("")
  const [locationStatusType, setLocationStatusType] = useState("info")

  // AI Weather Intelligence State
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem("gemini_api_key") || ""
    } catch {
      return ""
    }
  })

  const [weather, setWeather] = useState(null)
  const [hourlyWeather, setHourlyWeather] = useState(null)

  const [weatherLoading, setWeatherLoading] = useState(true)
  const [graphLoading, setGraphLoading] = useState(true)

  const [result, setResult] = useState(null)
  const [anomalyLoading, setAnomalyLoading] = useState(true)

  const [error, setError] = useState("")

  const [mapMode, setMapMode] = useState("satellite")
  const [radarTile, setRadarTile] = useState(null)

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("weatherSearchHistory") || "[]"
      )
    } catch {
      return []
    }
  })

  // Dynamic location list derived from the chosen state
  const currentLocationOptions = useMemo(() => {
    if (selectedState && STATE_LOCATIONS_MAP[selectedState]) {
      return STATE_LOCATIONS_MAP[selectedState]
    }
    return POPULAR_LOCATIONS
  }, [selectedState])

  // Dismiss suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [currentTime, setCurrentTime] = useState(
    new Date()
  )

  // ----------------------------------------------------------
  // LIVE CLOCK
  // ----------------------------------------------------------

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // ----------------------------------------------------------
  // RADAR DATA
  // ----------------------------------------------------------

  useEffect(() => {
    let cancelled = false

    async function loadRadar() {
      try {
        const response = await fetch(
          "https://api.rainviewer.com/public/weather-maps.json"
        )

        if (!response.ok) {
          throw new Error("Radar unavailable")
        }

        const data = await response.json()

        const past = data?.radar?.past || []

        if (!past.length) {
          throw new Error("No radar frame available")
        }

        const latest = past[past.length - 1]

        const tileUrl =
          `${data.host}${latest.path}` +
          `/256/{z}/{x}/{y}/2/1_1.png`

        if (!cancelled) {
          setRadarTile(tileUrl)
        }
      } catch (err) {
        console.error("Radar error:", err)

        if (!cancelled) {
          setRadarTile(null)
        }
      }
    }

    loadRadar()

    const interval = setInterval(loadRadar, 5 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // ----------------------------------------------------------
  // SEARCH HISTORY
  // ----------------------------------------------------------

  function saveSearchHistory(location) {
    const newItem = {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    }

    const filtered = searchHistory.filter(
      (item) =>
        item.name.toLowerCase() !==
        location.name.toLowerCase()
    )

    const updated = [newItem, ...filtered].slice(0, 6)

    setSearchHistory(updated)

    localStorage.setItem(
      "weatherSearchHistory",
      JSON.stringify(updated)
    )
  }

  function clearSearchHistory() {
    setSearchHistory([])
    localStorage.removeItem("weatherSearchHistory")
  }

  // ----------------------------------------------------------
  // WEATHER
  // ----------------------------------------------------------

  async function fetchWeather(lat, lon) {
    setWeatherLoading(true)
    setError("")

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
        `&timezone=auto`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Weather request failed")
      }

      const data = await response.json()

      setWeather(data)
      return data
    } catch (err) {
      console.error(err)
      setError("Unable to load weather data.")
      return null
    } finally {
      setWeatherLoading(false)
    }
  }

  async function fetchHourlyWeather(lat, lon) {
    setGraphLoading(true)

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&hourly=temperature_2m,precipitation` +
        `&past_hours=24` +
        `&forecast_hours=1` +
        `&timezone=auto`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Hourly weather request failed")
      }

      const data = await response.json()

      setHourlyWeather(data.hourly)
      return data.hourly
    } catch (err) {
      console.error(err)
      setHourlyWeather(null)
      return null
    } finally {
      setGraphLoading(false)
    }
  }

  async function fetchAnomaly(lat, lon) {
    setAnomalyLoading(true)

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/weather/analyze?latitude=${lat}&longitude=${lon}`
      )

      if (!response.ok) {
        throw new Error("Anomaly request failed")
      }

      const data = await response.json()

      setResult(data)
      return data
    } catch (err) {
      console.error(err)

      setResult(null)
      return null
    } finally {
      setAnomalyLoading(false)
    }
  }

  // ----------------------------------------------------------
  // AI WEATHER INTELLIGENCE ANALYSIS
  // ----------------------------------------------------------

  async function runAIAnalysis(locName, curWeather, hrlyWeather, dlyWeather, anomList, weatherCond) {
    setAiLoading(true)
    try {
      const targetLocation = locName || selectedLocation.name
      const res = await analyzeWeatherWithAI({
        locationName: targetLocation,
        currentWeather: curWeather || weather?.current,
        hourlyWeather: hrlyWeather || hourlyWeather,
        dailyWeather: dlyWeather || weather?.daily,
        condition: weatherCond || (weather?.current ? getWeatherCondition(weather.current.weather_code) : "Partly Cloudy"),
        anomalies: anomList || result?.anomalies || [],
        apiKey: geminiApiKey,
      })
      setAiResult(res)
    } catch (err) {
      console.error("AI Analysis error:", err)
    } finally {
      setAiLoading(false)
    }
  }

  async function loadLocation(lat, lon, locName) {
    setLatitude(lat)
    setLongitude(lon)

    const [weatherData, hourlyData, anomalyData] = await Promise.all([
      fetchWeather(lat, lon),
      fetchHourlyWeather(lat, lon),
      fetchAnomaly(lat, lon),
    ])

    const targetName = locName || selectedLocation.name
    const currentCond = weatherData?.current
      ? getWeatherCondition(weatherData.current.weather_code)
      : "Partly Cloudy"

    runAIAnalysis(
      targetName,
      weatherData?.current,
      hourlyData,
      weatherData?.daily,
      anomalyData?.anomalies || [],
      currentCond
    )
  }

  // ----------------------------------------------------------
  // SELECT LOCATION
  // ----------------------------------------------------------

  async function selectLocation(location, saveHistory = true, zoom = 11) {
    setSelectedLocation(location)

    const lat = Number(location.latitude)
    const lon = Number(location.longitude)

    setLatitude(lat)
    setLongitude(lon)
    setMapZoom(zoom)

    // Sync selected state if location specifies state or includes it in name
    if (location.state && STATE_LOCATIONS_MAP[location.state]) {
      setSelectedState(location.state)
    } else {
      const stateMatch = STATES.find((state) =>
        location.name.toLowerCase().includes(state.name.toLowerCase())
      )
      if (stateMatch) {
        setSelectedState(stateMatch.name)
      }
    }

    if (saveHistory) {
      saveSearchHistory(location)
    }

    await loadLocation(lat, lon, location.name)
  }

  // ----------------------------------------------------------
  // LIVE LOCATION PERMISSION & DETECTION
  // ----------------------------------------------------------

  async function requestLiveLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.")
      setLocationStatusType("error")
      setTimeout(() => setLocationStatus(""), 5000)
      return
    }

    setIsLocating(true)
    setLocationStatus("Requesting live location permission... Please click 'Allow' in your browser.")
    setLocationStatusType("info")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords
        setLocationStatus("Permission granted! Resolving your area...")
        setLocationStatusType("info")

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          )
          const data = await response.json()
          const address = data.address || {}

          const locality =
            address.suburb ||
            address.neighbourhood ||
            address.residential ||
            address.road ||
            ""
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            "My Location"
          const state = address.state || ""

          const nameParts = [locality, city, state].filter(Boolean)
          const displayName =
            nameParts.length > 0 ? nameParts.join(", ") : `${city}, ${state}`

          const location = {
            name: displayName,
            latitude: lat,
            longitude: lon,
            state: state || "",
          }

          if (state) {
            const matchedState = Object.keys(STATE_LOCATIONS_MAP).find(
              (s) =>
                state.toLowerCase().includes(s.toLowerCase()) ||
                s.toLowerCase().includes(state.toLowerCase())
            )
            if (matchedState) {
              setSelectedState(matchedState)
            }
          }

          await selectLocation(location, true, 13)
          setLocationStatus(`Live location detected: ${displayName}`)
          setLocationStatusType("success")
          setTimeout(() => setLocationStatus(""), 5000)
        } catch (err) {
          console.error("Reverse geocode error:", err)
          const fallback = {
            name: `Live Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: lat,
            longitude: lon,
          }
          await selectLocation(fallback, true, 13)
          setLocationStatus(`Live location detected (${lat.toFixed(4)}, ${lon.toFixed(4)})`)
          setLocationStatusType("success")
          setTimeout(() => setLocationStatus(""), 4000)
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        setIsLocating(false)
        console.warn("Geolocation error:", err)
        if (err.code === 1) {
          setLocationStatus(
            "Permission denied. Please allow location access in your browser settings (click 🔒 icon beside URL bar) to detect your live location."
          )
        } else if (err.code === 2) {
          setLocationStatus("Location unavailable. Please check your GPS or network.")
        } else if (err.code === 3) {
          setLocationStatus("Location request timed out. Please try again.")
        } else {
          setLocationStatus("Unable to access live location.")
        }
        setLocationStatusType("error")
        setTimeout(() => setLocationStatus(""), 7000)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    )
  }

  // ----------------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadLocation(12.9716, 77.5946, "Bengaluru, Karnataka")
  }, [])

  // ----------------------------------------------------------
  // MAP CLICK
  // ----------------------------------------------------------

  async function handleMapClick(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      )

      const data = await response.json()

      const address = data.address || {}

      const locality =
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.road ||
        ""

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "Selected Location"

      const state = address.state || ""

      const nameParts = [locality, city, state].filter(Boolean)
      const name = nameParts.length > 0 ? nameParts.slice(0, 2).join(", ") : city

      const location = {
        name,
        latitude: lat,
        longitude: lon,
        state: state || "",
      }

      await selectLocation(location, true, 12)
    } catch (err) {
      console.error(err)
    }
  }

  // ----------------------------------------------------------
  // LIVE TYPEAHEAD SEARCH
  // ----------------------------------------------------------

  function handleSearchInputChange(event) {
    const value = event.target.value
    setSearchPlace(value)
    setActiveSuggestionIndex(-1)

    if (!value || value.trim().length === 0) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      return
    }

    // 1. Instant local catalog lookup (0ms) - matches "ELE" -> Electronic City, Phase 1, Phase 2, etc.
    const localResults = searchLocalLocations(value, selectedState)
    setSearchSuggestions(localResults)
    setShowSuggestions(true)

    // 2. Debounced background Nominatim search (300ms) for broader arbitrary places
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(
            value
          )}&limit=5`
        )
        if (!response.ok) return
        const data = await response.json()
        if (data && data.length > 0) {
          const remoteResults = data.map((place) => {
            const parts = place.display_name.split(",")
            const name = parts.slice(0, 2).join(",").trim()
            const statePart =
              parts.length > 2 ? parts[parts.length - 2].trim() : ""
            return {
              name,
              state: statePart,
              latitude: Number(place.lat),
              longitude: Number(place.lon),
            }
          })

          setSearchSuggestions((prev) => {
            const existingNames = new Set(prev.map((p) => p.name.toLowerCase()))
            const newItems = remoteResults.filter(
              (r) => !existingNames.has(r.name.toLowerCase())
            )
            return [...prev, ...newItems].slice(0, 10)
          })
        }
      } catch {
        // Silently ignored, local catalog results are already visible
      }
    }, 300)
  }

  function handleSelectSuggestion(item) {
    setSearchPlace(item.name)
    setShowSuggestions(false)
    setSearchSuggestions([])
    selectLocation(item, true, 12)
  }

  function handleSearchKeyDown(event) {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (event.key === "Enter") {
        handleSearch(event)
      }
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveSuggestionIndex((prev) =>
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < searchSuggestions.length
      ) {
        handleSelectSuggestion(searchSuggestions[activeSuggestionIndex])
      } else {
        handleSearch(event)
      }
    } else if (event.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  async function handleSearch(event) {
    if (event?.preventDefault) event.preventDefault()

    const query = searchPlace.trim()
    if (!query) return

    // If an item in search suggestions is currently highlighted, use it
    if (
      activeSuggestionIndex >= 0 &&
      activeSuggestionIndex < searchSuggestions.length
    ) {
      handleSelectSuggestion(searchSuggestions[activeSuggestionIndex])
      return
    }

    // Check instant local catalog matches
    const localMatches = searchLocalLocations(query, selectedState)
    if (localMatches.length > 0) {
      const topMatch = localMatches[0]
      setShowSuggestions(false)
      await selectLocation(topMatch, true, 12)
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(
          query
        )}&limit=1`
      )

      const data = await response.json()

      if (!data.length) {
        alert("Location not found.")
        return
      }

      const place = data[0]

      const location = {
        name: place.display_name
          .split(",")
          .slice(0, 2)
          .join(","),
        latitude: Number(place.lat),
        longitude: Number(place.lon),
      }

      setShowSuggestions(false)
      await selectLocation(location, true, 12)
    } catch (err) {
      console.error(err)
      alert("Search failed.")
    }
  }

  // ----------------------------------------------------------
  // STATE SELECT
  // ----------------------------------------------------------

  async function handleStateChange(event) {
    const stateName = event.target.value
    setSelectedState(stateName)

    const stateLocs = STATE_LOCATIONS_MAP[stateName] || []
    if (stateLocs.length > 0) {
      // Pick the primary city/capital of the chosen state
      const primary = stateLocs[0]
      await selectLocation(primary, true, 10)
    }
  }

  // ----------------------------------------------------------
  // DERIVED WEATHER VALUES
  // ----------------------------------------------------------

  const current = weather?.current
  const daily = weather?.daily

  const temperature = current?.temperature_2m
  const condition = current
    ? getWeatherCondition(current.weather_code)
    : "Loading..."

  const icon = current
    ? getWeatherIcon(current.weather_code)
    : "🌤️"

  const rainfallLastHour = current?.precipitation ?? 0

  const rainfallToday =
    daily?.precipitation_sum?.[0] ?? 0

  const windSpeed = current?.wind_speed_10m ?? 0

  const windDirection = getWindDirection(
    current?.wind_direction_10m
  )

  const minTemperature =
    daily?.temperature_2m_min?.[0] ?? "—"

  const maxTemperature =
    daily?.temperature_2m_max?.[0] ?? "—"

  const maxWind =
    daily?.wind_speed_10m_max?.[0] ?? "—"

  // ----------------------------------------------------------
  // ANOMALY
  // ----------------------------------------------------------

  const anomalies = result?.anomalies || []

  const anomalyDetected = anomalies.length > 0

  const strongestAnomaly = useMemo(() => {
    if (!anomalies.length) return null

    return anomalies.reduce((strongest, currentItem) => {
      if (!strongest) return currentItem

      return Math.abs(currentItem.zScore || 0) >
        Math.abs(strongest.zScore || 0)
        ? currentItem
        : strongest
    }, null)
  }, [anomalies])

  const anomalyClass = getSeverityClass(
    strongestAnomaly?.severity
  )

  const anomalyTitle = anomalyDetected
    ? "Anomaly detected"
    : "No anomaly detected"

  const anomalyDescription = anomalyDetected
    ? strongestAnomaly?.explanation ||
      "Weather conditions differ from the recent baseline."
    : "Conditions are normal for this region."

  // ----------------------------------------------------------
  // CLIMATE / TYPE
  // ----------------------------------------------------------

  const climate =
    selectedState === "Rajasthan"
      ? "Arid / Semi-arid"
      : selectedState === "Delhi"
      ? "Semi-arid"
      : "Tropical / Monsoon"

  const weatherType =
    current?.weather_code >= 61
      ? "Rainy"
      : current?.weather_code >= 45
      ? "Cloudy"
      : "Mixed"

  const formattedDate = currentTime.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )

  const formattedTime = currentTime.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  )

  // Grounded AI Voice Script (always under 50 words)
  const activeVoiceScript = useMemo(() => {
    if (aiResult?.structured?.voiceScript) {
      return aiResult.structured.voiceScript
    }
    if (current) {
      return generateVoiceScript({
        locationName: selectedLocation.name,
        temperature: Math.round(temperature || 27),
        humidity: Math.round(current.relative_humidity_2m || 76),
        condition: condition || "Partly Cloudy",
        anomalies: result?.anomalies || [],
        dailyWeather: daily,
      })
    }
    return ""
  }, [aiResult, current, selectedLocation.name, temperature, condition, result, daily])

  // ----------------------------------------------------------
  // MOBILE APP & PWA INTEGRATION
  // ----------------------------------------------------------
  const [mobileTab, setMobileTab] = useState("overview") // 'overview' | 'map' | 'ai' | 'trends'
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  )
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener("resize", handleResize)
    handleResize()

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }

  const handleSwitchTab = (tab) => {
    setMobileTab(tab)
    if (tab === "map") {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"))
      }, 120)
    }
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className={`app ${isMobile ? "mobile-app-layout" : ""}`}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <span>AI</span>
            <span className="brand-cloud">☁</span>
          </div>

          <div>
            <h1>
              Weather Anomaly
              <span> Detector</span>
            </h1>

            <p>
              Real-time weather data
              <b> • </b>
              Satellite view
              <b> • </b>
              Anomaly detection
            </p>
          </div>
        </div>

        <div className="header-status">
          {installPrompt && !isInstalled && (
            <button
              type="button"
              className="install-pwa-btn"
              onClick={handleInstallApp}
              title="Install as native Mobile App"
            >
              📱 Install App
            </button>
          )}

          <span className="live-dot" />
          <span>Live Data</span>

          <div className="header-divider" />

          <span>
            {formattedDate} {formattedTime} IST
          </span>

          <div className="notification-wrapper">
            <button
              className="notification-button"
              title="Notifications"
              onClick={() => alert("No new notifications")}
            >
              🔔
              <span className="notification-dot" />
            </button>

            <button className="settings-button">
              ⚙
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className={`dashboard ${isMobile ? `mobile-mode tab-${mobileTab}` : ""}`}>
        {/* ==================================================
            LEFT DASHBOARD
        ================================================== */}

        <section className={`left-panel ${isMobile && mobileTab !== "overview" && mobileTab !== "trends" ? "mobile-hidden" : ""}`}>

          {/* LOCATION & STATE ROW */}
          <div className="selector-row">
            <div className="selector-group">
              <label>
                <span className="label-icon">●</span>
                Location ({selectedState})
              </label>

              <div className="select-wrapper">
                <select
                  value={
                    currentLocationOptions.some(
                      (item) => item.name === selectedLocation.name
                    )
                      ? selectedLocation.name
                      : ""
                  }
                  onChange={(event) => {
                    const location =
                      currentLocationOptions.find(
                        (item) =>
                          item.name === event.target.value
                      )

                    if (location) {
                      selectLocation(location, true, 12)
                    }
                  }}
                >
                  {!currentLocationOptions.some(
                    (item) => item.name === selectedLocation.name
                  ) && (
                    <option value="">
                      {selectedLocation.name}
                    </option>
                  )}

                  {currentLocationOptions.map((location) => (
                    <option
                      key={location.name}
                      value={location.name}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="selector-group">
              <label>
                <span className="label-icon">⌖</span>
                State
              </label>

              <div className="select-wrapper">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                >
                  {STATES.map((state) => (
                    <option
                      key={state.name}
                      value={state.name}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SEARCH & LIVE LOCATION ROW */}
          <div className="search-and-locate-row">
            <div className="search-box-wrapper" ref={searchContainerRef}>
              <form
                className="search-box"
                onSubmit={handleSearch}
              >
                <span className="search-icon">⌕</span>

                <input
                  ref={searchInputRef}
                  value={searchPlace}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (searchPlace.trim().length >= 1 && searchSuggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Type to search (e.g. ELE for Electronic City, Phase 1, Bandra...)"
                />

                {searchPlace && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchPlace("")
                      setSearchSuggestions([])
                      setShowSuggestions(false)
                    }}
                    title="Clear input"
                  >
                    ✕
                  </button>
                )}

                <button type="submit">
                  Search
                </button>
              </form>

              {/* LIVE TYPEAHEAD SUGGESTIONS DROPDOWN */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  <div className="suggestions-header">
                    <span>Suggestions for "{searchPlace}"</span>
                    <small>{searchSuggestions.length} found</small>
                  </div>
                  <div className="suggestions-list">
                    {searchSuggestions.map((item, index) => (
                      <div
                        key={`${item.name}-${item.latitude}-${index}`}
                        className={`suggestion-item ${
                          index === activeSuggestionIndex ? "active" : ""
                        }`}
                        onMouseDown={() => handleSelectSuggestion(item)}
                      >
                        <div className="suggestion-icon">📍</div>
                        <div className="suggestion-details">
                          <div className="suggestion-name">
                            {highlightMatch(item.name, searchPlace)}
                          </div>
                          {item.state && (
                            <span className="suggestion-state-tag">
                              {item.state}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`live-location-btn ${isLocating ? "locating" : ""}`}
              onClick={requestLiveLocation}
              title="Click to ask browser permission and detect your live location"
              disabled={isLocating}
            >
              <span className="live-gps-icon">{isLocating ? "⟳" : "⦿"}</span>
              <span className="live-btn-text">
                {isLocating ? "Locating..." : "Live Location"}
              </span>
            </button>
          </div>

          {/* STATUS NOTIFICATION BANNER */}
          {locationStatus && (
            <div className={`location-status-banner ${locationStatusType}`}>
              <span className="status-banner-icon">
                {locationStatusType === "error"
                  ? "⚠️"
                  : locationStatusType === "success"
                  ? "✓"
                  : "ℹ"}
              </span>
              <span>{locationStatus}</span>
            </div>
          )}

          {/* SEARCH HISTORY */}
          {searchHistory.length > 0 && (
            <div className="history-row">
              <div className="history-title">
                Recent
              </div>

              <div className="history-items">
                {searchHistory.map((item) => (
                  <button
                    key={`${item.name}-${item.latitude}`}
                    onClick={() =>
                      selectLocation(item, false)
                    }
                  >
                    • {item.name}
                  </button>
                ))}

                <button
                  className="clear-history"
                  onClick={clearSearchHistory}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              MAIN WEATHER CARD
          ================================================= */}

          <div className="main-weather-card">
            <div className="main-weather">
              <div className="weather-big-icon">
                {weatherLoading ? "…" : icon}
              </div>

              <div>
                <div className="temperature">
                  {weatherLoading
                    ? "—"
                    : `${Math.round(temperature)}°C`}
                </div>

                <div className="condition">
                  {condition}
                </div>
              </div>
            </div>

            <div className="weather-divider" />

            <div
              className={`anomaly-summary ${anomalyClass}`}
            >
              <div className="anomaly-symbol">
                {anomalyDetected ? "!" : "✓"}
              </div>

              <div>
                <strong>
                  {anomalyLoading
                    ? "Analyzing..."
                    : anomalyTitle}
                </strong>

                <p>
                  {anomalyLoading
                    ? "Checking recent weather patterns."
                    : anomalyDescription}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              AI VOICE WEATHER UPDATE
          ================================================= */}
          {activeVoiceScript && (
            <AIVoicePlayer
              voiceScript={activeVoiceScript}
              locationName={selectedLocation.name}
            />
          )}

          {/* =================================================
              THREE INFO CARDS
          ================================================= */}

          <div className="three-card-grid">
            <div className="info-card">
              <div className="info-icon">☁</div>

              <div>
                <span>Weather</span>
                <strong>{condition}</strong>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon leaf">
                ◇
              </div>

              <div>
                <span>Climate</span>
                <strong>{climate}</strong>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                🌤
              </div>

              <div>
                <span>Type</span>
                <strong>
                  {weatherType}
                </strong>
              </div>
            </div>
          </div>

          {/* =================================================
              RAIN + WIND
          ================================================= */}

          <div className="two-card-grid">
            <div className="metric-card">
              <div className="metric-icon rain-icon">
                💧
              </div>

              <div className="metric-content">
                <span>Rainfall</span>

                <strong>
                  {rainfallLastHour.toFixed(1)} mm
                </strong>

                <small>
                  (Last 1 hour)
                </small>

                <div className="secondary-value">
                  {rainfallToday.toFixed(1)} mm
                  <small> (Today)</small>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon wind-icon">
                ≋
              </div>

              <div className="metric-content">
                <span>Wind Speed</span>

                <strong>
                  {Math.round(windSpeed)} km/h
                  <em> ({windDirection})</em>
                </strong>

                <small>
                  Max: {Math.round(maxWind)} km/h
                </small>
              </div>
            </div>
          </div>

          {/* =================================================
              TEMPERATURE
          ================================================= */}

          <div className="temperature-card">
            <div className="section-title">
              <span className="temperature-icon">
                ♨
              </span>

              Temperature
            </div>

            <div className="temperature-stats">
              <div>
                <span>Current</span>
                <strong>
                  {temperature !== undefined
                    ? `${Math.round(temperature)}°C`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Min (Today)</span>
                <strong>
                  {typeof minTemperature === "number"
                    ? `${Math.round(
                        minTemperature
                      )}°C`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Max (Today)</span>
                <strong>
                  {typeof maxTemperature ===
                  "number"
                    ? `${Math.round(
                        maxTemperature
                      )}°C`
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* =================================================
              GRAPH
          ================================================= */}

          <div className="graph-card">
            <div className="section-title">
              <span>◈</span>
              Last 24 Hours
              <small>
                (Temperature & Rainfall)
              </small>
            </div>

            {graphLoading ? (
              <div className="graph-empty">
                Loading graph...
              </div>
            ) : (
              <WeatherGraph
                hourlyWeather={hourlyWeather}
              />
            )}
          </div>

        </section>

        {/* ==================================================
            RIGHT MAP
        ================================================== */}

        <section className={`map-panel ${isMobile && mobileTab !== "map" ? "mobile-hidden" : ""}`}>

          <div className="map-header">
            <div className="map-tabs">
              <button
                className={
                  mapMode === "satellite"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMapMode("satellite")
                }
              >
                Live Satellite
              </button>

              <button
                className={
                  mapMode === "radar"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMapMode("radar")
                }
              >
                Radar / Rainfall
              </button>
            </div>

            <div className="map-header-ai">
              <span className={`ai-header-status-badge ${aiLoading ? "loading" : "active"}`}>
                <span className="ai-header-pulse" />
                🤖 AI Anomaly Intel: {aiLoading ? "Analyzing..." : "Active"}
              </span>
            </div>
          </div>

          <div className="map-container-wrapper">
            <MapContainer
              center={[latitude, longitude]}
              zoom={5}
              minZoom={3}
              maxZoom={18}
              className="main-map"
              scrollWheelZoom={true}
            >

              <MapMover
                latitude={latitude}
                longitude={longitude}
                zoom={mapZoom}
              />

              <MapClickHandler
                onLocationClick={handleMapClick}
              />

              {/* SATELLITE */}
              {mapMode === "satellite" ? (
                <TileLayer
                  attribution='&copy; Esri, Maxar, Earthstar Geographics'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={18}
                />
              ) : (
                <>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />

                  {radarTile && (
                    <TileLayer
                      url={radarTile}
                      opacity={0.72}
                      zIndex={500}
                      attribution='Weather radar &copy; RainViewer'
                      maxZoom={7}
                    />
                  )}
                </>
              )}

              <Marker
                position={[latitude, longitude]}
                icon={locationIcon}
              >
                <Popup>
                  <strong>
                    {selectedLocation.name}
                  </strong>
                  <br />
                  {latitude.toFixed(4)},{" "}
                  {longitude.toFixed(4)}
                </Popup>
              </Marker>

              <LocateButton
                isLocating={isLocating}
                onLocate={requestLiveLocation}
              />

            </MapContainer>

            {/* AI WEATHER INTELLIGENCE (RIGHT CORNER) */}
            <AIWeatherPanel
              aiResult={aiResult}
              isLoading={aiLoading}
              onRefresh={() =>
                runAIAnalysis(
                  selectedLocation.name,
                  weather?.current,
                  hourlyWeather,
                  weather?.daily,
                  result?.anomalies
                )
              }
              geminiKey={geminiApiKey}
              onSaveGeminiKey={(key) => {
                setGeminiApiKey(key)
                if (key) {
                  localStorage.setItem("gemini_api_key", key)
                } else {
                  localStorage.removeItem("gemini_api_key")
                }
              }}
            />

            {/* MAP INFORMATION */}
            <div className="map-info">
              <span className="map-live-dot" />
              {mapMode === "satellite"
                ? "Satellite imagery"
                : radarTile
                ? "Live radar overlay"
                : "Radar unavailable"}
            </div>

            {/* RADAR LEGEND */}
            {mapMode === "radar" && (
              <div className="rainfall-legend">
                <strong>
                  Rainfall Intensity
                </strong>

                <div className="rainbow-bar" />

                <div className="legend-labels">
                  <span>Light</span>
                  <span>Heavy</span>
                </div>
              </div>
            )}

            {mapMode === "radar" && (
              <div className="radar-credit">
                Weather radar by RainViewer
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            MOBILE DEDICATED AI STUDIO VIEW
        ================================================== */}
        {isMobile && mobileTab === "ai" && (
          <section className="mobile-ai-panel">
            <div className="mobile-view-heading">
              <span className="mobile-ai-sparkle">🎙️</span>
              <div>
                <h2>AI Meteorological Voice Studio</h2>
                <small>Natural Female Voice Narrator & Predictive Anomaly Intel</small>
              </div>
            </div>

            {activeVoiceScript && (
              <AIVoicePlayer
                voiceScript={activeVoiceScript}
                locationName={selectedLocation.name}
              />
            )}

            <AIWeatherPanel
              aiResult={aiResult}
              isLoading={aiLoading}
              onRefresh={() =>
                runAIAnalysis(
                  selectedLocation.name,
                  weather?.current,
                  hourlyWeather,
                  weather?.daily,
                  result?.anomalies
                )
              }
              geminiKey={geminiApiKey}
              onSaveGeminiKey={(key) => {
                setGeminiApiKey(key)
                if (key) {
                  localStorage.setItem("gemini_api_key", key)
                } else {
                  localStorage.removeItem("gemini_api_key")
                }
              }}
            />
          </section>
        )}
      </main>

      {/* ======================================================
          MOBILE BOTTOM APP NAVIGATION BAR
      ====================================================== */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "overview" ? "active" : ""}`}
            onClick={() => handleSwitchTab("overview")}
          >
            <span className="mobile-nav-icon">🌦️</span>
            <span className="mobile-nav-label">Intel</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "map" ? "active" : ""}`}
            onClick={() => handleSwitchTab("map")}
          >
            <span className="mobile-nav-icon">🛰️</span>
            <span className="mobile-nav-label">Live Map</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "ai" ? "active" : ""}`}
            onClick={() => handleSwitchTab("ai")}
          >
            <span className="mobile-nav-icon">🎙️</span>
            <span className="mobile-nav-label">Female AI</span>
            {activeVoiceScript && <span className="mobile-voice-glow" />}
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${mobileTab === "trends" ? "active" : ""}`}
            onClick={() => handleSwitchTab("trends")}
          >
            <span className="mobile-nav-icon">📈</span>
            <span className="mobile-nav-label">Trends</span>
          </button>
        </nav>
      )}

      {/* ERROR */}
      {error && (
        <div className="global-error">
          {error}
        </div>
      )}
    </div>
  )
}
