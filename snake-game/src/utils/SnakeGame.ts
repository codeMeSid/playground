import {
  AssetPosition,
  GameDirector,
  GameSettings,
  ScoringFunc,
} from "brain-module";

export class SnakeGame extends GameDirector {
  private _snake_velocity: number;
  protected _game_settings: GameSettings;
  protected _game_asset_init_data: Record<string, AssetPosition>;
  protected _game_asset_postion: Record<string, AssetPosition>;
  protected _game_asset_velocity: Record<string, AssetPosition>;
  protected _board: CanvasRenderingContext2D;
  protected _scoring_func: ScoringFunc;
  private _snakeBody: Array<AssetPosition>;
  constructor() {
    super();
    this._snake_velocity = 1;
    this._board = undefined as any;
    this._scoring_func = undefined as any;
    this._game_settings = {
      fps: 20,
      cellSize: 25,
      boardColCount: 25,
      boardRowCount: 25,
      boardDepCount: 25,
      timerId: -1,
      boardColor: "black",
    };
    this._game_asset_init_data = {
      board: { x: 0, y: 0, z: 0 },
      food: this.randomAssetPosition(),
      snake: { x: 0, y: 0, z: 0 },
    };
    this._game_asset_postion = {
      ...this._game_asset_init_data,
    };
    this._game_asset_velocity = {
      snake: { x: 0, y: 0, z: 0 },
    };
    this._snakeBody = Array(1).fill(this._game_asset_postion["snake"]);
  }
  _init_(
    boardRef: HTMLCanvasElement,
    scorer?: ScoringFunc | undefined,
    settings?: Partial<GameSettings> | undefined,
  ): void {
    this._game_settings = {
      ...this._game_settings,
      ...(settings ? settings : {}),
    };
    boardRef.width = this._game_settings.boardColCount *
      this._game_settings.cellSize;
    boardRef.height = this._game_settings.boardRowCount *
      this._game_settings.cellSize;
    this._board = boardRef.getContext("2d") as CanvasRenderingContext2D;
    this._scoring_func = scorer as ScoringFunc;
    this._renderFood(true);
    this._start_();
  }
  _start_(updatedSettings?: Partial<GameSettings> | undefined): void {
    this._game_settings = {
      ...this._game_settings,
      ...(updatedSettings ? updatedSettings : {}),
    };
    window.addEventListener("keydown", this._handleInput_, false);
    this._game_settings.timerId = setInterval(
      () => {
        this.drawBoard();
        this._renderFood();
        this._renderSnake();
        this._gameOver_();
      },
      1000 / this._game_settings.fps,
    );
  }
  _reset_(): void {
    if (this._game_settings.timerId) clearInterval(this._game_settings.timerId);
    this._game_asset_postion["snake"] = this._game_asset_init_data["snake"];
    this._snakeBody = Array(1).fill(this._game_asset_postion["snake"]);
    this._game_asset_velocity["snake"] = { x: 0, y: 0, z: 0 };
    this._renderFood(true);
    if (this._scoring_func) {
      this._scoring_func("reset", 0);
    }
    this._remove_eventListeners();
    this._start_();
  }
  protected _gameOver_(): void {
    const snakeHeadPos = this._game_asset_postion["snake"];
    const boardWallRightPos = this._game_settings.cellSize *
      this._game_settings.boardColCount;
    const boardWallDownPos = this._game_settings.cellSize *
      this._game_settings.boardRowCount;
    if (
      snakeHeadPos.x < 0 || (snakeHeadPos.x === boardWallRightPos) ||
      (snakeHeadPos.y < 0) || (snakeHeadPos.y === boardWallDownPos)
    ) {
      this._reset_();
    }
  }
  protected drawBoard(): void {
    this.drawAsset(
      this._game_settings.boardColor,
      this._game_asset_postion["board"],
      {
        d: 0,
        h: this._game_settings.boardRowCount * this._game_settings.cellSize,
        w: this._game_settings.boardColCount * this._game_settings.cellSize,
      },
    );
  }
  protected _handleInput_(ev: KeyboardEvent) {
    switch (ev.code) {
      case "ArrowUp":
        this._game_asset_velocity["snake"].x = 0;
        this._game_asset_velocity["snake"].y = -1 * this._snake_velocity;
        break;
      case "ArrowDown":
        this._game_asset_velocity["snake"].x = 0;
        this._game_asset_velocity["snake"].y = this._snake_velocity;
        break;
      case "ArrowLeft":
        this._game_asset_velocity["snake"].x = -1 * this._snake_velocity;
        this._game_asset_velocity["snake"].y = 0;
        break;
      case "ArrowRight":
        this._game_asset_velocity["snake"].x = this._snake_velocity;
        this._game_asset_velocity["snake"].y = 0;
        break;
    }
  }
  private _renderFood = (newFood = false) => {
    if (newFood) this._game_asset_postion["food"] = this.randomAssetPosition();

    const foodPos = this._game_asset_postion["food"];
    const snakeHeadPos = this._game_asset_postion["snake"];

    if (foodPos.x === snakeHeadPos.x && foodPos.y === snakeHeadPos.y) {
      this._snakeBody.push(foodPos);
      this._renderFood(true);
      this._scoring_func("update", 1);
      return;
    }

    this.drawAsset("pink", foodPos, {
      h: this._game_settings.cellSize,
      d: this._game_settings.cellSize,
      w: this._game_settings.cellSize,
    });
  };
  private _renderSnake = () => {
    this._game_asset_postion["snake"] = {
      x: this._game_asset_postion["snake"].x +
        (this._game_asset_velocity["snake"].x * this._game_settings.cellSize),
      y: this._game_asset_postion["snake"].y +
        (this._game_asset_velocity["snake"].y * this._game_settings.cellSize),
      z: this._game_asset_postion["snake"].z +
        (this._game_asset_velocity["snake"].z * this._game_settings.cellSize),
    };

    for (let i = this._snakeBody.length - 1; i > 0; i--) {
      this._snakeBody[i] = this._snakeBody[i - 1];
    }

    if (this._snakeBody.length > 0) {
      this._snakeBody[0] = this._game_asset_postion["snake"];
    }

    this.drawAsset("darkred", this._game_asset_postion["snake"], {
      h: this._game_settings.cellSize,
      w: this._game_settings.cellSize,
      d: this._game_settings.cellSize,
    });

    this._snakeBody.forEach((sbPos) => {
      this.drawAsset("darkred", sbPos, {
        h: this._game_settings.cellSize,
        w: this._game_settings.cellSize,
        d: this._game_settings.cellSize,
      });
    });
  };
}
