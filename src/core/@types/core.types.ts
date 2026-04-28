export interface IRenderable {
  render(): void;
}

export interface ICanvasDrawable {
  draw(ctx: CanvasRenderingContext2D): void;
}
