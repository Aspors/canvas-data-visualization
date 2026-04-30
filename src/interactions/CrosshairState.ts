export type CrosshairPosition = { x: number; y: number } | null;

export interface ICrosshairState {
  position: CrosshairPosition;
  activeTrackIndex?: number;
}

export class CrosshairState implements ICrosshairState {
  position: CrosshairPosition = null;
  activeTrackIndex = -1;
}
