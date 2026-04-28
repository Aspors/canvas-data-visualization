import { ICanvasDrawable } from "../core/@types/core.types";
import { Scale } from "../scales/Scale";

export class Grid implements ICanvasDrawable {
  constructor(private scales: { x: Scale; y: Scale }) {}

  private calculateStep(range: number, targetTicks: number): number {
    const roughStep = range / targetTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    let niceMultiplier = 1;
    if (normalized > 7.5) niceMultiplier = 10;
    else if (normalized > 3.5) niceMultiplier = 5;
    else if (normalized > 1.5) niceMultiplier = 2;

    return niceMultiplier * magnitude;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const width = this.scales.x.rangeMax;
    const height = this.scales.y.rangeMax;

    ctx.save();
    ctx.strokeStyle = "#e0e0e0";
    ctx.fillStyle = "#888888";
    ctx.font = "12px sans-serif";
    ctx.lineWidth = 1;

    const xMin = this.scales.x.domainMin;
    const xMax = this.scales.x.domainMax;

    const xStep = this.calculateStep(xMax - xMin, 5);

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

    const yStep = this.calculateStep(yMax - yMin, 10);

    const yStart = Math.ceil(yMin / yStep) * yStep;

    ctx.beginPath();
    for (let val = yStart; val <= yMax; val += yStep) {
      const yPix = this.scales.y.toPixel(val);

      ctx.moveTo(0, yPix);
      ctx.lineTo(width, yPix);

      ctx.fillText(val.toFixed(0), 5, yPix - 5);
    }
    ctx.stroke();

    ctx.restore();
  }
}
