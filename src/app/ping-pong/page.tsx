"use client";
import { SnakeDirector } from "@/util/classes/Director/SnakeDirector";
import { useEffect, useRef } from "react";
import { BreakoutDirector } from "@/util/classes/Director/BreakoutDirector";
import styles from "./style.module.css";
import { PingPongDirector } from "@/util/classes/Director/PingPongDirector";

function PingPongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let p = 0;

  useEffect(() => {
    if (canvasRef.current && p === 0) {
      new PingPongDirector(canvasRef.current, {
        gameDimRatio: { h: 50, w: 90, r: 0 },
        gameSpeed: 100,
        gameDimFixed: true,
      });
      p++;
    }
  }, [canvasRef]);

  return (
    <div className={styles.rootContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default PingPongPage;
