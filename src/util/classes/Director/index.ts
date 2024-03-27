import {
  GameAsset,
  GameAssetCoord,
  GameAudioAction,
  GameAudioType,
  GameConfigurableType,
  GameConfiguration,
  GameStatus,
} from "./types";

export abstract class Director {
  // declations
  private _ref_!: HTMLCanvasElement;
  private _ctx_!: CanvasRenderingContext2D;
  private _config_!: GameConfiguration;
  private _status_!: GameStatus;
  // audio
  private _audio_!: Record<GameAudioType, HTMLAudioElement | null>;
  private _last_paint_time_!: number;
  private _game_score_!: number;
  private _cell_size_!: number;
  private _game_speed_!: number;
  private _game_animator_id_ = -1;
  // constructor
  constructor(ref: HTMLCanvasElement, config: Partial<GameConfiguration>) {
    // config
    this._config_ = config as GameConfiguration;
    this._config_.bgColor = this._config_?.bgColor ?? "#bdbdbd";
    this._config_.gameSpeed = this._config_?.gameSpeed ?? 30;
    this._config_.gameDimRatio = {
      r: 0,
      h: this._config_.gameDimRatio?.h ?? 90,
      w: this._config_.gameDimRatio?.w ?? 90,
    };
    this._config_.gameDimFixed = this._config_?.gameDimFixed ?? false;
    // initialize
    this._ref_ = ref;
    this._ctx_ = ref.getContext("2d") as CanvasRenderingContext2D;
    this._audio_ = { BG_AUDIO: null, GAME_OVER_AUDIO: null, MENU_AUDIO: null };
    this._status_ = GameStatus.GAME_READY;
    this._last_paint_time_ = 0;
    this._game_speed_ = this._config_.gameSpeed;
    this._game_score_ = 0;
    this._cell_size_ = 10;
    // context
    const gameDimension = this.getBoardDimension();
    this._ref_.width = gameDimension.w;
    this._ref_.height = gameDimension.h;
    // binding
    this.getBoardDimension = this.getBoardDimension.bind(this);
    this.setGameAudio = this.setGameAudio.bind(this);
    this.audioAction = this.audioAction.bind(this);
    this.updateGameConfig = this.updateGameConfig.bind(this);
    this.getGameConfig = this.getGameConfig.bind(this);
    this.gameEngine = this.gameEngine.bind(this);
    this.startGameEngine = this.startGameEngine.bind(this);
    this.clearGameBoard = this.clearGameBoard.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.writeText = this.writeText.bind(this);
    this.generateRandomCoord = this.generateRandomCoord.bind(this);
    this.stopGameEngine = this.stopGameEngine.bind(this);
    this.resetDirector = this.resetDirector.bind(this);
    this.stopDirector = this.stopDirector.bind(this);
    this.drawLine = this.drawLine.bind(this);
    // events
    if (!this._config_.gameDimFixed) {
      window.addEventListener("resize", () => {
        const gameDimension = this.getBoardDimension();
        this._ref_.width = gameDimension.w;
        this._ref_.height = gameDimension.h;
      });
    }
    window.addEventListener("keydown", (ev) => {
      if (this.gameKeyPressEvent) this.gameKeyPressEvent(ev.code);
    });
  }
  // protected functions
  protected createAsset(props: Partial<GameAsset>): GameAsset {
    return {
      body: props.body ?? [],
      color: props.color ?? "black",
      dim: props?.dim ?? { h: 10, r: 10, w: 10 },
      pos: props?.pos ?? { x: 0, y: 0 },
      spd: props?.spd ?? { x: 1, y: 1 },
      draw: props?.draw ?? function () {},
      reset: props?.reset ?? function () {},
      update: props?.update ?? function () {},
    };
  }
  protected setGameAudio(audioType: GameAudioType, audioSrc: string) {
    this._audio_ = { ...this._audio_, [audioType]: new Audio(audioSrc) };
  }
  protected audioAction(audioType: GameAudioType, type: GameAudioAction) {
    if (this._audio_[audioType]) this._audio_[audioType]?.[type]();
  }
  protected updateGameConfig(
    configKey: GameConfigurableType,
    updatedValue: any
  ) {
    if ((this._config_ as any)[configKey]) {
      this._config_ = Object.assign({}, this._config_, {
        [configKey]: updatedValue,
      });
      if (configKey === "gameSpeed")
        this._game_speed_ = this._config_.gameSpeed;
    } else
      switch (configKey) {
        case "gameScore":
          this._game_score_ = updatedValue;
          break;
        case "cellSize":
          this._cell_size_ = updatedValue;
          break;
        case "gameStatus":
          this._status_ = updatedValue;
      }
  }
  protected getGameConfig(configKey: GameConfigurableType) {
    let value;
    if ((this._config_ as any)[configKey])
      value = (this._config_ as any)[configKey] as any;
    else
      switch (configKey) {
        case "gameStatus":
          value = this._status_;
          break;
        case "gameHeight":
          value = this._ref_.height;
          break;
        case "gameWidth":
          value = this._ref_.width;
          break;
        case "gameScore":
          value = this._game_score_;
          break;
        case "cellSize":
          value = this._cell_size_;
          break;
      }
    return value;
  }
  protected startGameEngine(currentTime: number) {
    this._game_animator_id_ = window.requestAnimationFrame(
      this.startGameEngine
    );
    const paintTime = (currentTime - this._last_paint_time_) / 1000;
    const requiredPaintTime = 1 / this._game_speed_;
    if (paintTime < requiredPaintTime) return;
    this._last_paint_time_ = currentTime;
    this.gameEngine();
  }
  protected stopGameEngine() {
    if (this._game_animator_id_ !== -1)
      window.cancelAnimationFrame(this._game_animator_id_);
  }
  protected drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    noFill?: boolean
  ) {
    this._ctx_.fillStyle = color;
    if (noFill) this._ctx_.strokeRect(x, y, w, h);
    else this._ctx_.fillRect(x, y, w, h);
  }
  protected drawCircle(
    x: number,
    y: number,
    r: number,
    color: string,
    noFill = false
  ) {
    this._ctx_.beginPath();
    this._ctx_.arc(x, y, r, 0, 2 * Math.PI, false);
    if (noFill) {
      this._ctx_.strokeStyle = color;
      this._ctx_.stroke();
    } else {
      this._ctx_.fillStyle = color;
      this._ctx_.fill();
    }

    this._ctx_.closePath();
  }
  protected drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = "black"
  ) {
    this._ctx_.beginPath();
    this._ctx_.moveTo(x1, y1);
    this._ctx_.lineTo(x2, y2);
    this._ctx_.strokeStyle = color;
    this._ctx_.stroke();
  }
  protected writeText(
    text: string,
    x: number,
    y: number,
    color?: string,
    fontSize?: number
  ) {
    this._ctx_.font = `${fontSize ?? 24}px oswald`;
    this._ctx_.fillStyle = color ?? "white";
    this._ctx_.textAlign = "center";
    this._ctx_.fillText(text ?? "SOME TEXT", x, y);
  }
  protected generateRandomCoord(
    minX: number | null,
    maxX: number | null,
    minY: number | null,
    maxY: number | null
  ): GameAssetCoord {
    minX ??= 0;
    maxX ??= this._ref_.width;
    minY ??= 0;
    maxY ??= this._ref_.height;
    const xCount = (maxX - minX) / this._cell_size_ + 1;
    const yCount = (maxY - minY) / this._cell_size_ + 1;
    const randX = Math.round(Math.random() * xCount) * this._cell_size_;
    const randY = Math.round(Math.random() * yCount) * this._cell_size_;

    return { x: randX, y: randY };
  }
  protected resetDirector() {
    this._game_speed_ = this._config_.gameSpeed;
    this._game_score_ = 0;
    this._status_ = GameStatus.GAME_READY;
    this.startGameEngine(0);
  }
  protected stopDirector() {
    this._status_ = GameStatus.GAME_OVER;
    this.stopGameEngine();
  }
  // abstract functions
  protected abstract drawFrame(): void;
  protected abstract detectCollision(): void;
  protected abstract updateGame(): void;
  protected abstract gameOver(): void;
  protected abstract gameReset(): void;
  protected abstract gameKeyPressEvent(keyCode: string): void;
  // private functions
  private getBoardDimension() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const gameWidthRatio = this._config_.gameDimRatio.w;
    const gameHeightRatio = this._config_.gameDimRatio.h;
    const gameWidth = Math.floor((screenWidth * gameWidthRatio) / 1000) * 10;
    const gameHeight = Math.floor((screenHeight * gameHeightRatio) / 1000) * 10;
    return { h: gameHeight, w: gameWidth };
  }
  private clearGameBoard() {
    this._ctx_.clearRect(0, 0, this._ref_.width, this._ref_.height);
  }
  private gameEngine() {
    this.clearGameBoard();
    this.drawFrame();
    switch (this._status_) {
      case GameStatus.GAME_READY:
        if (
          this._audio_?.GAME_OVER_AUDIO &&
          !this._audio_?.GAME_OVER_AUDIO?.paused
        )
          this._audio_?.GAME_OVER_AUDIO?.pause();
        this._audio_?.MENU_AUDIO?.play();
        break;
      case GameStatus.GAME_START:
        if (this._audio_?.MENU_AUDIO && !this._audio_?.MENU_AUDIO?.paused)
          this._audio_?.MENU_AUDIO?.pause();
        this._audio_?.BG_AUDIO?.play();
        this.detectCollision();
        this.updateGame();
        break;
      case GameStatus.GAME_OVER:
        if (this._audio_?.BG_AUDIO && !this._audio_?.BG_AUDIO?.paused)
          this._audio_?.BG_AUDIO?.pause();
        this._audio_?.GAME_OVER_AUDIO?.play();
        break;
    }
  }
}
