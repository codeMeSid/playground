import React, { LegacyRef } from "react";

interface Props {
  boardRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
}

const GameBoard = (props: Props) => {
  const { boardRef } = props;
  return (
    <canvas
      style={{
        boxShadow: "2px 2px 24px rgba(0,0,0,0.5)",
        borderRadius: 16,
        marginTop: 24,
      }}
      ref={boardRef as LegacyRef<HTMLCanvasElement> | undefined}
    />
  );
};

export default GameBoard;
