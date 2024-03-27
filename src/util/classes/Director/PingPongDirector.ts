import { Director } from ".";
import { GameAsset, GameConfiguration, GameStatus } from "./types";

export class PingPongDirector extends Director {
  // assets
  private scoreboard!: GameAsset;
  private board!: GameAsset;
  private ball!: GameAsset;
  private p1Paddle!: GameAsset;
  private p2Paddle!: GameAsset;
  private p1Score!: number;
  private p2Score!: number;
  // constants
  private paddleSize!: number;
  private paddleMoveBy!: number;
  private cellSize!: number;
  private ballSpeed!: number;

  constructor(ref: HTMLCanvasElement, config: Partial<GameConfiguration>) {
    super(ref, config);
    const boardWidth = this.getGameConfig("gameWidth");
    const boardHeight = this.getGameConfig("gameHeight");
    this.cellSize = this.getGameConfig("cellSize");
    this.p1Score = 0;
    this.p2Score = 0;
    this.paddleMoveBy = 20;
    this.ballSpeed = 5;
    this.paddleSize = this.cellSize * 10;
    this.scoreboard = this.createAsset({
      draw: () => {
        this.writeText(
          this.p1Score.toString(),
          boardWidth / 4,
          boardHeight / 2 + this.cellSize * 4,
          "rgb(255 255 255 / 30%)",
          124
        );
        this.writeText(
          this.p2Score.toString(),
          boardWidth * (3 / 4),
          boardHeight / 2 + this.cellSize * 4,
          "rgb(255 255 255 / 30%)",
          124
        );
      },
    });
    this.board = this.createAsset({
      pos: { x: 0, y: 0 },
      dim: { r: 0, h: boardHeight, w: boardWidth },
      color: "white",
      draw: () => {
        // border
        this.drawRect(
          this.board.pos.x,
          this.board.pos.y,
          this.board.dim.w,
          this.board.dim.h,
          this.board.color,
          true
        );
        // center line
        this.drawLine(
          this.board.pos.x + boardWidth / 2,
          0,
          this.board.pos.x + boardWidth / 2,
          boardHeight,
          "rgb(255 255 255 / 30%)"
        );
        // boundry line
        this.drawLine(
          1.5 * this.cellSize,
          0,
          1.5 * this.cellSize,
          boardHeight,
          "rgb(255 255 255 / 30%)"
        );
        this.drawLine(
          boardWidth - 1.5 * this.cellSize,
          0,
          boardWidth - 1.5 * this.cellSize,
          boardHeight,
          "rgb(255 255 255 / 30%)"
        );
        // center line ball
        this.drawCircle(
          boardWidth / 2,
          boardHeight / 2,
          50,
          "rgb(255 255 255 / 30%)",
          true
        );
      },
    });
    this.ball = this.createAsset({
      pos: { x: boardWidth / 2, y: boardHeight / 2 },
      spd: { x: this.ballSpeed, y: -this.ballSpeed },
      dim: { h: 0, w: 0, r: 10 },
      color: "yellow",
      draw: () => {
        this.drawCircle(
          this.ball.pos.x,
          this.ball.pos.y,
          this.ball.dim.r,
          this.ball.color,
          true
        );
      },
      update: () => {
        this.ball.pos.x += this.ball.spd.x;
        this.ball.pos.y += this.ball.spd.y;
      },
    });
    this.p1Paddle = this.createAsset({
      pos: { x: this.cellSize, y: boardHeight / 2 - this.paddleSize / 2 },
      dim: { h: this.paddleSize, w: this.cellSize, r: 0 },
      color: "rgb(255 0 0 / 50%)",
      draw: () => {
        this.drawRect(
          this.p1Paddle.pos.x,
          this.p1Paddle.pos.y,
          this.p1Paddle.dim.w,
          this.p1Paddle.dim.h,
          this.p1Paddle.color
        );
      },
    });
    this.p2Paddle = this.createAsset({
      pos: {
        x: boardWidth - 2 * this.cellSize,
        y: boardHeight / 2 - this.paddleSize / 2,
      },
      dim: { h: this.paddleSize, w: this.cellSize, r: 0 },
      color: "rgb(0 0 255 / 50%)",
      draw: () => {
        this.drawRect(
          this.p2Paddle.pos.x,
          this.p2Paddle.pos.y,
          this.p2Paddle.dim.w,
          this.p2Paddle.dim.h,
          this.p2Paddle.color
        );
      },
    });
    this.startGameEngine(0);
  }
  protected drawFrame(): void {
    this.scoreboard.draw();
    this.board.draw();
    this.ball.draw();
    this.p1Paddle.draw();
    this.p2Paddle.draw();
  }
  protected detectCollision(): void {
    const ballX = this.ball.pos.x;
    const ballY = this.ball.pos.y;
    const ballR = this.ball.dim.r;
    const p1X = this.p1Paddle.pos.x;
    const p1Y = this.p1Paddle.pos.y;
    const p2X = this.p2Paddle.pos.x;
    const p2Y = this.p2Paddle.pos.y;
    const paddleHeight = this.paddleSize;
    const paadleWidth = this.p1Paddle.dim.w;
    const boardWidth = this.board.dim.w;
    const boardHeight = this.board.dim.h;

    // wall collision
    const ballHitTopWall = ballY <= ballR;
    const ballHitBottomWall = ballY >= boardHeight - ballR;
    const ballHitLeftWall = ballX === ballR;
    const ballHitRightWall = ballX === boardWidth - ballR;

    if (ballHitTopWall || ballHitBottomWall) this.ball.spd.y = -this.ball.spd.y;
    else if (ballHitLeftWall || ballHitRightWall) {
      if (ballHitLeftWall) this.p2Score += 1;
      else if (ballHitRightWall) this.p1Score += 1;
      this.ball.spd.x = -this.ball.spd.x;
      this.updateGameConfig("gameSpeed", this.getGameConfig("gameSpeed") * 1.5);
    }

    // paddle P1 & P2 collision
    const ballHitByP1X = p1X === ballX - ballR - paadleWidth;
    const ballHitByP1Y = ballY >= p1Y && ballY <= p1Y + paddleHeight;
    const ballHitByP2X = p2X === ballX + ballR;
    const ballHitByP2Y = ballY >= p2Y && ballY <= p2Y + paddleHeight;

    if ((ballHitByP1X && ballHitByP1Y) || (ballHitByP2X && ballHitByP2Y))
      this.ball.spd.x = -this.ball.spd.x;
  }
  protected updateGame(): void {
    this.ball.update();
  }
  protected gameOver(): void {}
  protected gameReset(): void {}
  protected gameKeyPressEvent(keyCode: string): void {
    const gameStatus = this.getGameConfig("gameStatus");
    if (keyCode === "Space" && gameStatus !== GameStatus.GAME_START)
      this.updateGameConfig("gameStatus", GameStatus.GAME_START);

    if (gameStatus !== GameStatus.GAME_START) return;

    const p1PaddleY = this.p1Paddle.pos.y;
    const p2PaddleY = this.p2Paddle.pos.y;

    const hasReachedTop = this.cellSize / 2;
    const hasReachedBottom =
      this.board.dim.h - this.paddleSize - this.cellSize / 2;

    switch (keyCode) {
      case "KeyW":
        if (p1PaddleY <= hasReachedTop) return;
        this.p1Paddle.pos.y -= this.paddleMoveBy;
        break;
      case "KeyS":
        if (p1PaddleY >= hasReachedBottom) return;
        this.p1Paddle.pos.y += this.paddleMoveBy;
        break;
      case "ArrowUp":
        if (p2PaddleY <= hasReachedTop) return;
        this.p2Paddle.pos.y -= this.paddleMoveBy;
        break;
      case "ArrowDown":
        if (p2PaddleY >= hasReachedBottom) return;
        this.p2Paddle.pos.y += this.paddleMoveBy;
        break;
    }
  }
}
