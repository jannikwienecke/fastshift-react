import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const cities = [
  { name: 'Berlin', position: [52.52, 13.405] },
  { name: 'Hamburg', position: [53.5511, 9.9937] },
  { name: 'Munich', position: [48.1351, 11.582] },
  { name: 'Cologne', position: [50.9375, 6.9603] },
  { name: 'Frankfurt', position: [50.1109, 8.6821] },
];

const MapPage = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        {cities.map((city, index) => (
          <Marker key={index} position={city.position}>
            <Popup>{city.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;