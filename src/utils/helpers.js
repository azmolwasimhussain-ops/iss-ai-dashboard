/**
 * Haversine formula to calculate distance between two lat/lon points in km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculate speed in km/h given two positions and timestamps
 */
export function calculateSpeed(pos1, pos2, time1, time2) {
  if (!pos1 || !pos2) return 0;
  const distKm = calculateDistance(pos1.lat, pos1.lon, pos2.lat, pos2.lon);
  const timeHours = (time2 - time1) / 3600; // convert seconds to hours
  if (timeHours <= 0) return 0;
  return Math.round(distKm / timeHours);
}

/**
 * Format a Unix timestamp to a readable time string
 */
export function formatTimestamp(unixTs) {
  const date = new Date(unixTs * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Get nearest region name from lat/lon (simplified lookup)
 */
export function getNearestPlace(lat, lon) {
  // Major ocean/region detection based on lat/lon bounds
  if (lat > 60) return 'Arctic Region';
  if (lat < -60) return 'Antarctic Region';
  if (lon > -30 && lon < 25 && lat > 0 && lat < 60) return 'Atlantic Ocean / Europe';
  if (lon > 25 && lon < 60 && lat > 0 && lat < 60) return 'Eurasia';
  if (lon > 60 && lon < 150 && lat > 0 && lat < 55) return 'Asia';
  if (lon > 100 && lon < 160 && lat > -45 && lat < 0) return 'Pacific Ocean (SW)';
  if (lon > -180 && lon < -60 && lat > 10 && lat < 75) return 'North America';
  if (lon > -80 && lon < -35 && lat > -55 && lat < 12) return 'South America';
  if (lon > 10 && lon < 55 && lat > -35 && lat < 37) return 'Africa';
  if (lon > -180 && lon < -90 && lat > -60 && lat < 10) return 'Pacific Ocean';
  if (lon > -30 && lon < 20 && lat > -60 && lat < 0) return 'South Atlantic Ocean';
  if (lon > 55 && lon < 100 && lat > -20 && lat < 30) return 'Indian Ocean';
  return 'Pacific Ocean';
}

/**
 * Debounce utility
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLen = 120) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}
