"use client";
import { SnakeDirector } from "@/util/classes/Director/SnakeDirector";
import { useEffect, useRef } from "react";
import { BreakoutDirector } from "@/util/classes/Director/BreakoutDirector";
import styles from "./style.module.css";

function BreakoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let p = 0;

  useEffect(() => {
    if (canvasRef.current && p === 0) {
      new BreakoutDirector(canvasRef.current, {
        gameDimRatio: { h: 90, w: 50, r: 0 },
        gameSpeed: 100,
        // TODO: issue with game dim fix as it scales on percentage and not value
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

export default BreakoutPage;
