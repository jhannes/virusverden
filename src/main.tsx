import { createRoot } from "react-dom/client";
import { Map, View } from "ol";

import "./application.css";
import "ol/ol.css";
import { useEffect, useRef } from "react";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";

useGeographic();

const map = new Map({
  view: new View({
    center: [0, 20],
    zoom: 2.5,
  }),
  layers: [new TileLayer({ source: new OSM() })],
});

function VirusWorldMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return <div ref={mapRef}></div>;
}

function Application() {
  function handleClick() {
    alert("Dette er spillet");
  }

  return (
    <>
      <header>
        <h1>Aleks sitt spill</h1>
      </header>
      <main>
        <VirusWorldMap />
      </main>
    </>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
