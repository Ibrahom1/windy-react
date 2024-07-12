import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'mapbox-gl/dist/mapbox-gl.css';
import Mapbox from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Mapbox/>
  </React.StrictMode>
);
reportWebVitals();
