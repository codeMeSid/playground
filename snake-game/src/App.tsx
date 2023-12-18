import { Suspense, useEffect, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import GameControl from "./GameControl";
import { SnakeGame2 } from "./utils/SnakeGame2";

const game2 = new SnakeGame2();

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [score, setScore] = useState(0);

  const scoreUpdateListener = (ev: string, val: number) => {
    switch (ev) {
      case "update":
        setScore((pS) => pS + val);
        break;
      case "reset":
        setScore(0);
        break;
    }
  };

  useEffect(() => {
    if (canvasRef.current) game2._init_(canvasRef.current, scoreUpdateListener);
  }, [canvasRef]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 24 }}>Snake Park</div>
      <Suspense fallback={<h1>LOADING</h1>}>
        <GameBoard boardRef={canvasRef} />
        <GameControl
          triggerNewGame={game2._start_}
          score={score}
        />
      </Suspense>
    </div>
  );
};

export default App;
