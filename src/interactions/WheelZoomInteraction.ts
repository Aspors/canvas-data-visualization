import { Scale } from "../scales/Scale";
import type { IMarkDirty } from "../core/@types/core.types";

export interface ZoomOptions {
  minSpan?: number;
  maxSpan?: number;
}

export class WheelZoomInteraction {
  private zoomSpeed = 0.1;

  constructor(
    private container: HTMLElement,
    private scaleY: Scale,
    private layers: IMarkDirty[],
    private options: ZoomOptions = {},
  ) {
    this.attachEvents();
  }

  private attachEvents() {
    this.container.addEventListener("wheel", this.onWheel, { passive: false });
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();

    const rect = this.container.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    const anchorDepth = this.scaleY.toValue(mouseY);

    const zoomFactor = e.deltaY > 0 ? 1 + this.zoomSpeed : 1 - this.zoomSpeed;

    const newMin = anchorDepth - (anchorDepth - this.scaleY.domainMin) * zoomFactor;
    const newMax = anchorDepth - (anchorDepth - this.scaleY.domainMax) * zoomFactor;

    const newSpan = Math.abs(newMax - newMin);
    if (newSpan < (this.options.minSpan ?? 1e-10)) return;
    if (this.options.maxSpan !== undefined && newSpan > this.options.maxSpan) return;

    this.scaleY.domainMin = newMin;
    this.scaleY.domainMax = newMax;

    this.layers.forEach((layer) => { layer.needsUpdate = true; });
  };

  public destroy() {
    this.container.removeEventListener("wheel", this.onWheel);
  }
}
