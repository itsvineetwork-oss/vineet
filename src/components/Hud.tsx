"use client";

import { useEffect, useState } from "react";
import { rooms } from "@/data/gallery";
import { useGallery } from "@/store";

export default function Hud() {
  const room = useGallery((s) => s.room);
  const hover = useGallery((s) => s.hover);
  const entered = useGallery((s) => s.entered);
  const locked = useGallery((s) => s.locked);
  const lockOK = useGallery((s) => s.lockOK);
  const active = useGallery((s) => s.active);
  const setEntered = useGallery((s) => s.setEntered);
  const requestGoTo = useGallery((s) => s.requestGoTo);
  const r = rooms[room];
  const [fine, setFine] = useState(true);
  useEffect(() => { setFine(matchMedia("(pointer: fine)").matches); }, []);
  const showPrompt = !entered || (fine && lockOK && !locked && !active);
  const dragMode = entered && (!fine || !lockOK);

  return (
    <>
      <div className="hud">
        <div className="bar">
          <div className="brand">Vineet<b>The Dimension Gallery</b></div>
          <div className="room">
            <div className="num">ROOM {String(room + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}</div>
            <div className="name">{r.name.split(" ").map((w, i) => (i === 0 ? <strong key={w}>{w} </strong> : <span key={w}>{w} </span>))}</div>
          </div>
        </div>
        <div />
        <div className="bottom">
          <div className="keys">
            <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>walk</span>
            <span><kbd>{dragMode ? "drag" : "mouse"}</kbd>look</span>
            <span><kbd>scroll</kbd>next room</span>
            <span><kbd>click</kbd>open artwork</span>
            <span><kbd>esc</kbd>release</span>
          </div>
          <div className="plan" aria-label="Rooms">
            {rooms.map((x) => (
              <button key={x.id} className={x.index === room ? "on" : ""} onClick={() => requestGoTo(x.index)} aria-label={x.name}>
                <span>{x.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {entered && locked && !active && <div className={`reticle${hover ? " hot" : ""}`} />}

      <div className="nav-touch">
        <button onClick={() => requestGoTo(room - 1)} aria-label="Previous room">↑</button>
        <button onClick={() => requestGoTo(room + 1)} aria-label="Next room">↓</button>
      </div>

      <div className={`enter${showPrompt ? "" : " hidden"}`} onClick={() => setEntered(true)}>
        <div className="card">
          <div className="eyebrow">AN ARCHITECTURAL PORTFOLIO</div>
          <h1>The <strong>Dimension</strong> Gallery</h1>
          <p>{entered ? "Click to continue walking." : "Six rooms. Walk through them, scroll to travel, click an artwork to open its case study."}</p>
          <span className="cta">{entered ? "Resume" : "Enter the gallery"}</span>
          <div className="hint">{fine ? "WASD to walk · mouse to look · scroll to travel" : "Drag to look · use the arrows to travel"}</div>
        </div>
      </div>
    </>
  );
}
