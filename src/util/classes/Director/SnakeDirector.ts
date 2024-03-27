import { Director } from ".";
import { GameAsset, GameConfiguration, GameStatus } from "./types";

export class SnakeDirector extends Director {
  private board: GameAsset;
  private walls: GameAsset;
  private food: GameAsset;
  private snake: GameAsset;
  private scoreCard: GameAsset;
  private statusCard: GameAsset;
  constructor(ref: HTMLCanvasElement, config: Partial<GameConfiguration>) {
    super(ref, config);
    // create assets
    const boardHeight = this.getGameConfig("gameHeight");
    const boardWidth = this.getGameConfig("gameWidth");
    const cellSize = this.getGameConfig("cellSize");
    const scoreBoardHeight = cellSize * 2;
    this.board = this.createAsset({
      pos: { x: 0, y: 0 },
      color: "black",
      dim: { h: boardHeight, w: boardWidth, r: 0 },
      draw: () => {
        this.drawRect(
          this.board.pos.x,
          this.board.pos.y,
          this.board.dim.w,
          this.board.dim.h,
          this.board.color
        );
      },
    });
    this.walls = this.createAsset({
      pos: { x: 0, y: 20 },
      color: "brown",
      dim: { h: 0, w: 0, r: cellSize },
      draw: () => {
        // TOP WALL
        this.drawRect(
          0,
          scoreBoardHeight,
          boardWidth,
          this.walls.dim.r,
          this.walls.color
        );
        // LEFT WALL
        this.drawRect(
          0,
          scoreBoardHeight,
          cellSize,
          boardHeight - scoreBoardHeight,
          this.walls.color
        );
        // BOTTOM WALL
        this.drawRect(
          0,
          boardHeight - cellSize,
          boardWidth,
          cellSize,
          this.walls.color
        );
        // RIGHT WALL
        this.drawRect(
          boardWidth - cellSize,
          scoreBoardHeight,
          cellSize,
          boardHeight - scoreBoardHeight,
          this.walls.color
        );
      },
    });
    const initFoodPos = this.generateRandomCoord(
      cellSize,
      boardWidth - 2 * cellSize,
      scoreBoardHeight + 3 * cellSize,
      boardHeight - 2 * cellSize
    );
    this.food = this.createAsset({
      pos: Object.assign({}, initFoodPos),
      dim: { r: cellSize, w: 0, h: 0 },
      color: "red",
      draw: () => {
        this.drawRect(
          this.food.pos.x,
          this.food.pos.y,
          this.food.dim.r,
          this.food.dim.r,
          this.food.color
        );
      },
      update: () => {
        const newFoodPos = this.generateRandomCoord(
          cellSize,
          boardWidth - 2 * cellSize,
          scoreBoardHeight + 3 * cellSize,
          boardHeight - 2 * cellSize
        );
        this.food.pos = Object.assign({}, newFoodPos);
      },
    });
    this.snake = this.createAsset({
      pos: { x: 0, y: 0 },
      dim: { w: 0, h: 0, r: cellSize },
      spd: { x: 1, y: 0 },
      color: "blue",
      body: [
        { x: cellSize * 4, y: scoreBoardHeight + 2 * cellSize },
        { x: cellSize * 3, y: scoreBoardHeight + 2 * cellSize },
        { x: cellSize * 2, y: scoreBoardHeight + 2 * cellSize },
      ],
      draw: () => {
        this.snake.body.forEach((sBody) => {
          this.drawRect(
            sBody.x,
            sBody.y,
            this.snake.dim.r,
            this.snake.dim.r,
            this.snake.color
          );
        });
      },
      update: () => {
        for (let i = this.snake.body.length - 2; i >= 0; i--) {
          this.snake.body[i + 1] = Object.assign({}, this.snake.body[i]);
        }
        this.snake.body[0].x += this.snake.spd.x * this.snake.dim.r;
        this.snake.body[0].y += this.snake.spd.y * this.snake.dim.r;
      },
      reset: () => {
        this.snake.body = [
          { x: cellSize * 4, y: scoreBoardHeight + 2 * cellSize },
          { x: cellSize * 3, y: scoreBoardHeight + 2 * cellSize },
          { x: cellSize * 2, y: scoreBoardHeight + 2 * cellSize },
        ];
        this.snake.spd = { x: 1, y: 0 };
      },
    });
    this.scoreCard = this.createAsset({
      pos: { x: 0, y: 0 },
      dim: { w: boardWidth, h: scoreBoardHeight, r: 0 },
      color: "black",
      draw: () => {
        const score = this.getGameConfig("gameScore");
        this.drawRect(
          this.scoreCard.pos.x,
          this.scoreCard.pos.y,
          this.scoreCard.dim.w,
          this.scoreCard.dim.h,
          this.scoreCard.color
        );
        this.writeText(`SCORE: ${score}`, 40, 15, "white", 16);
      },
    });
    this.statusCard = this.createAsset({
      draw: () => {
        const gameStatus = this.getGameConfig("gameStatus");
        switch (gameStatus) {
          case GameStatus.GAME_READY:
            this.writeText(
              "START GAME",
              boardWidth / 2,
              boardHeight / 2 - 5 * cellSize,
              "white",
              56
            );
            this.writeText(
              "PRESS ENTER TO START",
              boardWidth / 2,
              boardHeight / 2,
              "white",
              16
            );
            break;
          case GameStatus.GAME_OVER:
            this.writeText(
              "GAME OVER",
              boardWidth / 2,
              boardHeight / 2 - 5 * cellSize,
              "white",
              56
            );
            this.writeText(
              "PRESS ENTER TO RESTART",
              boardWidth / 2,
              boardHeight / 2,
              "white",
              16
            );

            break;
        }
      },
    });
    this.startGameEngine(0);
  }
  protected drawFrame() {
    this.board.draw();
    this.walls.draw();
    this.food.draw();
    this.snake.draw();
    this.scoreCard.draw();
    this.statusCard.draw();
  }
  protected detectCollision() {
    const boardHeight = this.getGameConfig("gameHeight");
    const boardWidth = this.getGameConfig("gameWidth");
    const cellSize = this.getGameConfig("cellSize");
    const currentScore = this.getGameConfig("gameScore");
    const currentGameSpd = this.getGameConfig("gameSpeed");
    const scoreBoardHeight = cellSize * 2;
    const snakeHeadX = this.snake.body[0].x;
    const snakeHeadY = this.snake.body[0].y;
    const foodX = this.food.pos.x;
    const foodY = this.food.pos.y;

    // when snake collides with wall
    const leftWallX = 0;
    const rightWallX = boardWidth - cellSize;
    const topWallY = scoreBoardHeight;
    const bottomWall = boardHeight - cellSize;

    const hasSnakeHitWall =
      snakeHeadY === topWallY ||
      snakeHeadY === bottomWall ||
      snakeHeadX === leftWallX ||
      snakeHeadX === rightWallX;

    if (hasSnakeHitWall) this.gameOver();

    // when snake eats food
    const snakeHitFood = snakeHeadX === foodX && snakeHeadY === foodY;
    if (snakeHitFood) {
      this.snake.body.push({ x: foodX, y: foodY });
      this.food.update();
      this.updateGameConfig("gameScore", currentScore + 1);
      if ((currentScore + 1) % 5 === 0)
        this.updateGameConfig("gameSpeed", currentGameSpd * 2);
    }
  }
  protected updateGame() {
    this.snake.update();
  }
  protected gameOver() {
    this.stopDirector();
    this.statusCard.draw();
  }
  protected gameReset() {
    this.snake.reset();
    this.food.update();
    this.resetDirector();
  }
  protected gameKeyPressEvent(keyCode: string): void {
    const gameStatus = this.getGameConfig("gameStatus");
    const canStart =
      keyCode === "Enter" && gameStatus === GameStatus.GAME_READY;
    const canReset = keyCode === "Enter" && gameStatus === GameStatus.GAME_OVER;
    const canGoLeft =
      (keyCode === "ArrowLeft" || keyCode === "KeyA") && this.snake.spd.x !== 1;
    const canGoRight =
      (keyCode === "ArrowRight" || keyCode === "KeyD") &&
      this.snake.spd.x !== -1;
    const canGoUp =
      (keyCode === "ArrowUp" || keyCode === "KeyW") && this.snake.spd.y !== 1;
    const canGoDown =
      (keyCode === "ArrowDown" || keyCode === "KeyS") &&
      this.snake.spd.y !== -1;

    if (canStart) this.updateGameConfig("gameStatus", GameStatus.GAME_START);
    else if (canReset) this.gameReset();

    if (canGoLeft) {
      this.snake.spd.x = -1;
      this.snake.spd.y = 0;
    } else if (canGoRight) {
      this.snake.spd.x = 1;
      this.snake.spd.y = 0;
    } else if (canGoUp) {
      this.snake.spd.x = 0;
      this.snake.spd.y = -1;
    } else if (canGoDown) {
      this.snake.spd.x = 0;
      this.snake.spd.y = 1;
    }

    if (keyCode === "KeyF") this.food.update();
  }
}
