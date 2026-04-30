import type { ICanvasDrawable, IPreparable } from "../core/@types/core.types";
import type { DataManager } from "../data/DataManager";
import { Scale } from "../scales/Scale";

export interface ScatterSeriesOptions {
  color?: string;
  radius?: number;
}

export class ScatterSeries implements ICanvasDrawable, IPreparable {
  private lastViewMin = NaN;
  private lastViewMax = NaN;

  constructor(
    private dataManager: DataManager,
    private scales: { x: Scale; y: Scale },
    private options: ScatterSeriesOptions = {},
  ) {}

  public invalidateCache(): void {
    this.lastViewMin = NaN;
    this.lastViewMax = NaN;
  }

  public prepare(): void {
    const { y: sy } = this.scales;
    const viewMin = sy.toValue(sy.rangeMin);
    const viewMax = sy.toValue(sy.rangeMax);
    if (viewMin === this.lastViewMin && viewMax === this.lastViewMax) return;
    this.lastViewMin = viewMin;
    this.lastViewMax = viewMax;
    this.updateXDomain();
  }

  private updateXDomain(): void {
    const { x: sx } = this.scales;
    const [minD, maxD] = this.viewDepthRange();
    const points = this.dataManager.getVisibleData(minD, maxD);
    if (points.length === 0) return;

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const p of points) {
      if (p[1] < minVal) minVal = p[1];
      if (p[1] > maxVal) maxVal = p[1];
    }

    const range = maxVal - minVal || 1;
    const padding = range * 0.1;
    sx.domainMin = minVal - padding;
    sx.domainMax = maxVal + padding;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const { x: sx, y: sy } = this.scales;
    const [minD, maxD] = this.viewDepthRange();
    const points = this.dataManager.getVisibleData(minD, maxD);
    if (points.length === 0) return;

    const radius = this.options.radius ?? 4;

    ctx.save();
    ctx.fillStyle = this.options.color ?? "#e060b0";
    ctx.beginPath();

    for (const [depth, value] of points) {
      const xPix = sx.toPixel(value);
      const yPix = sy.toPixel(depth);
      ctx.moveTo(xPix + radius, yPix);
      ctx.arc(xPix, yPix, radius, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.restore();
  }

  private viewDepthRange(): [number, number] {
    const { y: sy } = this.scales;
    const a = sy.toValue(sy.rangeMin);
    const b = sy.toValue(sy.rangeMax);
    return [Math.min(a, b), Math.max(a, b)];
  }
}
