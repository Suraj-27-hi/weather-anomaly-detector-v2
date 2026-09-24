import { useState, useEffect } from "react"
import { playAIVoice, stopAIVoice } from "../services/aiVoiceService"
import "./AIVoicePlayer.css"

export default function AIVoicePlayer({ voiceScript, locationName }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  // Stop speech when location changes
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
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      })
      if (!success) {
        setIsPlaying(false)
      }
    }
  }

  const handleCopy = () => {
    if (!voiceScript) return
    navigator.clipboard.writeText(voiceScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = voiceScript ? voiceScript.split(/\s+/).filter(Boolean).length : 0

  return (
    <div className={`ai-voice-player-card ${isPlaying ? "playing" : ""}`}>
      <div className="voice-player-header">
        <div className="voice-player-title" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="voice-mic-icon">{isPlaying ? "🔊" : "🎙️"}</span>
          <div className="voice-title-text">
            <strong>AI Voice Weather Update</strong>
            <small>Natural Meteorological Audio Briefing • {wordCount} words</small>
          </div>
        </div>

        <div className="voice-player-controls">
          {isPlaying && (
            <div className="voice-soundwave">
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
            title={isPlaying ? "Stop speech" : "Listen to AI voice update"}
          >
            <span className="btn-icon">{isPlaying ? "⏹" : "▶"}</span>
            <span className="btn-label">{isPlaying ? "Stop" : "Listen"}</span>
          </button>

          <button
            type="button"
            className="voice-sub-btn"
            onClick={handleCopy}
            title="Copy voice script"
          >
            {copied ? "✓" : "📋"}
          </button>
        </div>
      </div>

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
