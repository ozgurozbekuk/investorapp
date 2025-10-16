"use client";
import React from "react";
import LaserFlow from "../LaserFlow";
import { useRef } from "react";

const Hero = () => {
  const revealImgRef = useRef(null);

  return (
       
      <div
      style={{
        position: "relative",
        backgroundColor: "#060010",
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty("--mx", `${x}px`);
          el.style.setProperty("--my", `${y + rect.height * 0.5}px`);
        }
      }}
      onMouseLeave={() => {
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty("--mx", "-9999px");
          el.style.setProperty("--my", "-9999px");
        }
      }}
    >
     
      
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <h1 className="absolute font-bold left-[20%] top-[30%] text-6xl text-white">
          Coming soon!
        </h1>
        <LaserFlow
          horizontalBeamOffset={0.11}
          verticalBeamOffset={-0.5}
          color="rgba(150,156,232,1)"
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "45%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "100vh",
          backgroundColor: "#060010",
          borderRadius: "20px",
          border: "3px solid rgba(150,156,232,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "2rem",
          zIndex: 6,
        }}
      >
        <img src="/3Dportfolio.png" alt="Container img" />
      </div>

      <img
        ref={revealImgRef}
        src="/3Dportfolio.png"
        alt="Reveal effect"
        style={{
          position: "absolute",
          width: "100%",
          top: "-10%",
          zIndex: 5,
          mixBlendMode: "lighten",
          opacity: 0.5,
          pointerEvents: "none",
          "--mx": "-9999px",
          "--my": "-9999px",
          WebkitMaskImage:
            "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)",
          maskImage:
            "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
    </div>    
  );
};

export default Hero;
