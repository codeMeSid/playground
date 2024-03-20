import { ASSET, BOARD_CONFIG, Director, GAME_STATUS } from ".";

export class SnakeDirector extends Director {
  // game stats
  private _SNAKE_SPEED_ = 1;
  private _score_: number;
  // assets
  private _board_: ASSET;
  private _walls_: ASSET;
  private _scoreboard_: ASSET;
  private _food_: ASSET;
  private _snake_: ASSET;
  // sound assets
  private snake_bg = new Audio("/assets/snake/snake_bg.mp3");
  private snake_score = new Audio("/assets/snake/snake_score.mp3");
  private snake_game_over = new Audio("/assets/snake/snake_game_over.mp3");

  constructor(canvasRef: HTMLCanvasElement, boardConfig: BOARD_CONFIG) {
    super(canvasRef, boardConfig);
    // init board
    this._board_ = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: boardConfig.color,
      dim: { h: this._canvasRef_.height, w: this._canvasRef_.width },
      draw: () => {
        this.drawRect(
          0,
          0,
          this._board_.dim?.w as number,
          this._board_.dim?.h as number,
          this._board_.color
        );
      },
    };
    // init walls
    this._walls_ = {
      x: 0,
      y: 20,
      vx: 0,
      vy: 0,
      color: "brown",
      dim: { r: 20 },
      draw: () => {
        // top wall
        this.drawRect(
          0,
          this._walls_.y,
          this._canvasRef_.width,
          this._walls_.dim?.r as number,
          this._walls_.color
        );
        // left wall
        this.drawRect(
          0,
          this._walls_.y,
          this._walls_.dim?.r as number,
          this._canvasRef_.height - this._walls_.y,
          this._walls_.color
        );
        // // bottom wall
        this.drawRect(
          0,
          this._canvasRef_.height - (this._walls_.dim?.r as number),
          this._canvasRef_.width,
          this._walls_.dim?.r as number,
          this._walls_.color
        );
        // // right wall
        this.drawRect(
          this._canvasRef_.width - (this._walls_.dim?.r as number),
          this._walls_.y,
          this._walls_.dim?.r as number,
          this._canvasRef_.height - this._walls_.y,
          this._walls_.color
        );
      },
    };
    // init score board
    this._score_ = 0;
    this._scoreboard_ = {
      x: 0,
      y: 0,
      color: "black",
      dim: { w: this._canvasRef_.width, h: 20 },
      draw: () => {
        this.drawRect(
          this._scoreboard_.x,
          this._scoreboard_.y,
          this._scoreboard_.dim?.w as number,
          this._scoreboard_.dim?.h as number,
          this._scoreboard_.color
        );
        switch (this._gameStatus_) {
          case GAME_STATUS.READY:
            this.writeText(
              "CLICK TO START",
              this._canvasRef_.width / 2,
              this._canvasRef_.height / 2,
              "white",
              36
            );
            break;
          case GAME_STATUS.STARTED:
            this.writeText(`SCORE: ${this._score_}`, 40, 15, "white", 18);
            break;
          case GAME_STATUS.GAME_OVER:
            this.writeText(
              "Game Over",
              this._canvasRef_.width / 2,
              this._canvasRef_.height / 2,
              "white",
              52
            );
            this.writeText(
              `Score: ${this._score_}`,
              this._canvasRef_.width / 2,
              this._canvasRef_.height / 2 + 40,
              "white",
              26
            );
            this.writeText(
              "Click To Start",
              this._canvasRef_.width / 2,
              this._canvasRef_.height / 2 + 90,
              "white",
              26
            );
            break;
        }
      },
    };
    // init food
    const init_food_coord = this.getRandomCoord();
    this._food_ = {
      x: init_food_coord.x,
      y: init_food_coord.y,
      color: "red",
      dim: { r: 20 },
      draw: () => {
        if (this._gameStatus_ === GAME_STATUS.STARTED)
          this.drawRect(
            this._food_.x,
            this._food_.y,
            this._food_.dim?.r as number,
            this._food_.dim?.r as number,
            this._food_.color
          );
      },
      update: () => {
        const newFoodCoord = this.getRandomCoord();
        this._food_.x = newFoodCoord.x;
        this._food_.y = newFoodCoord.y;
      },
    };
    // draw snake
    this._snake_ = {
      x: 0,
      y: 0,
      vx: this._SNAKE_SPEED_,
      vy: 0,
      dim: { r: 20 },
      color: "purple",
      bodyTrail: [
        { x: 60, y: 60 },
        { x: 40, y: 60 },
      ],
      draw: () => {
        if (this._gameStatus_ === GAME_STATUS.STARTED && this._snake_.bodyTrail)
          this._snake_.bodyTrail.forEach((sb) => {
            this.drawRect(
              sb.x,
              sb.y,
              this._snake_.dim?.r as number,
              this._snake_.dim?.r as number,
              this._snake_.color
            );
          });
      },
      update: () => {
        if (this._gameStatus_ !== GAME_STATUS.STARTED) return;
        if (!this._snake_.bodyTrail) return;
        for (let i = this._snake_.bodyTrail.length - 2; i >= 0; i--) {
          this._snake_.bodyTrail[i + 1] = { ...this._snake_.bodyTrail[i] };
        }
        this._snake_.bodyTrail[0].x +=
          (this._snake_.vx as number) * (this._snake_.dim?.r as number);
        this._snake_.bodyTrail[0].y +=
          (this._snake_.vy as number) * (this._snake_.dim?.r as number);
      },
    };
    // draw game
    this.getRandomCoord = this.getRandomCoord.bind(this);
    this.drawGame = this.drawGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.detectCollision = this.detectCollision.bind(this);
    this.onGameOver = this.onGameOver.bind(this);
    this.onGameReset = this.onGameReset.bind(this);
    this.gameEngine(this.drawGame, this.detectCollision, this.updateGame);
    // event handler
    window.addEventListener("keydown", (ev) => {
      if (ev.code === "Enter" || ev.code === "Space") {
        if (this._gameStatus_ === GAME_STATUS.GAME_OVER) {
          this.onGameReset();
        } else if (this._gameStatus_ === GAME_STATUS.READY) {
          this._gameStatus_ = GAME_STATUS.STARTED;
          this.snake_bg.play();
        }
      }
      switch (ev.code) {
        case "ArrowLeft":
          if (this._snake_.vx === 0) {
            this._snake_.vx = -this._SNAKE_SPEED_;
            this._snake_.vy = 0;
          }
          break;
        case "ArrowRight":
          if (this._snake_.vx === 0) {
            this._snake_.vx = this._SNAKE_SPEED_;
            this._snake_.vy = 0;
          }
          break;
        case "ArrowDown":
          if (this._snake_.vy === 0) {
            this._snake_.vy = this._SNAKE_SPEED_;
            this._snake_.vx = 0;
          }
          break;
        case "ArrowUp":
          if (this._snake_.vy === 0) {
            this._snake_.vy = -this._SNAKE_SPEED_;
            this._snake_.vx = 0;
          }
          break;
      }
    });
  }

  private drawGame() {
    // draw board
    this._board_.draw();
    // draw walls
    this._walls_.draw();
    // draw food
    this._food_.draw();
    // draw snake
    this._snake_.draw();
    // draw scoreboard
    this._scoreboard_.draw();
  }
  private getRandomCoord() {
    const maxX = this._canvasRef_.width - 2 * (this._walls_.dim?.r as number);
    const minX = 2 * (this._walls_.dim?.r as number);
    const minY = this._walls_.y + (this._walls_.dim?.r as number);
    const maxY = this._canvasRef_.height - 2 * (this._walls_.dim?.r as number);

    const xCount = Math.floor((maxX - minX) / 20 - 1);
    const yCount = Math.floor((maxY - minY) / 20 - 1);

    const randX = Math.floor(Math.random() * xCount) * 20;
    const randY = Math.floor(Math.random() * yCount) * 20;

    return {
      x: minX + randX,
      y: minY + randY,
    };
  }
  private updateGame() {
    if (this._gameStatus_ !== GAME_STATUS.STARTED) return;
    if (this._snake_.update) this._snake_.update();
  }
  private detectCollision() {
    if (this._gameStatus_ !== GAME_STATUS.STARTED) return;
    if (!this._snake_.bodyTrail) return;

    const snakeHead = this._snake_.bodyTrail[0];
    const leftWallX = 0;
    const rightWallX = this._canvasRef_.width - (this._walls_.dim?.r as number);
    const topWallY = this._walls_.y + (this._walls_.dim?.r as number);
    const bottomWallY =
      this._canvasRef_.height - 2 * (this._walls_.dim?.r as number);

    // snake colliding with wall
    if (
      snakeHead.x === leftWallX ||
      snakeHead.x >= rightWallX ||
      snakeHead.y <= topWallY ||
      snakeHead.y >= bottomWallY
    ) {
      this.onGameOver();
      return;
    }
    // snake colliding with food
    const foodX = this._food_.x;
    const foodY = this._food_.y;

    if (foodX === snakeHead.x && foodY === snakeHead.y && this._food_.update) {
      this.snake_score.play();
      this._snake_.bodyTrail.unshift({ x: foodX, y: foodY });
      this._food_.update();
      this._score_ += 1;
      if (this._score_ !== 0 && this._score_ % 5 === 0)
        this._canvasBoardConfig_.speed *= 2;
    }

    this.snake_bg.play();
  }
  private onGameOver() {
    this._snake_.bodyTrail = [
      { x: 60, y: 60 },
      { x: 40, y: 60 },
    ];
    this._snake_.vx = this._SNAKE_SPEED_;
    this._snake_.vy = 0;
    this._gameStatus_ = GAME_STATUS.GAME_OVER;
    this.snake_bg.pause();
    this.snake_game_over.play();
  }
  private onGameReset() {
    this._score_ = 0;
    this._gameStatus_ = GAME_STATUS.READY;
  }
}
