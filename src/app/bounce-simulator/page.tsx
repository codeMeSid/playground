"use client";
import { SnakeDirector } from "@/util/classes/Director/SnakeDirector";
import { useEffect, useRef } from "react";
import styles from "./style.module.css";
import { BounceSimulatorDirector } from "@/util/classes/Director/BounceSimulatorDirector";

function BounceSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let p = 0;

  useEffect(() => {
    if (canvasRef.current && p === 0) {
      new BounceSimulatorDirector(canvasRef.current, { gameSpeed: 5000 });
      p++;
    }
  }, [canvasRef]);

  return (
    <div className={styles.rootContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default BounceSimulator;
