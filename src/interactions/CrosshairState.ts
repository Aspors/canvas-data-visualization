export type CrosshairPosition = { x: number; y: number } | null;

export interface ICrosshairState {
  position: CrosshairPosition;
}

export class CrosshairState implements ICrosshairState {
  position: CrosshairPosition = null;
}
