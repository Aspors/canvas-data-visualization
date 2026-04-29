import { ICanvasDrawable, IPreparable, IRenderable } from "./@types/core.types";

function isPreparable(d: ICanvasDrawable): d is ICanvasDrawable & IPreparable {
  return "prepare" in d;
}

export class Layer implements IRenderable {
  public needsUpdate: boolean = true;
  private drawables: ICanvasDrawable[] = [];
  public ctx: CanvasRenderingContext2D;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = this.canvas.getContext("2d")!;
  }

  public add(drawable: ICanvasDrawable) {
    this.drawables.push(drawable);
    this.needsUpdate = true;
  }

  public render(): void {
    if (!this.needsUpdate) return;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.drawables.forEach((d) => {
      if (isPreparable(d)) d.prepare();
      d.draw(this.ctx);
    });

    this.needsUpdate = false;
  }
}
