type GameAssetDimension = { r: number; w: number; h: number };
export type GameAssetCoord = { x: number; y: number };
export type GameAudioType = keyof typeof GameAudio;
export type GameStatusType = keyof typeof GameStatus;
export type GameConfigurableType = keyof typeof GameConfigurable;
export type GameAudioAction = "play" | "pause";

export enum GameConfigurable {
  bgColor = "bgColor",
  gameSpeed = "gameSpeed",
  gameHeight = "gameHeight",
  gameWidth = "gameWidth",
  gameScore = "gameScore",
  cellSize = "cellSize",
}
export enum GameStatus {
  GAME_READY = "game_ready",
  GAME_START = "game_start",
  GAME_OVER = "game_over",
}
export enum GameAudio {
  MENU_AUDIO = "menu_audio",
  BG_AUDIO = "bg_audio",
  GAME_OVER_AUDIO = "game_over_audio",
}

export interface GameConfiguration {
  bgColor: string;
  gameDimRatio: GameAssetDimension;
  gameDimFixed: boolean;
  gameSpeed: number;
}
export interface GameAsset {
  pos: GameAssetCoord;
  spd: GameAssetCoord;
  dim: GameAssetDimension;
  color: string;
  body: Array<GameAssetCoord>;
  draw: () => void;
  update: () => void;
  reset: () => void;
}
