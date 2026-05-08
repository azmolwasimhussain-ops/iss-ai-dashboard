import axios from 'axios';

// Primary: wheretheiss.at (CORS-enabled)
const ISS_PRIMARY = 'https://api.wheretheiss.at/v1/satellites/25544';
// Secondary: allorigins CORS proxy wrapping the same API
const ISS_PROXY   = 'https://api.allorigins.win/get?url=' + encodeURIComponent(ISS_PRIMARY);
// Astronauts
const ASTRO_URL   = 'https://api.open-notify.org/astros.json';
// News
const NEWS_URL    = 'https://newsdata.io/api/1/news';

/* ─── ISS Position ───────────────────────────────────────────────────────── */

/**
 * Derive a plausible ISS position from orbital mechanics.
 * The ISS orbits at ~408 km altitude, 51.6° inclination, ~92 min period.
 * Good enough for a dashboard when live API is unavailable.
 */
function simulateISSPosition() {
  const now       = Date.now() / 1000;             // Unix seconds
  const period    = 92.68 * 60;                    // seconds per orbit
  const epoch     = 1715000000;                    // arbitrary reference epoch
  const phase     = ((now - epoch) % period) / period; // 0→1
  const angle     = phase * 2 * Math.PI;

  // Simplified Keplerian approximation
  const inclRad   = 51.6 * (Math.PI / 180);
  const lat       = Math.asin(Math.sin(inclRad) * Math.sin(angle)) * (180 / Math.PI);
  const lonRaw    = (phase * 360 * 14.5) % 360;    // ~14.5 orbits/day
  const lon       = ((lonRaw + 180) % 360) - 180;  // normalise to -180..180

  return {
    latitude:   parseFloat(lat.toFixed(4)),
    longitude:  parseFloat(lon.toFixed(4)),
    velocity:   27700 + Math.round(Math.sin(angle * 3) * 50), // ±50 km/h variation
    altitude:   408 + Math.round(Math.sin(angle * 2) * 2),    // ±2 km variation
    visibility: Math.sin(angle) > -0.2 ? 'daylight' : 'eclipsed',
    timestamp:  Math.floor(now),
    simulated:  true,
  };
}

/**
 * Try to parse a wheretheiss.at payload (direct or via allorigins wrapper)
 */
function parseISSPayload(raw) {
  if (!raw) throw new Error('Empty response');

  // allorigins wraps: { contents: "...", status: {...} }
  const d = (raw.contents) ? JSON.parse(raw.contents) : raw;

  if (d.latitude == null || d.longitude == null) {
    throw new Error('Invalid ISS payload');
  }

  return {
    latitude:   parseFloat(d.latitude),
    longitude:  parseFloat(d.longitude),
    velocity:   parseFloat(d.velocity)  || 27724,
    altitude:   parseFloat(d.altitude)  || 408,
    visibility: String(d.visibility     || 'daylight'),
    timestamp:  Number(d.timestamp)     || Math.floor(Date.now() / 1000),
    simulated:  false,
  };
}

/**
 * Fetch ISS position — tries live API → CORS proxy → orbital simulation
 */
export async function fetchISSPosition() {
  // ── 1. Primary: wheretheiss.at ──────────────────────────────────────
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(ISS_PRIMARY, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    return parseISSPayload(raw);
  } catch (e1) {
    console.warn('[ISS] Primary failed:', e1.message);
  }

  // ── 2. Secondary: allorigins CORS proxy ─────────────────────────────
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(ISS_PROXY, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const raw = await res.json();
    return parseISSPayload(raw);
  } catch (e2) {
    console.warn('[ISS] Proxy failed:', e2.message);
  }

  // ── 3. Fallback: orbital simulation ─────────────────────────────────
  console.info('[ISS] Using orbital simulation (both APIs unavailable)');
  return simulateISSPosition();
}

/* ─── Astronauts ─────────────────────────────────────────────────────────── */

const ASTRONAUT_FALLBACK = {
  message: 'success',
  people: [
    { name: 'Oleg Kononenko',      craft: 'ISS' },
    { name: 'Nikolai Chub',        craft: 'ISS' },
    { name: 'Tracy Dyson',         craft: 'ISS' },
    { name: 'Matthew Dominick',    craft: 'ISS' },
    { name: 'Michael Barratt',     craft: 'ISS' },
    { name: 'Jeanette Epps',       craft: 'ISS' },
    { name: 'Alexander Grebenkin', craft: 'ISS' },
  ],
  number: 7,
};

export async function fetchAstronauts() {
  try {
    const res = await axios.get(ASTRO_URL, { timeout: 8000 });
    if (res.data?.message === 'success') return res.data;
    return ASTRONAUT_FALLBACK;
  } catch {
    return ASTRONAUT_FALLBACK;
  }
}

