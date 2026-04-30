import { ICanvasDrawable } from "../core/@types/core.types";
import { Scale } from "../scales/Scale";
import { calculateNiceStep } from "../utils/niceStep";

export interface GridOptions {
  showHorizontalLines?: boolean;
  showYLabels?: boolean;
}

export class Grid implements ICanvasDrawable {
  constructor(
    private scales: { x: Scale; y: Scale },
    private options: GridOptions = {},
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const width = this.scales.x.rangeMax;
    const height = this.scales.y.rangeMax;

    const showHorizontal = this.options.showHorizontalLines ?? true;
    const showYLabels = this.options.showYLabels ?? true;

    ctx.save();
    ctx.strokeStyle = "#e0e0e0";
    ctx.fillStyle = "#888888";
    ctx.font = "12px sans-serif";
    ctx.lineWidth = 1;

    const xMin = this.scales.x.domainMin;
    const xMax = this.scales.x.domainMax;
    const xStep = calculateNiceStep(xMax - xMin, 5);
    const xStart = Math.ceil(xMin / xStep) * xStep;

    ctx.beginPath();
    for (let val = xStart; val <= xMax; val += xStep) {
      const xPix = this.scales.x.toPixel(val);
      ctx.moveTo(xPix, 0);
      ctx.lineTo(xPix, height);
      ctx.fillText(val.toFixed(1), xPix + 5, height - 10);
    }
    ctx.stroke();

    const yMin = Math.min(this.scales.y.domainMin, this.scales.y.domainMax);
    const yMax = Math.max(this.scales.y.domainMin, this.scales.y.domainMax);
    const yStep = calculateNiceStep(yMax - yMin, 10);
    const yStart = Math.ceil(yMin / yStep) * yStep;

    if (showHorizontal) {
      ctx.beginPath();
      for (let val = yStart; val <= yMax; val += yStep) {
        const yPix = this.scales.y.toPixel(val);
        ctx.moveTo(this.scales.x.rangeMin, yPix);
        ctx.lineTo(width, yPix);
      }
      ctx.stroke();
    }

    if (showYLabels) {
      for (let val = yStart; val <= yMax; val += yStep) {
        const yPix = this.scales.y.toPixel(val);
        ctx.fillText(val.toFixed(0), this.scales.x.rangeMin + 5, yPix - 5);
      }
    }

    ctx.restore();
  }
}
