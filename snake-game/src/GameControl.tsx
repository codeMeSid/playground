interface Props {
  score: number;
  triggerNewGame: () => void;
}

const GameControl = (props: Props) => {
  const { score, triggerNewGame } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 24,
        columnGap: 8,
      }}
    >
      <button onClick={() => triggerNewGame()}>
        Start New Game
      </button>

      <div
        id="score"
        style={{
          height: 36,
          borderRadius: 12,
          width: 120,
          background: "darkslategrey",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Score: {score}
      </div>
    </div>
  );
};

export default GameControl;
