import {
  GameAssets,
  GameDirector2,
  GameSettings,
  ScoringFunc,
} from "brain-module";

export class SnakeGame2 extends GameDirector2<["snake", "food", "board"]> {
  protected _game_settings: GameSettings<["snake", "food", "board"]>;
  protected _board: CanvasRenderingContext2D;
  protected _game_asset: GameAssets<["snake", "food", "board"]>;
  protected _handleInput_(ev: KeyboardEvent | MouseEvent): void {
    throw new Error("Method not implemented.");
  }
  _init_(boardRef: HTMLCanvasElement, scorer: ScoringFunc): void {
    throw new Error("Method not implemented.");
  }
  _start_(
    settings?: Partial<GameSettings<["snake", "food", "board"]>> | undefined
  ): void {
    throw new Error("Method not implemented.");
  }
  _reset_(): void {
    throw new Error("Method not implemented.");
  }
  protected _drawBoard_(): void {
    throw new Error("Method not implemented.");
  }
  protected _checkGameStatus_(): void {
    throw new Error("Method not implemented.");
  }
  protected _checkGameOver_(): void {
    throw new Error("Method not implemented.");
  }
}
