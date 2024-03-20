"use client";
import { SnakeDirector } from "@/util/classes/Director/SnakeDirector";
import { useEffect, useRef } from "react";
import styles from "./style.module.css";

function SnakeGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let p = 0;
  useEffect(() => {
    if (canvasRef.current && p === 0) {
      p++;
      new SnakeDirector(canvasRef.current, {
        color: "darkgreen",
        widthRatioToScreen: 90,
        heightRatioToScreen: 90,
        speed: 10,
      });
    }
  }, [canvasRef, p]);

  return (
    <div className={styles.rootContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default SnakeGamePage;
