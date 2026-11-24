"use client";

import dynamic from "next/dynamic";
import Hud from "./Hud";
import CaseStudy from "./CaseStudy";

const Experience = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => <div className="loading">BUILDING THE GALLERY</div>,
});

export default function Gallery() {
  return (
    <>
      <div className="stage">
        <Experience />
      </div>
      <Hud />
      <CaseStudy />
    </>
  );
}
