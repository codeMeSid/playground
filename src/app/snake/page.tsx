"use client";
import { SnakeDirector } from "@/util/classes/Director/SnakeDirector";
import { useCallback, useEffect, useRef } from "react";
import styles from "./style.module.css";

function SnakeGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let p = 0;

  useEffect(() => {
    if (canvasRef.current && p === 0) {
      new SnakeDirector(canvasRef.current, {});
      p++;
    }
  }, [canvasRef]);

  return (
    <div className={styles.rootContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default SnakeGamePage;
