import { useState, useEffect, useRef } from 'react';
import { fetchISSPosition, fetchAstronauts } from '../services/api';
import { getNearestPlace } from '../utils/helpers';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 30000; // 30 seconds

export function useISSData() {
  const [position,     setPosition]     = useState(null);
  const [trajectory,   setTrajectory]   = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts,   setAstronauts]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [simulated,    setSimulated]    = useState(false);

  const mountedRef = useRef(true);
  const timerRef   = useRef(null);
  const astroRef   = useRef(null);

  async function loadISS(isManual = false) {
    if (isManual) {
      setError(null);
      setLoading(true);
    }

    try {
      // fetchISSPosition never throws — it falls back to simulation
      const data = await fetchISSPosition();
      if (!mountedRef.current) return;

      const lat        = parseFloat(data?.latitude);
      const lon        = parseFloat(data?.longitude);

      if (isNaN(lat) || isNaN(lon)) throw new Error('Bad coordinates');

      const speed      = Math.round(parseFloat(data?.velocity)  || 27724);
      const altitude   = (parseFloat(data?.altitude)            || 408).toFixed(1);
      const visibility = String(data?.visibility                ?? 'daylight');
      const timestamp  = Number(data?.timestamp)               || Math.floor(Date.now() / 1000);
      const nearest    = getNearestPlace(lat, lon);
      const isSim      = Boolean(data?.simulated);

      setPosition({ lat, lon, speed, altitude, visibility, timestamp, nearest });
      setSimulated(isSim);
      setError(null);

      setTrajectory(prev => [...prev, { lat, lon, timestamp }].slice(-15));

      setSpeedHistory(prev => {
        const label = new Date(timestamp * 1000).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit',
        });
        return [...prev, { time: label, speed }].slice(-30);
      });

      if (isManual) toast.success(isSim ? 'Using orbital simulation 🛸' : 'ISS updated! 🛸');
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useISSData]', err.message);
      setError('ISS data temporarily unavailable.');
      if (isManual) toast.error('Failed to refresh ISS position');
    } finally {
      if (isManual && mountedRef.current) setLoading(false);
    }
  }

  async function loadAstronauts() {
    try {
      const data = await fetchAstronauts();
      if (!mountedRef.current) return;
      if (data?.message === 'success' && Array.isArray(data.people)) {
        const issOnly = data.people.filter(p => p.craft === 'ISS');
        setAstronauts(issOnly.length ? issOnly : data.people);
      }
    } catch {
      // fetchAstronauts already has a fallback — this should never reach here
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    const boot = async () => {
      setLoading(true);
      await Promise.allSettled([loadISS(), loadAstronauts()]);
      if (mountedRef.current) setLoading(false);
    };

    boot();

    // Delay first poll slightly to avoid burst on mount
    const startDelay = setTimeout(() => {
      timerRef.current = setInterval(() => loadISS(), POLL_INTERVAL);
      astroRef.current = setInterval(() => loadAstronauts(), 600_000);
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearTimeout(startDelay);
      clearInterval(timerRef.current);
      clearInterval(astroRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    position,
    trajectory,
    speedHistory,
    astronauts,
    loading,
    error,
    simulated,
    refreshISS: () => loadISS(true),
  };
}
