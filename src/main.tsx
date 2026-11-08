import { createRoot } from "react-dom/client";
import { Feature, Map, Overlay, View } from "ol";

import "./application.css";
import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import { useGeographic } from "ol/proj.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";

useGeographic();

const map = new Map({
  view: new View({
    center: [0, 20],
    zoom: 2.5,
  }),
  layers: [
    new VectorLayer({
      source: new VectorSource({
        url: "/geojson/verden.geojson",
        format: new GeoJSON(),
      }),
    }),
  ],
});
const overlay = new Overlay({
  positioning: "bottom-center",
});

function VirusWorldMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [fokusLand, setFokusLand] = useState<Feature>();

  useEffect(() => {
    overlay.setElement(overlayRef.current!);

    map.setTarget(mapRef.current!);
    map.on("pointermove", (e) => {
      //map.getFeaturesAtPixel(e.pixel);
      const features = map.getFeaturesAtPixel(e.pixel);
      if (features.length === 1) {
        setFokusLand(features[0] as Feature);
        overlay.setPosition(e.coordinate);
      } else {
        setFokusLand(undefined);
        overlay.setPosition(undefined);
      }
    });
    map.addOverlay(overlay);
  }, []);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={mapRef}>
      <div ref={overlayRef}>{fokusLand?.getProperties().name}</div>
    </div>
  );
}

function VirusButton() {
  return (
    <button
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        padding: "1em",
        background: "transparent",
      }}
    >
      <img height={"80px"} width={"80px"} src="/icon/virus-icon.svg" />
    </button>
  );
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
      <main style={{ position: "relative" }}>
        <VirusWorldMap />
        <VirusButton />
      </main>
    </>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
