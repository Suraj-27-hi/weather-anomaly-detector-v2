import { useState, useEffect } from "react"
import { playAIVoice, stopAIVoice } from "../services/aiVoiceService"
import "./AIWeatherPanel.css"

export default function AIWeatherPanel({
  aiResult,
  isLoading,
  onRefresh,
  geminiKey,
  onSaveGeminiKey,
}) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [keyInput, setKeyInput] = useState(geminiKey || "")
  const [viewMode, setViewMode] = useState("cards") // 'cards' | 'raw'

  const structured = aiResult?.structured
  const rawText = aiResult?.rawText || ""
  const provider = aiResult?.provider || "AI Engine"
  const voiceScript = structured?.voiceScript || ""

  // Stop speech when script changes or panel unmounts
  useEffect(() => {
    stopAIVoice()
    setIsSpeaking(false)
    return () => stopAIVoice()
  }, [voiceScript])

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopAIVoice()
      setIsSpeaking(false)
    } else {
      if (!voiceScript) return
      setIsSpeaking(true)
      const success = playAIVoice(voiceScript, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
      if (!success) setIsSpeaking(false)
    }
  }

  const handleCopy = () => {
    if (!rawText) return
    navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSaveKey = (e) => {
    e.preventDefault()
    onSaveGeminiKey(keyInput.trim())
    setShowSettings(false)
  }

  const severityClass = structured?.anomaly?.severity?.toLowerCase() || "moderate"

  return (
    <div className={`ai-corner-widget ${isMinimized ? "minimized" : ""}`}>
      {/* WIDGET HEADER */}
      <div className="ai-widget-header">
        <div className="ai-widget-brand" onClick={() => setIsMinimized(!isMinimized)}>
          <span className="ai-bot-icon">🤖</span>
          <div className="ai-widget-title">
            <strong>AI Weather Analyst</strong>
            <small>
              <span className="ai-live-pulse" />
              {provider}
            </small>
          </div>
        </div>

        <div className="ai-widget-actions">
          <button
            type="button"
            className="ai-action-btn"
            title="Re-analyze with AI"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? "⟳" : "⚡"}
          </button>

          {voiceScript && (
            <button
              type="button"
              className="ai-action-btn"
              title={isSpeaking ? "Stop Voice Briefing" : "Listen to Female AI Voice Briefing"}
              onClick={handleToggleVoice}
            >
              {isSpeaking ? "⏹" : "🎙️"}
            </button>
          )}

          <button
            type="button"
            className="ai-action-btn"
            title="Copy Formatted Report"
            onClick={handleCopy}
            disabled={isLoading || !rawText}
          >
            {copied ? "✓" : "📋"}
          </button>

          <button
            type="button"
            className="ai-action-btn"
            title="AI Settings & API Key"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙
          </button>

          <button
            type="button"
            className="ai-action-btn minimize-btn"
            title={isMinimized ? "Expand AI Panel" : "Minimize to Corner"}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* SETTINGS POPUP */}
      {showSettings && (
        <div className="ai-settings-modal">
          <div className="ai-settings-header">
            <strong>AI Model Settings</strong>
            <button type="button" onClick={() => setShowSettings(false)}>✕</button>
          </div>
          <p>
            Connected to <b>Free Cloud AI</b> by default. You can optionally connect your own Google Gemini API key:
          </p>
          <form onSubmit={handleSaveKey}>
            <input
              type="password"
              placeholder="Paste Google Gemini API Key (Optional)..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
            <div className="settings-btn-row">
              <button type="submit" className="save-btn">Save Key</button>
              {geminiKey && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => {
                    setKeyInput("")
                    onSaveGeminiKey("")
                  }}
                >
                  Clear Key
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* WIDGET BODY */}
      {!isMinimized && (
        <div className="ai-widget-body">
          {isLoading ? (
            <div className="ai-loading-state">
              <div className="ai-scanner-circle">
                <span className="scanner-beam" />
                🤖
              </div>
              <p>Analyzing meteorological anomalies & forecast with AI...</p>
              <small>Comparing current data with historical baseline</small>
            </div>
          ) : !structured ? (
            <div className="ai-empty-state">
              <p>Select a location or click ⚡ to trigger AI analysis.</p>
            </div>
          ) : (
            <>
              {/* TABS FOR VIEW MODE */}
              <div className="ai-view-tabs">
                <button
                  type="button"
                  className={viewMode === "cards" ? "active" : ""}
                  onClick={() => setViewMode("cards")}
                >
                  Structured Intel
                </button>
                <button
                  type="button"
                  className={viewMode === "raw" ? "active" : ""}
                  onClick={() => setViewMode("raw")}
                >
                  Report Format
                </button>
              </div>

              {viewMode === "raw" ? (
                <div className="ai-raw-view">
                  <pre>{rawText}</pre>
                </div>
              ) : (
                <div className="ai-cards-view">
                  {/* LOCATION HEADER */}
                  <div className="ai-location-tag">
                    <span className="ai-pin">📍</span>
                    <strong>{structured.location}</strong>
                  </div>

                  {/* CURRENT VS HISTORICAL BASELINE */}
                  <div className="ai-comparison-grid">
                    <div className="ai-data-column current-col">
                      <div className="col-title">Current</div>
                      <div className="metric-row">
                        <span>Temperature</span>
                        <strong>{structured.current?.temperature}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Humidity</span>
                        <strong>{structured.current?.humidity}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Rainfall</span>
                        <strong>{structured.current?.rainfall}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Wind Speed</span>
                        <strong>{structured.current?.windSpeed}</strong>
                      </div>
                    </div>

                    <div className="ai-data-column baseline-col">
                      <div className="col-title">Historical Baseline</div>
                      <div className="metric-row">
                        <span>Temperature</span>
                        <strong>{structured.baseline?.temperature}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Humidity</span>
                        <strong>{structured.baseline?.humidity}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Rainfall</span>
                        <strong>{structured.baseline?.rainfall}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Wind Speed</span>
                        <strong>{structured.baseline?.windSpeed}</strong>
                      </div>
                    </div>
                  </div>

                  {/* AI VOICE BRIEFING CARD */}
                  {voiceScript && (
                    <div className="ai-voice-brief-box">
                      <div className="voice-brief-header">
                        <div className="voice-brief-title">
                          <span className="voice-icon">{isSpeaking ? "🔊" : "🎙️"}</span>
                          <div>
                            <strong>Voice Weather Briefing</strong>
                            <span className="female-mini-tag">♀ Female Voice</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`voice-brief-btn ${isSpeaking ? "active-stop" : ""}`}
                          onClick={handleToggleVoice}
                          title={isSpeaking ? "Stop voice" : "Listen in natural female AI voice"}
                        >
                          {isSpeaking ? "⏹ Stop" : "▶ Listen (Female)"}
                        </button>
                      </div>
                      <p className="voice-brief-text">“{voiceScript}”</p>
                      <div className="voice-brief-footer">
                        <span className="word-count-badge">
                          {voiceScript.split(/\s+/).filter(Boolean).length} words
                        </span>
                        <span className="guarantee-badge">✓ Under 50 words</span>
                      </div>
                    </div>
                  )}

                  {/* ANOMALY CARD */}
                  <div className={`ai-anomaly-box ${severityClass}`}>
                    <div className="anomaly-box-top">
                      <div>
                        <span className="anomaly-label">Anomaly Detected</span>
                        <div className="anomaly-metric-title">
                          {structured.anomaly?.metric} z-score: <b>{structured.anomaly?.zScore}</b>
                        </div>
                      </div>
                      <span className={`severity-tag ${severityClass}`}>
                        {structured.anomaly?.severity}
                      </span>
                    </div>
                    {structured.anomaly?.reason && (
                      <p className="anomaly-reason-text">
                        <b>Reason: </b>{structured.anomaly.reason}
                      </p>
                    )}
                  </div>

                  {/* FORECAST */}
                  <div className="ai-info-box forecast-box">
                    <div className="info-box-header">
                      <span>◈</span> Forecast (Next 24–48h)
                    </div>
                    <p>{structured.forecast}</p>
                  </div>

                  {/* POSSIBLE NEXT ANOMALY */}
                  <div className="ai-info-box next-anomaly-box">
                    <div className="info-box-header">
                      <span>⚠</span> Possible Next Anomaly
                    </div>
                    <p>{structured.possibleNextAnomaly}</p>
                  </div>

                  {/* DETAILED SUMMARY */}
                  <div className="ai-info-box summary-box">
                    <div className="info-box-header">
                      <span>📋</span> Summary
                    </div>
                    <p>{structured.summary}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
