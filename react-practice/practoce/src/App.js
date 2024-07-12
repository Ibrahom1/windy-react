import React, { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import Windy from './utils/windy';
import data from './gfs';

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5ncmtpIiwiYSI6ImNrc29yeHB2aDBieDEydXFoY240bXExcWoifQ.WS7GVtVGZb4xgHn9dleszQ';

export default function Mapbox() {
  const mapContainer = useRef(null);
  const canvasRef = useRef(null);
  const map = useRef(null);
  let windy = useRef(null);

  const resetWind = useCallback(() => {
    if (windy.current) {
      const { width, height } = map.current.getCanvas().getBoundingClientRect();
      const { north, south, west, east } = map.current.getBounds();
      const particleWidth = calculateParticleWidth(map.current.getZoom());

      windy.current.stop();
      windy.current.start(
        [[0, 0], [width, height]],
        width,
        height,
        [[west, south], [east, north]],
        { particleLineWidth: particleWidth }
      );
    }
  }, []);

  function calculateParticleWidth(zoomLevel) {
    let particleWidth = 0.8;
    if (zoomLevel > 2) particleWidth = 0.6;
    if (zoomLevel > 3) particleWidth = 0.4;
    if (zoomLevel > 4) particleWidth = 0.2;
    if (zoomLevel > 5) particleWidth = 0.07;
    if (zoomLevel > 6) particleWidth = 0.05;
    return particleWidth;
  }

  useEffect(() => {
    if (map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [69.3451, 30.3753],
      zoom: 5
    });

    map.current.on('load', () => {
      map.current.addSource("nationalBoundary", {
        type: "vector",
        scheme: "tms",
        tiles: ["http://172.18.1.187:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:National_Boundary@EPSG:900913@pbf/{z}/{x}/{y}.pbf"],
      });

      map.current.addLayer({
        id: "nationalBoundary",
        type: "line",
        source: "nationalBoundary",
        "source-layer": "National_Boundary",
        layout: {
          visibility: 'visible'
        },
        paint: {
          "line-opacity": 0.8,
          "line-color": "white",
          "line-width": 3,
        },
      });

      const timeoutId = setTimeout(() => {
        console.log('Code executed after 2 seconds');
        if (canvasRef.current) {
          windy.current = new Windy({ canvas: canvasRef.current, data: data });
          resetWind();
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    });

    map.current.on('resize', resetWind);
    map.current.on('move', resetWind);
    map.current.on('zoom', resetWind);

  }, [resetWind, canvasRef]);

  return (
    <div>
      <div ref={mapContainer} className="map-container" style={{ position: 'relative', height: '100vh' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}
