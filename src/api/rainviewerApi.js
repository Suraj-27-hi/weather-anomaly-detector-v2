const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';

let cachedData = null;
let lastFetchTime = 0;

export async function fetchRadarFrames() {
  const now = Date.now();
  // Cache for 2 minutes
  if (cachedData && (now - lastFetchTime < 120000)) {
    return cachedData;
  }

  try {
    const res = await fetch(RAINVIEWER_API);
    if (!res.ok) throw new Error(`RainViewer error: ${res.status}`);
    const data = await res.json();

    const host = data.host || 'https://tilecache.rainviewer.com';
    const past = data.radar?.past || [];
    const nowcast = data.radar?.nowcast || [];
    const allFrames = [...past, ...nowcast];

    const processedFrames = allFrames.map(f => {
      const date = new Date(f.time * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return {
        time: f.time,
        timeFormatted: `${hours}:${mins}`,
        path: f.path,
        tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`
      };
    });

    cachedData = {
      host,
      frames: processedFrames,
      currentFrameIndex: processedFrames.length - 1
    };
    lastFetchTime = now;
    return cachedData;
  } catch (err) {
    console.warn('Failed to load RainViewer radar frames:', err);
    return {
      host: 'https://tilecache.rainviewer.com',
      frames: [],
      currentFrameIndex: 0
    };
  }
}
