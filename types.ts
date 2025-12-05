export interface Note {
  key: string;
  triggerKeys: string[];
  note: string;
  frequency: number;
  type: 'white' | 'black';
  idx: number;
  miningOp: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
  size: number;
  char?: string;
}

export enum GameState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
}

export interface Vision {
  id: string;
  text: string;
  timestamp: number;
}

export interface MiningLog {
  id: string;
  op: string;
  hash: string;
  timestamp: number;
  status: 'SUCCESS' | 'VALIDATING' | 'BROADCASTING';
}