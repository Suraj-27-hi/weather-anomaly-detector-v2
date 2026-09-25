/**
 * AI Voice Service
 * Generates natural, under-50-word meteorological voice scripts
 * and handles browser Text-to-Speech (TTS) playback with audio visualizer support.
 */

export function generateVoiceScript({
  locationName = "Bengaluru",
  temperature = 27,
  humidity = 76,
  condition = "partly cloudy",
  anomalies = [],
  dailyWeather = null,
}) {
  const shortCity = (locationName || "Bengaluru").split(",")[0].trim();
  const currentTemp = Math.round(Number(temperature) || 27);
  const currentHumid = Math.round(Number(humidity) || 76);
  const condText = (condition || "clear").toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  // Primary anomaly check
  const primaryAnomaly = anomalies.length > 0
    ? [...anomalies].sort((a, b) => Math.abs(b.zScore || 0) - Math.abs(a.zScore || 0))[0]
    : null;

  const hasAnomaly = !!primaryAnomaly || currentHumid >= 75 || currentTemp >= 34;
  const metricName = primaryAnomaly?.metric ? primaryAnomaly.metric.replace(/_/g, " ") : "humidity";
  const zScore = primaryAnomaly?.zScore !== undefined ? Number(primaryAnomaly.zScore) : (currentHumid >= 75 ? 2.4 : 0);
  
  // Severity
  let severity = primaryAnomaly?.severity ? primaryAnomaly.severity.toLowerCase() : "";
  if (!severity) {
    const absZ = Math.abs(zScore);
    severity = absZ >= 3.0 ? "high" : absZ >= 2.0 ? "moderate" : "low";
  }

  // Forecast check (rainfall or wind in next 24-48h)
  const d1Rain = dailyWeather?.precipitation_sum?.[1] ? Number(dailyWeather.precipitation_sum[1]) : 0;
  const d2Rain = dailyWeather?.precipitation_sum?.[2] ? Number(dailyWeather.precipitation_sum[2]) : 0;
  const maxRain = Math.max(d1Rain, d2Rain);

  const d1Wind = dailyWeather?.wind_speed_10m_max?.[1] ? Number(dailyWeather.wind_speed_10m_max[1]) : 0;

  let anomalySentence = "";
  let forecastSentence = "";

  if (hasAnomaly) {
    const isHigher = zScore >= 0;
    anomalySentence = `The system has detected unusually ${isHigher ? "high" : "low"} ${metricName} with ${severity} severity compared with the recent baseline.`;

    if (maxRain >= 5 || condText.includes("rain") || condText.includes("shower") || condText.includes("storm")) {
      forecastSentence = "Rainfall probability is also increasing. You may want to be prepared for wet conditions.";
    } else if (d1Wind >= 26) {
      forecastSentence = "Wind gusts are expected to rise. Be prepared for breezy conditions.";
    } else if (currentTemp >= 33) {
      forecastSentence = "Warm conditions will likely persist. Stay hydrated.";
    } else {
      forecastSentence = "Conditions should gradually stabilize over the next twenty-four hours.";
    }
  } else {
    anomalySentence = "No anomalies were detected compared with recent baseline.";
    forecastSentence = "Expect steady weather over the next twenty-four hours.";
  }

  // Construct script strictly matching the user's example style
  let script = `${greeting} Here's your weather update for ${shortCity}. It's currently ${currentTemp} degrees Celsius and ${condText}, with ${currentHumid} percent humidity. ${anomalySentence} ${forecastSentence}`;

  // Strict word-count clamp: ensure it never exceeds 50 words
  const words = script.split(/\s+/).filter(Boolean);
  if (words.length > 50) {
    // If slightly over 50, use concise version
    const conciseAnomaly = `The system detected a ${severity} anomaly of ${metricName} versus baseline.`;
    script = `${greeting} Here's your weather update for ${shortCity}. It's currently ${currentTemp} degrees Celsius and ${condText}, with ${currentHumid} percent humidity. ${conciseAnomaly} ${forecastSentence}`;
    const recheck = script.split(/\s+/).filter(Boolean);
    if (recheck.length > 50) {
      script = recheck.slice(0, 49).join(" ") + ".";
    }
  }

  return script;
}

// Browser Text-To-Speech Playback with Female AI Voice Prioritization

