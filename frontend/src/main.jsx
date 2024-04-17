import L from 'leaflet';
import { Suspense } from 'react';
import 'leaflet/dist/leaflet.css';
import ReactDOM from 'react-dom/client';
import 'leaflet-draw/dist/leaflet.draw.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // https://github.com/Leaflet/Leaflet.draw/issues/1026
import { RecoilRoot } from 'recoil';

import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import icon from 'leaflet/dist/images/marker-icon.png';

import App from './app';

// ensures that icons are loaded in the production build
// src: https://stackoverflow.com/a/51222271
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

window.type = '';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <RecoilRoot>
      <BrowserRouter>
        <Suspense>
          <App />
        </Suspense>
      </BrowserRouter>
    </RecoilRoot>
  </HelmetProvider>
);
