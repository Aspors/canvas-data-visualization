import type { ICanvasDrawable } from "../core/@types/core.types";
import { Scale } from "../scales/Scale";
import { calculateNiceStep } from "../utils/niceStep";

export interface DepthAxisOptions {
  width?: number;
  label?: string;
  textColor?: string;
  lineColor?: string;
  font?: string;
  format?: (depth: number) => string;
}

export class DepthAxis implements ICanvasDrawable {
  constructor(
    private scale: Scale,
    private options: DepthAxisOptions = {},
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = ctx.canvas.width / dpr;

    const yMin = Math.min(this.scale.domainMin, this.scale.domainMax);
    const yMax = Math.max(this.scale.domainMin, this.scale.domainMax);
    const step = calculateNiceStep(yMax - yMin, 10);
    const start = Math.ceil(yMin / step) * step;

    const lineColor = this.options.lineColor ?? "#e0e0e0";
    const textColor = this.options.textColor ?? "#888888";
    const font = this.options.font ?? "12px sans-serif";
    const format = this.options.format ?? ((v: number) => v.toFixed(0));

    ctx.save();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvasWidth - 0.5, this.scale.rangeMin);
    ctx.lineTo(canvasWidth - 0.5, this.scale.rangeMax);
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = font;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let val = start; val <= yMax; val += step) {
      const yPix = this.scale.toPixel(val);
      ctx.fillText(format(val), canvasWidth - 6, yPix);
    }

    ctx.restore();
  }
}
