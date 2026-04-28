// src/interactions/WheelZoomInteraction.ts

import { Scale } from "../scales/Scale";
import { Layer } from "../core/Layer";

export class WheelZoomInteraction {
  private zoomSpeed = 0.1;

  constructor(
    private container: HTMLElement,
    private scaleY: Scale,
    private layer: Layer,
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

    const currentDomainMin = this.scaleY.domainMin;
    const currentDomainMax = this.scaleY.domainMax;

    const newMin = anchorDepth - (anchorDepth - currentDomainMin) * zoomFactor;
    const newMax = anchorDepth - (anchorDepth - currentDomainMax) * zoomFactor;

    this.scaleY.domainMin = newMin;
    this.scaleY.domainMax = newMax;

    this.layer.needsUpdate = true;
  };

  public destroy() {
    this.container.removeEventListener("wheel", this.onWheel);
  }
}
