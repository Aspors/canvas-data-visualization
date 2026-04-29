export interface IRenderable {
  render(): void;
}

export interface ICanvasDrawable {
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface IMarkDirty {
  needsUpdate: boolean;
}

export interface IPreparable {
  prepare(): void;
}