const FEMALE_KEYWORDS = [
  "female",
  "zira",
  "jenny",
  "aria",
  "sonia",
  "heera",
  "neerja",
  "samantha",
  "victoria",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "serena",
  "ava",
  "allison",
  "susan",
  "catherine",
  "linda",
  "stephanie",
  "hazel",
  "siri",
  "google uk english female",
  "google us english",
  "natural (female)",
];

const MALE_KEYWORDS = [
  "male",
  "david",
  "mark",
  "george",
  "ravi",
  "prabhat",
  "rishi",
  "guy",
  "christopher",
  "eric",
  "steffan",
  "james",
  "richard",
  "alex",
  "daniel",
  "fred",
  "junior",
  "ralph",
];

let userSelectedFemaleVoiceName = "";
if (typeof localStorage !== "undefined") {
  try {
    userSelectedFemaleVoiceName = localStorage.getItem("preferred_female_voice") || "";
  } catch {}
}

export function isFemaleVoice(voice) {
  if (!voice) return false;
  const name = (voice.name || "").toLowerCase();

  // If explicitly designated male, reject
  const isMale = MALE_KEYWORDS.some((kw) => name.includes(kw));
  if (isMale) return false;

  // If matches known female voice names or tags
  const hasFemaleKeyword = FEMALE_KEYWORDS.some((kw) => name.includes(kw));
  if (hasFemaleKeyword) return true;

  // Check gender property if exposed by browser
  if (voice.gender && String(voice.gender).toLowerCase() === "female") {
    return true;
  }

  return false;
}

export function getAvailableFemaleVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices() || [];
  const englishVoices = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("en"));
  const femaleVoices = englishVoices.filter(isFemaleVoice);

  if (femaleVoices.length > 0) {
    return femaleVoices.sort((a, b) => {
      const aScore = (a.name.includes("Natural") || a.name.includes("Neural") || a.name.includes("Google") || a.name.includes("Online")) ? 2 : 1;
      const bScore = (b.name.includes("Natural") || b.name.includes("Neural") || b.name.includes("Google") || b.name.includes("Online")) ? 2 : 1;
      return bScore - aScore;
    });
  }

  return englishVoices;
}

export function getSelectedFemaleVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  // 1. User manual override
  if (userSelectedFemaleVoiceName) {
    const matched = voices.find((v) => v.name === userSelectedFemaleVoiceName);
    if (matched) return matched;
  }

  // 2. High-priority known natural female voice
  const femaleList = getAvailableFemaleVoices();
  if (femaleList.length > 0 && isFemaleVoice(femaleList[0])) {
    return femaleList[0];
  }

  // 3. Any English voice
  const englishVoice =
    voices.find((v) => (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural")) && v.lang.startsWith("en")) ||
    voices.find((v) => v.lang === "en-IN") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];

  return englishVoice || null;
}

export function setFemaleVoicePreference(voiceName) {
  userSelectedFemaleVoiceName = voiceName;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("preferred_female_voice", voiceName);
    } catch {}
  }
}

export function playAIVoice(text, { onStart, onEnd, onError, voiceName, pitch, rate } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech Synthesis API not available in this browser environment.");
    return false;
  }

  try {
    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const executeSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices() || [];
      let chosenVoice = null;

      if (voiceName) {
        chosenVoice = voices.find((v) => v.name === voiceName);
      }
      if (!chosenVoice) {
        chosenVoice = getSelectedFemaleVoice();
      }

      const voiceIsFemale = isFemaleVoice(chosenVoice);

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Feminine audio profile:
      // If voice is confirmed female: pitch = 1.08 (natural, clear, bright tone)
      // If voice is fallback/neutral/male: pitch = 1.25 (elevates frequency to ensure female timbre)
      if (typeof pitch === "number") {
        utterance.pitch = pitch;
      } else if (voiceIsFemale) {
        utterance.pitch = 1.08;
      } else {
        utterance.pitch = 1.25;
      }

      utterance.rate = typeof rate === "number" ? rate : 0.96;

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      if (onError) utterance.onerror = onError;

      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices() || [];
    if (currentVoices.length === 0) {
      let triggered = false;
      const onVoicesReady = () => {
        if (triggered) return;
        triggered = true;
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
        executeSpeak();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
      setTimeout(onVoicesReady, 120);
    } else {
      setTimeout(executeSpeak, 40);
    }

    return true;
  } catch (err) {
    console.error("AI Female Voice playback error:", err);
    if (onError) onError(err);
    return false;
  }
}

export function stopAIVoice() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