/* ─── News ───────────────────────────────────────────────────────────────── */

export async function fetchNews(query = '') {
  const key = import.meta.env.VITE_NEWS_API_KEY;
  if (!key) return buildSampleNews();

  try {
    const res = await axios.get(NEWS_URL, {
      params: {
        apikey: key,
        language: 'en',
        category: 'technology,science',
        ...(query ? { q: query } : {}),
      },
      timeout: 12000,
    });
    if (res.data?.status === 'success' && res.data.results?.length) {
      return res.data;
    }
    return buildSampleNews();
  } catch {
    return buildSampleNews();
  }
}

function buildSampleNews() {
  const ago = (h) => new Date(Date.now() - h * 3_600_000).toISOString();
  return {
    status: 'success',
    results: [
      {
        title: 'NASA Astronauts Complete Spacewalk Outside ISS',
        source_id: 'nasa.gov', creator: ['NASA Press Office'],
        image_url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800',
        pubDate: ago(0),
        description: 'NASA astronauts conducted a 6-hour spacewalk to upgrade solar arrays on the ISS.',
        link: 'https://www.nasa.gov',
      },
      {
        title: "SpaceX Starship Completes Full Integrated Flight Test",
        source_id: 'spacex.com', creator: ['SpaceX Media'],
        image_url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=800',
        pubDate: ago(1),
        description: "SpaceX's Starship vehicle completed its most ambitious integrated flight test with a successful splashdown.",
        link: 'https://www.spacex.com',
      },
      {
        title: 'AI Breakthrough: New Model Outperforms Human Scientists',
        source_id: 'techcrunch', creator: ['TechCrunch Staff'],
        image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=800',
        pubDate: ago(2),
        description: 'Researchers reveal a new AI model capable of designing experiments and interpreting results autonomously.',
        link: 'https://techcrunch.com',
      },
      {
        title: 'James Webb Telescope Captures Deepest Infrared Image Yet',
        source_id: 'science.nasa.gov', creator: ['NASA Science'],
        image_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800',
        pubDate: ago(3),
        description: 'JWST released the deepest infrared image of the distant universe ever captured.',
        link: 'https://science.nasa.gov',
      },
      {
        title: 'China Launches New Space Station Module',
        source_id: 'xinhuanet', creator: ['Xinhua News'],
        image_url: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?q=80&w=800',
        pubDate: ago(4),
        description: 'China successfully launched a new module to its Tiangong space station, expanding crew capacity.',
        link: 'https://xinhuanet.com',
      },
      {
        title: 'OpenAI Releases GPT-5 with Multimodal Reasoning',
        source_id: 'theverge', creator: ['The Verge'],
        image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800',
        pubDate: ago(5),
        description: 'OpenAI unveils GPT-5, its most capable model yet, featuring advanced multimodal reasoning.',
        link: 'https://theverge.com',
      },
      {
        title: 'Mars Sample Return Mission Gets New Timeline',
        source_id: 'nasa.gov', creator: ['NASA JPL'],
        image_url: 'https://images.unsplash.com/photo-1614728263952-84ea256f9d1e?q=80&w=800',
        pubDate: ago(6),
        description: 'NASA and ESA finalize a revised plan to return Martian rock samples to Earth by 2040.',
        link: 'https://nasa.gov',
      },
      {
        title: 'New Exoplanet Found in Habitable Zone of Nearby Star',
        source_id: 'esa.int', creator: ['ESA Science'],
        image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
        pubDate: ago(7),
        description: 'Astronomers discovered a potentially Earth-like exoplanet orbiting just 12 light-years away.',
        link: 'https://esa.int',
      },
      {
        title: 'Quantum Computing Hits Milestone with 1000-Qubit Processor',
        source_id: 'ieee.org', creator: ['IEEE Spectrum'],
        image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800',
        pubDate: ago(8),
        description: 'IBM unveils a 1000-qubit quantum processor, marking a new era in quantum computing research.',
        link: 'https://ieee.org',
      },
      {
        title: 'Solar Storm Alert: ISS Crew Takes Shelter in Shielded Module',
        source_id: 'spaceweather', creator: ['SpaceWeather.com'],
        image_url: 'https://images.unsplash.com/photo-1504192010706-dd7f569ee2be?q=80&w=800',
        pubDate: ago(9),
        description: 'An X-class solar flare prompted the ISS crew to move to heavily shielded sections of the station.',
        link: 'https://spaceweather.com',
      },
    ],
  };
}

/* ─── AI (Qwen3-1.7B via HF Router) ─────────────────────────────────────── */

export async function queryAI(messages) {
  const token = import.meta.env.VITE_AI_TOKEN;
  const res = await axios.post(
    'https://router.huggingface.co/v1/chat/completions',
    {
      model: 'Qwen/Qwen3-1.7B:featherless-ai',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return res.data;
}
