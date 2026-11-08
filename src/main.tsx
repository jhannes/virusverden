import { createRoot } from "react-dom/client";
import { Feature, Map, MapBrowserEvent, Overlay, View } from "ol";

import "./application.css";
import "ol/ol.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGeographic } from "ol/proj.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Point } from "ol/geom.js";
import type { Coordinate } from "ol/coordinate.js";
import { Fill, Stroke, Style } from "ol/style.js";
import CircleStyle from "ol/style/Circle.js";

useGeographic();

let countryLayer = new VectorLayer({
  source: new VectorSource({
    url: "/geojson/verden.geojson",
    format: new GeoJSON(),
  }),
});
const map = new Map({
  view: new View({
    center: [0, 20],
    zoom: 2.5,
  }),
});
const overlay = new Overlay({
  positioning: "bottom-center",
});

function VirusForm({
  valgtLand,
  onSubmitVirus,
}: {
  valgtLand: Feature;
  onSubmitVirus(virusName: string): void;
}) {
  const [virusNavn, setVirusNavn] = useState("");

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    onSubmitVirus(virusNavn);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Virus i {valgtLand.getProperties().name}</h2>
      <h3>Hva skal viruset hete?</h3>

      <div>
        <input
          autoFocus={true}
          value={virusNavn}
          onChange={(e) => setVirusNavn(e.target.value)}
        />
      </div>
      <div>
        <button disabled={virusNavn.length === 0}>OK</button>
      </div>
    </form>
  );
}

function VirusWorldMap({
  onSubmitVirus,
  virusNavn,
}: {
  onSubmitVirus: (v: string) => void;
  virusNavn: string | undefined;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [fokusLand, setFokusLand] = useState<Feature>();
  const [valgtLand, setValgtLand] = useState<Feature>();
  const [smittePosisjon, setSmittePosisjon] = useState<Coordinate>();

  const smitteSource = useMemo(() => new VectorSource({}), []);
  const smitteLayer = useMemo(
    () =>
      new VectorLayer({
        source: smitteSource,
        style: (feature, resolution) => {
          console.log({ resolution });
          return new Style({
            image: new CircleStyle({
              stroke: new Stroke({ width: 2, color: "white" }),
              fill: new Fill({ color: "maroon" }),
              radius: 15000 / resolution,
            }),
          });
        },
      }),
    [smitteSource],
  );

  useEffect(() => {
    overlay.setElement(overlayRef.current!);

    map.setLayers([countryLayer, smitteLayer]);
    map.setTarget(mapRef.current!);
    map.on("pointermove", (e) => {
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
  function handleStartGame(e: MapBrowserEvent) {
    const features = map.getFeaturesAtPixel(e.pixel);
    if (features.length === 1) {
      setValgtLand(features[0] as Feature);
      setSmittePosisjon(e.coordinate);
      dialogRef.current!.showModal();
    } else {
      setValgtLand(undefined);
    }
  }
  useEffect(() => {
    if (!virusNavn || virusNavn?.length === 0) {
      map.on("click", handleStartGame);
    }
    return () => map.un("click", handleStartGame);
  }, [virusNavn]);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  function handleSubmitVirus(virusNavn: string) {
    dialogRef.current?.close();
    smitteSource.addFeature(
      new Feature({
        geometry: new Point(smittePosisjon!),
      }),
    );
    onSubmitVirus(virusNavn);
    setValgtLand(undefined);
  }

  return (
    <div ref={mapRef}>
      <div ref={overlayRef}>{fokusLand?.getProperties().name}</div>
      <dialog ref={dialogRef}>
        {valgtLand && (
          <VirusForm valgtLand={valgtLand} onSubmitVirus={handleSubmitVirus} />
        )}
      </dialog>
    </div>
  );
}

function VirusButton() {
  return (
    <button style={{ background: "transparent" }}>
      <img height={"80px"} width={"80px"} src="/icon/virus-icon.svg" />
    </button>
  );
}

function Application() {
  const [virusNavn, setVirusNavn] = useState<string>();

  return (
    <>
      <header>
        <h1>Aleks sitt spill</h1>
      </header>
      <main style={{ position: "relative" }}>
        <VirusWorldMap
          virusNavn={virusNavn}
          onSubmitVirus={(s) => setVirusNavn(s)}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "1em",
            display: "flex",
            gap: "1em",
          }}
        >
          <div>{virusNavn}</div>
          <button
            style={{
              background: "transparent",
              fontSize: "3rem",
            }}
          >
            ⚙️
          </button>
          <VirusButton />
        </div>
      </main>
    </>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
