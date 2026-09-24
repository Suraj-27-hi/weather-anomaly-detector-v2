import { useState, useEffect } from 'react';

export function useISTClock() {
  const [timeState, setTimeState] = useState(() => getISTData());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(getISTData());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeState;
}

function getISTData() {
  const now = new Date();
  
  // Format options for Indian Standard Time
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return {
    date: dateFormatter.format(now),
    time: timeFormatter.format(now),
    timezone: 'IST',
    timestamp: now.getTime()
  };
}
