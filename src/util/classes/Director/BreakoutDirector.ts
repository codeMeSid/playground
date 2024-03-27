import { Director } from ".";
import {
  GameAsset,
  GameAssetCoord,
  GameConfiguration,
  GameStatus,
} from "./types";

export class BreakoutDirector extends Director {
  // ASSETS
  private board!: GameAsset;
  private paddle!: GameAsset;
  private ball!: GameAsset;
  private brickWall!: GameAsset;
  private statusCard!: GameAsset;
  // GAME CONSTANTS
  private boardMinX!: number;
  private boardMaxX!: number;
  private boardMinY!: number;
  private boardMaxY!: number;
  private cellSize!: number;
  private paddleWidth!: number;
  private brickWidth!: number;
  // walls

  constructor(ref: HTMLCanvasElement, config: Partial<GameConfiguration>) {
    super(ref, config);
    // get config
    const boardHeight = this.getGameConfig("gameHeight");
    const boardWidth = this.getGameConfig("gameWidth");
    // set config
    this.cellSize = this.getGameConfig("cellSize");
    this.paddleWidth = this.cellSize * 10;
    this.brickWidth = this.cellSize * 5;
    this.boardMinX = 0;
    this.boardMinY = this.cellSize;
    this.boardMaxX = boardWidth - this.cellSize;
    this.boardMaxY = boardHeight - 2 * this.cellSize;
    // define assets
    // BRICKS
    this.brickWall = this.createAsset({
      dim: { h: this.cellSize, w: this.brickWidth, r: 0 },
      color: "rgb(0 0 124 / 75%)",
      body: this.generateBlockCoordinated(10),
      draw: () => {
        this.brickWall.body.forEach((brick) => {
          if (!(brick as any)?.wasHit)
            this.drawRect(
              brick.x,
              brick.y,
              this.brickWall.dim.w,
              this.brickWall.dim.h,
              this.brickWall.color
            );
        });
      },
      reset: () => {
        this.brickWall.body = this.generateBlockCoordinated();
      },
    });
    // STATUS BOARD
    this.statusCard = this.createAsset({
      draw: () => {
        const status = this.getGameConfig("gameStatus");
        switch (status) {
          case GameStatus.GAME_READY:
            this.writeText(
              "START GAME",
              boardWidth / 2,
              this.cellSize * 40,
              "rgb(255 0 0 / 50%)",
              52
            );
            this.writeText(
              "HIT SPACE TO START",
              boardWidth / 2,
              this.cellSize * 44,
              "rgb(255 0 0 / 50%)",
              18
            );
            break;
          case GameStatus.GAME_OVER:
            this.writeText(
              "GAME OVER",
              boardWidth / 2,
              this.cellSize * 40,
              "rgb(255 0 0 / 50%)",
              52
            );
            this.writeText(
              "HIT SPACE TO RESTART",
              boardWidth / 2,
              this.cellSize * 44,
              "rgb(255 0 0 / 50%)",
              18
            );
            break;
        }
      },
    });
    // BOARD
    this.board = this.createAsset({
      pos: { x: 0, y: 0 },
      color: "rgb(219 219 219 / 90%)",
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
    // PADDLES
    const initalPaddlePos: GameAssetCoord = {
      x: boardWidth / 2 - this.paddleWidth / 2,
      y: this.boardMaxY,
    };
    this.paddle = this.createAsset({
      pos: Object.assign({}, initalPaddlePos),
      dim: { w: this.paddleWidth, h: this.cellSize, r: 0 },
      color: "red",
      draw: () => {
        this.drawRect(
          this.paddle.pos.x,
          this.paddle.pos.y,
          this.paddle.dim.w,
          this.paddle.dim.h,
          this.paddle.color
        );
      },
      reset: () => {
        this.paddle.pos = Object.assign({}, initalPaddlePos);
      },
    });
    // BALL
    const initalBallPos: GameAssetCoord = {
      x: boardWidth / 2 - this.cellSize / 2,
      y: this.boardMaxY - this.cellSize,
    };
    this.ball = this.createAsset({
      pos: Object.assign({}, initalBallPos),
      dim: { r: this.cellSize, h: 0, w: 0 },
      spd: { x: 0, y: 0 },
      color: "yellow",
      draw: () => {
        this.drawRect(
          this.ball.pos.x,
          this.ball.pos.y,
          this.ball.dim.r,
          this.ball.dim.r,
          this.ball.color
        );
      },
      reset: () => {
        this.ball.pos = Object.assign({}, initalBallPos);
      },
      update: () => {
        this.ball.pos.x += (this.ball.spd.x * this.cellSize) / 2;
        this.ball.pos.y += (this.ball.spd.y * this.cellSize) / 2;
      },
    });
    // event
    this.startGameEngine(0);
  }

  protected drawFrame(): void {
    this.board.draw();
    this.brickWall.draw();
    this.paddle.draw();
    this.ball.draw();
    this.statusCard.draw();
  }
  protected detectCollision(): void {
    const ballPosX = this.ball.pos.x;
    const ballPosY = this.ball.pos.y;

    // ball collison with wall
    const ballHitRightWall = ballPosX === this.boardMaxX;
    const ballHitLeftWall = ballPosX === this.boardMinX;
    const ballHitTopWall = ballPosY === 0;

    if (ballHitLeftWall) this.ball.spd.x = 1;
    else if (ballHitRightWall) this.ball.spd.x = -1;
    else if (ballHitTopWall) this.ball.spd.y = 1;

    const ballHitPaddle =
      this.boardMaxY - this.cellSize === ballPosY &&
      ballPosX >= this.paddle.pos.x &&
      ballPosX < this.paddle.pos.x + this.paddle.dim.w;

    if (ballHitPaddle) this.ball.spd.y = -1;

    const ballHitBottomWall = ballPosY === this.boardMaxY;
    if (ballHitBottomWall) this.gameOver();

    // ball collison with bricks
    for (let i = 0; i < this.brickWall.body.length - 1; i++) {
      const brickMinX = this.brickWall.body[i].x;
      const brickMinY = this.brickWall.body[i].y;
      const brickMaxX = brickMinX + this.brickWidth;
      const brickMaxY = brickMinY + this.cellSize;

      const wasBrickHitFromBelow =
        ballPosX >= brickMinX &&
        ballPosX <= brickMaxX &&
        ballPosY === brickMaxY &&
        this.ball.spd.y === -1;
      const wasBrickHitFromAbove =
        ballPosX >= brickMinX &&
        ballPosX <= brickMaxX &&
        ballPosY === brickMinY + this.cellSize &&
        this.ball.spd.y === 1;
      const wasBrickHitFromLeft =
        ballPosY === brickMinY &&
        ballPosX === brickMinX - this.cellSize &&
        this.ball.spd.x === 1;
      const wasBrickHitFromRight =
        ballPosY === brickMinY &&
        ballPosX === brickMaxX &&
        this.ball.spd.x === -1;

      if (wasBrickHitFromBelow) {
        this.ball.spd.y = 1;
      } else if (wasBrickHitFromAbove) {
        this.ball.spd.y = -1;
      } else if (wasBrickHitFromLeft) {
        this.ball.spd.x = -1;
      } else if (wasBrickHitFromRight) {
        this.ball.spd.x = 1;
      }

      if (wasBrickHitFromAbove || wasBrickHitFromAbove)
        (this.brickWall.body[i] as any).wasHit = true;
    }
  }
  protected updateGame(): void {
    this.ball.update();
  }
  protected gameOver(): void {
    this.stopDirector();
    this.statusCard.draw();
  }
  protected gameReset(): void {
    this.paddle.reset();
    this.ball.reset();
    this.brickWall.reset();
    this.resetDirector();
  }
  protected gameKeyPressEvent(keyCode: string): void {
    // game game status
    const gameStatus = this.getGameConfig("gameStatus");
    const canStart =
      keyCode === "Space" && gameStatus === GameStatus.GAME_READY;
    const canReset = keyCode === "Space" && gameStatus === GameStatus.GAME_OVER;

    if (canStart) {
      this.updateGameConfig("gameStatus", GameStatus.GAME_START);
      this.ball.spd = { x: -1, y: -1 };
    } else if (canReset) this.gameReset();
    // paddle movement
    const boardWidth = this.getGameConfig("gameWidth");
    const canGoLeft =
      (keyCode === "ArrowLeft" || keyCode === "KeyA") &&
      this.paddle.pos.x > this.boardMinX;
    const canGoRight =
      (keyCode === "ArrowRight" || keyCode === "KeyD") &&
      this.paddle.pos.x < boardWidth - this.paddle.dim.w;

    if (canGoLeft) this.paddle.pos.x -= 2 * this.cellSize;
    else if (canGoRight) this.paddle.pos.x += 2 * this.cellSize;
    // ball movement
    if (this.ball.spd.x === 0 && this.ball.spd.y === 0) {
      if (canGoLeft) this.ball.pos.x -= 2 * this.cellSize;
      else if (canGoRight) this.ball.pos.x += 2 * this.cellSize;
    }
  }

  private generateBlockCoordinated(totalBricks = 50) {
    // constants
    const brickwall: { x: number; y: number; wasHit: boolean }[] = [];
    const boardWidth = this.getGameConfig("gameWidth");
    const brickWallDrawableWidth = boardWidth - 2 * this.cellSize;
    // iterable
    let rowX = 0;
    let colY = 0;

    while (totalBricks !== 0) {
      const newBrick = { x: 0, y: 0, wasHit: false };
      newBrick.y = (2 * rowX + 1) * this.cellSize;
      newBrick.x = colY * this.brickWidth + (colY + 1) * this.cellSize;
      if (newBrick.x + this.brickWidth > brickWallDrawableWidth) {
        rowX += 1;
        colY = 0;
      } else {
        brickwall.push(newBrick);
        colY += 1;
        totalBricks -= 1;
      }
    }

    return brickwall;
  }
}
