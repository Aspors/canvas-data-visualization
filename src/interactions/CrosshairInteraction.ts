import type { IMarkDirty } from "../core/@types/core.types";
import type { ICrosshairState } from "./CrosshairState";

export class CrosshairInteraction {
  constructor(
    private container: HTMLElement,
    private state: ICrosshairState,
    private layers: IMarkDirty[],
    private trackIndex?: number,
  ) {
    this.container.addEventListener("mousemove", this.onMouseMove);
    this.container.addEventListener("mouseleave", this.onMouseLeave);
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.container.getBoundingClientRect();
    this.state.position = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (this.trackIndex !== undefined) this.state.activeTrackIndex = this.trackIndex;
    this.layers.forEach((l) => { l.needsUpdate = true; });
  };

  private onMouseLeave = (): void => {
    if (this.trackIndex !== undefined) {
      queueMicrotask(() => {
        if (this.state.activeTrackIndex === this.trackIndex) {
          this.state.position = null;
          this.state.activeTrackIndex = -1;
          this.layers.forEach((l) => { l.needsUpdate = true; });
        }
      });
    } else {
      this.state.position = null;
      this.layers.forEach((l) => { l.needsUpdate = true; });
    }
  };

  public destroy(): void {
    this.container.removeEventListener("mousemove", this.onMouseMove);
    this.container.removeEventListener("mouseleave", this.onMouseLeave);
  }
}
