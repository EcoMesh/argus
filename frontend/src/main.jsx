import 'leaflet';
import { Suspense } from 'react';
import 'leaflet/dist/leaflet.css';
import ReactDOM from 'react-dom/client';
import 'leaflet-draw/dist/leaflet.draw.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // https://github.com/Leaflet/Leaflet.draw/issues/1026
import { RecoilRoot } from 'recoil';

import App from './app';

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
