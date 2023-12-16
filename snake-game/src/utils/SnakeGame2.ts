import {
  GameAssets,
  GameDirector2,
  GameSettings,
  ScoringFunc,
} from "brain-module";

export class SnakeGame2 extends GameDirector2<["snake", "food"]> {
  protected _game_settings: GameSettings;
  protected _board: CanvasRenderingContext2D;
  protected _game_asset: GameAssets<["snake", "food"]>;

  constructor() {
    super();
    this._game_settings = {} as GameSettings;
    this._board = {} as CanvasRenderingContext2D;
    this._game_asset = {} as GameAssets<["snake", "food"]>;
  }

  _init_(boardRef: HTMLCanvasElement, scorer: ScoringFunc): void {
    throw new Error("Method not implemented.");
  }
  _start_(settings?: Partial<GameSettings> | undefined): void {
    throw new Error("Method not implemented.");
  }
  protected _handleInput_(ev: KeyboardEvent): void {
    throw new Error("Method not implemented.");
  }
  protected _checkGameOver_(): void {
    throw new Error("Method not implemented.");
  }
  protected _drawBoard_(): void {
    throw new Error("Method not implemented.");
  }
}
