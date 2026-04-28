import { IRenderable } from "./@types/core.types";

export default class ChartEngine {
  private renderables: IRenderable[] = [];
  private loopId: number = 0;
  private isDestroyed: boolean = false;

  public addRenderable(target: IRenderable) {
    this.renderables.push(target);
  }

  public startLoop = () => {
    if (this.isDestroyed) return;

    this.renderables.forEach((target) => target.render());

    this.loopId = requestAnimationFrame(this.startLoop);
  };

  destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.loopId);
  }
}
