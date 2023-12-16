import { Suspense, useEffect, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import GameControl from "./GameControl";
// import { SnakeGame } from "./utils/_SnakeGame";
import HighScoreBoard from "./HighScoreBoard";
import { SnakeGame } from "./utils/SnakeGame";

const App = () => {
  let game: SnakeGame = new SnakeGame();
  const canvasRef = useRef<HTMLCanvasElement>();
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState("");

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
    if (canvasRef.current) {
      game._init_(canvasRef.current, scoreUpdateListener, { fps: 10 }); //game.init(canvasRef.current, scoreUpdateListener);
    }
  }, [canvasRef]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 24 }}>Snake Park</div>
      <Suspense fallback={<h1>LOADING</h1>}>
        <GameBoard boardRef={canvasRef} />
        <GameControl
          triggerNewGame={game._reset_}
          score={score}
        />
        <HighScoreBoard />
      </Suspense>
    </div>
  );
};

export default App;
