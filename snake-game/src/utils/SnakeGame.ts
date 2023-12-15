export class SnakeGame {
  // board
  private _board: CanvasRenderingContext2D | undefined;
  private _boardEngineId: number;
  // game physics
  private _fps: number;
  private _cell_size: number;
  private _board_rows: number;
  private _board_cols: number;
  private _gameVelocity: number;
  private _scoringFunc: any;

  // game entity  position
  private _foodCoord: Coord;
  private _snakeHeadCoord: Coord;
  private _snakeBodyCoords: Array<Coord>;
  private _snakeVelocity: Coord;

  constructor(
    settings: Settings = {},
  ) {
    const _settings = {
      fps: 30,
      cellSize: 25,
      board_col_count: 25,
      board_row_count: 25,
      ...settings,
    };
    this._boardEngineId = -1;
    this._gameVelocity = 1;
    this._fps = _settings.fps as number;
    this._cell_size = _settings.cellSize as number;
    this._board_rows = _settings.board_row_count as number;
    this._board_cols = _settings.board_col_count as number;
    this._foodCoord = { x: 0, y: 0 };
    this._snakeHeadCoord = {
      x: ((this._cell_size * this._board_cols) - this._cell_size) / 2,
      y: ((this._cell_size * this._board_rows) - this._cell_size) / 2,
    };
    this._snakeVelocity = { x: 0, y: 0 };
    this._snakeBodyCoords = Array(1).fill(this._snakeHeadCoord);
    window.addEventListener("keydown", this._changeSnakeDirection);
  }

  public init = (boardRef: HTMLCanvasElement, scoringFunc: any) => {
    boardRef.width = this._board_cols * this._cell_size;
    boardRef.height = this._board_rows * this._cell_size;
    this._board = boardRef.getContext("2d") as CanvasRenderingContext2D;
    this._scoringFunc = scoringFunc;
    // draw food
    this._generateFoodRandomly(true);
    // start game
    this._startGame();
  };

  private _startGame() {
    this._boardEngineId = setInterval(() => {
      // draw board and its walls
      this._drawBoard();
      this._generateFoodRandomly();
      // draw snake
      this._drawSnakeBody();
    }, 1000 / this._fps);
  }

  public resetGame = () => {
    if (this._boardEngineId !== -1) clearInterval(this._boardEngineId);
    this._snakeHeadCoord = {
      x: ((this._cell_size * this._board_cols) - this._cell_size) / 2,
      y: ((this._cell_size * this._board_rows) - this._cell_size) / 2,
    };
    this._snakeBodyCoords = Array(1).fill(this._snakeHeadCoord);
    this._snakeVelocity = { x: 0, y: 0 };
    this._scoringFunc("reset");
    this._generateFoodRandomly(true);
  };

  private _changeSnakeDirection = (ev: KeyboardEvent) => {
    switch (ev.code) {
      case "ArrowUp":
        if (this._snakeVelocity.y === this._gameVelocity) return;
        this._snakeVelocity = { x: 0, y: -1 * this._gameVelocity };
        break;

      case "ArrowDown":
        if (this._snakeVelocity.y === -1 * this._gameVelocity) return;
        this._snakeVelocity = { x: 0, y: this._gameVelocity };
        break;

      case "ArrowLeft":
        if (this._snakeVelocity.x === this._gameVelocity) return;
        this._snakeVelocity = { x: -1 * this._gameVelocity, y: 0 };
        break;

      case "ArrowRight":
        if (this._snakeVelocity.x === -1 * this._gameVelocity) return;
        this._snakeVelocity = { x: this._gameVelocity, y: 0 };
        break;
    }
  };

  private _drawSnakeBody = () => {
    this._snakeHeadCoord = {
      x: this._snakeHeadCoord.x + (this._snakeVelocity.x * this._cell_size),
      y: this._snakeHeadCoord.y + (this._snakeVelocity.y * this._cell_size),
    };

    if (
      this._snakeHeadCoord.x < 0 ||
      (this._snakeHeadCoord.x >= this._board_cols * this._cell_size) ||
      (this._snakeHeadCoord.y < 0) ||
      (this._snakeHeadCoord.y >= this._board_rows * this._cell_size)
    ) this.resetGame();

    for (let i = this._snakeBodyCoords.length - 1; i >= 0; i--) {
      this._snakeBodyCoords[i] = this._snakeBodyCoords[i - 1];
    }

    if (this._snakeBodyCoords.length > 0) {
      this._snakeBodyCoords[0] = this._snakeHeadCoord;
    }

    this._drawOnCanvas("blue", this._snakeHeadCoord, {
      w: this._cell_size,
      h: this._cell_size,
    });
    this._snakeBodyCoords.forEach((sbC) => {
      this._drawOnCanvas("blue", sbC, {
        w: this._cell_size,
        h: this._cell_size,
      });
    });
  };

  private _drawBoard = () => {
    // draw grass ground
    this._drawOnCanvas("green", { x: 0, y: 0 }, {
      w: this._board_cols * this._cell_size,
      h: this._board_rows * this._cell_size,
    });
  };

  private _generateFoodRandomly = (isNew: boolean = false) => {
    if (isNew) {
      let foodX = Math.floor(Math.random() * this._board_cols) *
        this._cell_size;
      let foodY = Math.floor(Math.random() * this._board_rows) *
        this._cell_size;
      this._foodCoord = { x: foodX, y: foodY };
    }

    if (
      this._snakeHeadCoord.x === this._foodCoord.x &&
      this._snakeHeadCoord.y === this._foodCoord.y
    ) {
      this._snakeBodyCoords.push({ ...this._foodCoord });
      this._generateFoodRandomly(true);
      this._scoringFunc("add", 1);
    } else {
      this._drawOnCanvas("darkred", this._foodCoord, {
        h: this._cell_size,
        w: this._cell_size,
      });
    }
  };

  private _drawOnCanvas = (
    color: string,
    position: Coord,
    dimension: Dimension,
  ) => {
    if (!this._board) {
      console.log("Drawing Error");
      return;
    }
    this._board.fillStyle = color;
    this._board.beginPath();
    this._board.roundRect(
      position.x,
      position.y,
      dimension.w,
      dimension.h,
      16,
    );
    this._board.stroke();
    this._board.fill();
  };
}
