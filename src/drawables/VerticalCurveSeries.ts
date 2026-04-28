import { ICanvasDrawable } from "../core/@types/core.types";
import type { DataManager } from "../data/DataManager";
import { Scale } from "../scales/Scale";

export class VerticalCurveSeries implements ICanvasDrawable {
  constructor(
    private dataManager: DataManager,
    private scales: { x: Scale; y: Scale },
    private options: { color: string; lineWidth?: number },
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const viewMinDepth = this.scales.y.toValue(this.scales.y.rangeMin);
    const viewMaxDepth = this.scales.y.toValue(this.scales.y.rangeMax);

    const minD = Math.min(viewMinDepth, viewMaxDepth);
    const maxD = Math.max(viewMinDepth, viewMaxDepth);

    const points = this.dataManager.getVisibleData(minD, maxD);

    if (points.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = this.options.color;
    ctx.lineWidth = this.options.lineWidth || 1.5;
    ctx.lineJoin = "round";

    for (let i = 0; i < points.length; i++) {
      const xPix = this.scales.x.toPixel(points[i][0]);
      const yPix = this.scales.y.toPixel(points[i][1]);

      if (i === 0) {
        ctx.moveTo(xPix, yPix);
      } else {
        ctx.lineTo(xPix, yPix);
      }
    }

    ctx.stroke();
  }
}
