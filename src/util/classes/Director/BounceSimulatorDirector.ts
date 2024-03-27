import { Director } from ".";
import {
  GameAsset,
  GameAssetCoord,
  GameConfiguration,
  GameStatus,
} from "./types";

export class BounceSimulatorDirector extends Director {
  private board!: GameAsset;
  private parentCircle!: GameAsset;
  private childCircle!: GameAsset;
  private lines!: GameAsset;
  private ballSpeed!: number;
  //   private points!: GameAssetCoord[];
  constructor(ref: HTMLCanvasElement, config: Partial<GameConfiguration>) {
    super(ref, config);
    this.ballSpeed = 10;
    // get config
    const boardHeight = this.getGameConfig("gameHeight");
    const boardWidth = this.getGameConfig("gameWidth");
    // board
    this.board = this.createAsset({
      pos: { x: 0, y: 0 },
      color: "rgb(219 219 219 / 10%)",
      dim: { w: boardWidth, h: boardHeight, r: 0 },
      draw: () => {
        this.drawRect(
          this.board.pos.x,
          this.board.pos.y,
          boardWidth,
          boardHeight,
          this.board.color
        );
      },
    });
    this.parentCircle = this.createAsset({
      pos: { x: boardWidth / 2, y: boardHeight / 2 },
      dim: { r: 400, w: 0, h: 0 },
      color: "rgb(255 0 0 / 100%)",
      draw: () => {
        this.drawCircle(
          this.parentCircle.pos.x,
          this.parentCircle.pos.y,
          this.parentCircle.dim.r,
          this.parentCircle.color,
          true
        );
      },
    });
    this.childCircle = this.createAsset({
      pos: {
        x: boardWidth / 2,
        y: boardHeight / 2 - this.parentCircle.dim.r / 1.1,
      },
      dim: { r: 10, w: 0, h: 0 },
      spd: { x: this.ballSpeed, y: this.ballSpeed },
      color: "rgb(0 0 255 / 100%)",
      draw: () => {
        this.drawCircle(
          this.childCircle.pos.x,
          this.childCircle.pos.y,
          this.childCircle.dim.r,
          this.childCircle.color
        );
      },
      update: () => {
        this.childCircle.pos.x += this.childCircle.spd.x;
        this.childCircle.pos.y += this.childCircle.spd.y;
        this.childCircle.spd.y *= 0.99;
        this.childCircle.spd.y += 0.25;
      },
    });
    this.lines = this.createAsset({
      body: [],
      draw: () => {
        this.lines.body.forEach((lb) => {
          this.drawLine(
            lb.x,
            lb.y,
            this.childCircle.pos.x,
            this.childCircle.pos.y,
            "white"
          );
        });
      },
      reset: () => {
        this.lines.body = [];
      },
    });
    this.startGameEngine(0);
  }

  protected drawFrame(): void {
    this.board.draw();
    this.parentCircle.draw();
    this.lines.draw();
    this.childCircle.draw();
  }
  protected detectCollision(): void {
    const parentX = this.parentCircle.pos.x;
    const parentY = this.parentCircle.pos.y;
    const childX = this.childCircle.pos.x;
    const childY = this.childCircle.pos.y;

    const collisonCircleRadius =
      this.parentCircle.dim.r - this.childCircle.dim.r;

    const dx = Math.pow(parentX - childX, 2);
    const dy = Math.pow(parentY - childY, 2);
    const seperationDistance = Math.round(Math.sqrt(dx + dy));

    if (seperationDistance >= collisonCircleRadius) {
      if (childY < parentY || childY > parentY)
        this.childCircle.spd.y = -this.childCircle.spd.y;

      if (childX < parentX || childX > parentX)
        this.childCircle.spd.x = -this.childCircle.spd.x;

      // Calculate New Point
      //   const diffX = parentX - childX;
      //   const diffY = parentY - childY;
      const diffRatio = this.parentCircle.dim.r / this.parentCircle.dim.r;
      this.lines.body.push({
        x: (1 - diffRatio) * parentX + diffRatio * childX,
        y: (1 - diffRatio) * parentY + diffRatio * childY,
      });
    }
  }

  protected updateGame(): void {
    this.childCircle.update();
  }
  protected gameOver(): void {}
  protected gameReset(): void {}
  protected gameKeyPressEvent(keyCode: string): void {
    if (keyCode === "Space")
      this.updateGameConfig("gameStatus", GameStatus.GAME_START);
  }
}
