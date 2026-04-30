import type { ICanvasDrawable } from "../core/@types/core.types";
import type { ICrosshairState } from "../interactions/CrosshairState";
import { Scale } from "../scales/Scale";

export interface CrosshairOptions {
  showYTooltip?: boolean;
  trackIndex?: number;
}

export class CrosshairDrawable implements ICanvasDrawable {
  constructor(
    private state: ICrosshairState,
    private scales: { x: Scale; y: Scale },
    private options: CrosshairOptions = {},
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    const { position } = this.state;
    if (!position) return;

    const { x, y } = position;
    const { x: sx, y: sy } = this.scales;
    const showY = this.options.showYTooltip ?? true;

    const inTrack = (this.options.trackIndex !== undefined && this.state.activeTrackIndex !== undefined)
      ? this.state.activeTrackIndex === this.options.trackIndex
      : x >= sx.rangeMin && x <= sx.rangeMax;

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(sx.rangeMin, y);
    ctx.lineTo(sx.rangeMax, y);
    ctx.stroke();

    if (inTrack) {
      ctx.beginPath();
      ctx.moveTo(x, sy.rangeMin);
      ctx.lineTo(x, sy.rangeMax);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    if (showY) {
      this.drawTooltip(ctx, sx.rangeMin, y, sy.toValue(y).toFixed(1), "left");
    }

    if (inTrack) {
      this.drawTooltip(ctx, x, sy.rangeMax, sx.toValue(x).toFixed(2), "bottom");
    }

    ctx.restore();
  }

  private drawTooltip(
    ctx: CanvasRenderingContext2D,
    anchorX: number,
    anchorY: number,
    text: string,
    side: "bottom" | "left",
  ): void {
    const PAD = 4;
    const H = 20;
    const { x: sx, y: sy } = this.scales;

    ctx.font = "11px sans-serif";
    const tw = ctx.measureText(text).width + PAD * 2;

    let rx: number, ry: number;
    if (side === "bottom") {
      rx = Math.min(Math.max(anchorX - tw / 2, sx.rangeMin), sx.rangeMax - tw);
      ry = anchorY - H;
    } else {
      rx = sx.rangeMin;
      ry = Math.min(Math.max(anchorY - H / 2, sy.rangeMin), sy.rangeMax - H);
    }

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(rx, ry, tw, H);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rx + PAD, ry + H / 2);
  }
}
