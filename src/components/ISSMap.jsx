import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom ISS Icon
const issIcon = L.divIcon({
  html: `<div style="
    background: linear-gradient(135deg, #6c63ff, #00d2ff);
    border: 3px solid white;
    border-radius: 50%;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(108,99,255,0.8), 0 0 40px rgba(0,210,255,0.4);
    animation: issMarkerPulse 2s ease-in-out infinite;
  ">🛸</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function ISSMap({ position, trajectory }) {
  const center = position ? [position.lat, position.lon] : [0, 0];
  const pathPoints = trajectory.map(p => [p.lat, p.lon]);

  return (
    <div style={{ height: '420px', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <MapUpdater center={center} />

        {/* Trajectory Polyline */}
        {pathPoints.length > 1 && (
          <Polyline
            positions={pathPoints}
            color="#6c63ff"
            weight={2}
            opacity={0.7}
            dashArray="6 4"
          />
        )}

        {/* ISS Marker */}
        {position && (
          <Marker position={[position.lat, position.lon]} icon={issIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: '#6c63ff' }}>🛸 ISS Position</div>
                <div>📍 Lat: <strong>{position.lat.toFixed(4)}°</strong></div>
                <div>📍 Lon: <strong>{position.lon.toFixed(4)}°</strong></div>
                <div>🚀 Speed: <strong>{position.speed?.toLocaleString()} km/h</strong></div>
                <div style={{ marginTop: 4, color: '#888', fontSize: 12 }}>{position.nearest}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
