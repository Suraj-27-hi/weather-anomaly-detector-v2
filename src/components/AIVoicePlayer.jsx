import { useState, useEffect } from "react"
import {
  playAIVoice,
  stopAIVoice,
  getAvailableFemaleVoices,
  getSelectedFemaleVoice,
  setFemaleVoicePreference,
  isFemaleVoice,
} from "../services/aiVoiceService"
import "./AIVoicePlayer.css"

export default function AIVoicePlayer({ voiceScript, locationName }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [femaleVoices, setFemaleVoices] = useState([])
  const [activeVoiceName, setActiveVoiceName] = useState("")
  const [showVoiceSelect, setShowVoiceSelect] = useState(false)

  // Load and sync available voices
  useEffect(() => {
    const updateVoices = () => {
      const available = getAvailableFemaleVoices()
      setFemaleVoices(available)
      const current = getSelectedFemaleVoice()
      if (current) {
        setActiveVoiceName(current.name)
      }
    }

    updateVoices()

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", updateVoices)
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", updateVoices)
      }
    }
  }, [])

  // Stop speech when location or script changes
  useEffect(() => {
    stopAIVoice()
    setIsPlaying(false)
  }, [voiceScript, locationName])

  // Stop speech on unmount
  useEffect(() => {
    return () => stopAIVoice()
  }, [])

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAIVoice()
      setIsPlaying(false)
    } else {
      if (!voiceScript) return
      setIsPlaying(true)
      const success = playAIVoice(voiceScript, {
        voiceName: activeVoiceName,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      })
      if (!success) {
        setIsPlaying(false)
      }
    }
  }

  const handleVoiceChange = (e) => {
    const voiceName = e.target.value
    setActiveVoiceName(voiceName)
    setFemaleVoicePreference(voiceName)
    // If currently playing, restart with new voice
    if (isPlaying) {
      stopAIVoice()
      setIsPlaying(true)
      playAIVoice(voiceScript, {
        voiceName,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      })
    }
  }

  const handleCopy = () => {
    if (!voiceScript) return
    navigator.clipboard.writeText(voiceScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = voiceScript ? voiceScript.split(/\s+/).filter(Boolean).length : 0
  const isSelectedFemale = activeVoiceName
    ? isFemaleVoice({ name: activeVoiceName })
    : true

  return (
    <div className={`ai-voice-player-card ${isPlaying ? "playing" : ""}`}>
      {/* TOP ROW: Title & Main Play Button */}
      <div className="voice-player-header">
        <div className="voice-player-title" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="voice-mic-icon">{isPlaying ? "🔊" : "🎙️"}</span>
          <div className="voice-title-text">
            <div className="voice-badge-row">
              <strong>AI Voice Weather Update</strong>
              <span className="female-voice-tag" title="Tuned for natural female meteorological audio briefing">
                <span className="female-sparkle">✨</span> Female AI Voice
              </span>
            </div>
            <small>Natural Meteorological Audio Briefing • {wordCount} words</small>
          </div>
        </div>

        <div className="voice-player-controls">
          {isPlaying && (
            <div className="voice-soundwave" aria-label="Audio playing">
              <span className="wave-bar bar-1" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-3" />
              <span className="wave-bar bar-4" />
              <span className="wave-bar bar-5" />
            </div>
          )}

          <button
            type="button"
            className={`voice-play-btn ${isPlaying ? "active-stop" : ""}`}
            onClick={handleTogglePlay}
            title={isPlaying ? "Stop speech" : "Listen to female AI voice update"}
          >
            <span className="btn-icon">{isPlaying ? "⏹" : "▶"}</span>
            <span className="btn-label">{isPlaying ? "Stop" : "Listen (Female)"}</span>
          </button>

          <button
            type="button"
            className="voice-sub-btn"
            onClick={() => setShowVoiceSelect(!showVoiceSelect)}
            title="Select Female Voice Settings"
            aria-label="Voice settings"
          >
            ⚙
          </button>

          <button
            type="button"
            className="voice-sub-btn"
            onClick={handleCopy}
            title="Copy voice script"
            aria-label="Copy script"
          >
            {copied ? "✓" : "📋"}
          </button>
        </div>
      </div>

      {/* VOICE SELECTION BAR (collapsible or toggleable) */}
      {(showVoiceSelect || femaleVoices.length > 1) && (
        <div className="voice-selector-bar">
          <label className="voice-selector-label" htmlFor="female-voice-dropdown">
            <span className="voice-icon-pill">♀</span>
            <span>Female Voice:</span>
          </label>
          <div className="voice-select-wrapper">
            <select
              id="female-voice-dropdown"
              value={activeVoiceName}
              onChange={handleVoiceChange}
              className="female-voice-select"
            >
              {femaleVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.replace(/Microsoft |Google /g, "")} {isFemaleVoice(v) ? "(Female)" : "(Natural)"}
                </option>
              ))}
              {femaleVoices.length === 0 && (
                <option value="">Default Female AI Voice Profile</option>
              )}
            </select>
          </div>
          <span className="voice-tone-info">
            {isSelectedFemale ? "Natural Tone (1.08x)" : "Pitch Shifted (Female Timbre)"}
          </span>
        </div>
      )}

      {/* SCRIPT CONTENT */}
      {isExpanded && voiceScript && (
        <div className="voice-script-bubble">
          <div className="quote-mark">“</div>
          <p>{voiceScript}</p>
          <div className="quote-mark end-quote">”</div>
        </div>
      )}
    </div>
  )
}
