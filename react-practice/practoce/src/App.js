import React, { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import Windy from './utils/windy';
import data from './gfs';

mapboxgl.accessToken = 'Token';

export default function Mapbox() {
  const mapContainer = useRef(null);
  const canvasRef = useRef(null);
  const map = useRef(null);
  let windy = useRef(null);

  // Helper function to calculate particle width based on zoom level
  function calculateParticleWidth(zoomLevel) {
    let particleWidth = 0.8;
    if (zoomLevel > 2) particleWidth = 0.6;
    if (zoomLevel > 3) particleWidth = 0.4;
    if (zoomLevel > 4) particleWidth = 0.2;
    if (zoomLevel > 5) particleWidth = 0.07;
    if (zoomLevel > 6) particleWidth = 0.05;
    return particleWidth;
  }

  // Function to reset the wind visualization
  const resetWind = useCallback(() => {
    if (windy.current) {
      const { width, height } = map.current.getCanvas().getBoundingClientRect();
      const bounds = map.current.getBounds();
      const { north, south, west, east } = bounds;

      console.log('Resetting wind with bounds:', bounds);

      if (north === undefined || south === undefined || west === undefined || east === undefined) {
        console.error('Bounds are undefined:', bounds);
        return;
      }

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

  // Initialize Mapbox map and set up event listeners
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

      // Initialize Windy after a delay to ensure map is fully loaded
      const timeoutId = setTimeout(() => {
        if (canvasRef.current) {
          windy.current = new Windy({ canvas: canvasRef.current, data: data });
          resetWind();
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    });

    // Set up event listeners for resizing, moving, and zooming the map
    map.current.on('resize', resetWind);
    map.current.on('move', resetWind);
    map.current.on('zoom', resetWind);

  }, [resetWind]);

  return (
    <div>
      <div ref={mapContainer} className="map-container" style={{ position: 'relative', height: '100vh' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}
