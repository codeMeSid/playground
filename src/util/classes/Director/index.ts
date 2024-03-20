export interface BOARD_CONFIG {
  color: string;
  widthRatioToScreen: number;
  heightRatioToScreen: number;
  speed: number;
  fixed?: boolean;
}

export interface ASSET {
  x: number;
  y: number;
  color: string;
  draw: () => void;
  vx?: number;
  vy?: number;
  bodyTrail?: { x: number; y: number }[];
  dim?: { r?: number; w?: number; h?: number };
  update?: () => void;
}

export enum GAME_STATUS {
  READY = "ready",
  STARTED = "started",
  GAME_OVER = "game over",
}

export class Director {
  // declarations
  protected _canvasRef_: HTMLCanvasElement;
  protected _canvasCtx_: CanvasRenderingContext2D;
  protected _canvasBoardConfig_: BOARD_CONFIG;
  protected _gameStatus_: GAME_STATUS = GAME_STATUS.READY;
  private _lastPaintTime = 0;

  // constructor init config
  constructor(canvasRef: HTMLCanvasElement, boardConfig: BOARD_CONFIG) {
    // init properties
    this._canvasRef_ = canvasRef;
    this._canvasBoardConfig_ = boardConfig;
    // init board properties
    this._canvasBoardConfig_.color = (this._canvasBoardConfig_.color ??
      "#FF0000") as string;
    // init canvas properties
    this.resizeCanvas();
    this._canvasRef_.style.scale = "none";
    this._canvasRef_.style.borderRadius = "4px";
    // init canvas context
    this._canvasCtx_ = this._canvasRef_.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    // binding functions
    this.gameEngine = this.gameEngine.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.writeText = this.writeText.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    // functions
    if (!boardConfig.fixed)
      window.addEventListener("resize", this.resizeCanvas);
  }

  private resizeCanvas() {
    const canvasWidth = parseInt(
      (
        window.innerWidth *
        (this._canvasBoardConfig_.widthRatioToScreen / 100)
      ).toFixed(2)
    );
    const canvasHeight = parseInt(
      (
        window.innerHeight *
        (this._canvasBoardConfig_.heightRatioToScreen / 100)
      ).toFixed(2)
    );
    this._canvasRef_.width = canvasWidth;
    this._canvasRef_.height = canvasHeight;
  }

  protected gameEngine(
    drawGame: any,
    detectCollision: any,
    updateGame: any,
    currentTime = 0
  ) {
    window.requestAnimationFrame((ctime) => {
      this.gameEngine(drawGame, detectCollision, updateGame, ctime);
    });

    const paintTime = (currentTime - this._lastPaintTime) / 1000;
    const requiredPaintSpeed = 1 / this._canvasBoardConfig_.speed;
    if (paintTime < requiredPaintSpeed) return;
    this._lastPaintTime = currentTime as number;

    this._canvasCtx_.clearRect(
      0,
      0,
      this._canvasRef_.width,
      this._canvasRef_.height
    );
    drawGame();
    if (this._gameStatus_ === GAME_STATUS.STARTED) {
      detectCollision();
      updateGame();
    }
  }
  protected drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    boardColor: string
  ): void {
    this._canvasCtx_.beginPath();
    this._canvasCtx_.rect(x, y, w, h);
    this._canvasCtx_.fillStyle = boardColor;
    this._canvasCtx_.fill();
    this._canvasCtx_.closePath();
  }
  protected drawCircle(x: number, y: number, r: number, color: string): void {
    this._canvasCtx_.beginPath();
    this._canvasCtx_.arc(x, y, r, 0, 2 * Math.PI, false);
    this._canvasCtx_.fillStyle = color;
    this._canvasCtx_.fill();
    this._canvasCtx_.closePath();
  }
  protected writeText(
    text: string,
    x: number,
    y: number,
    color = "white",
    fontSize = 24
  ): void {
    this._canvasCtx_.font = `${fontSize}px oswald`;
    this._canvasCtx_.fillStyle = color;
    this._canvasCtx_.textAlign = "center";
    this._canvasCtx_.fillText(text, x, y);
  }
}
