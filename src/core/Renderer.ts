// src/core/Renderer.ts

import ChartEngine from "./ChartEngine";
import { Layer } from "./Layer";

export class Renderer {
  private layers: Map<string, Layer> = new Map();
  private resizeObserver: ResizeObserver;

  constructor(
    private container: HTMLElement,
    private engine: ChartEngine,
  ) {
    this.container.style.position = "relative";
    this.container.style.overflow = "hidden";

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.container);
  }

  public createLayer(id: string, zIndex: number): Layer {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = zIndex.toString();

    if (id !== "ui") {
      canvas.style.pointerEvents = "none";
    }

    this.container.appendChild(canvas);

    const layer = new Layer(canvas);
    this.layers.set(id, layer);

    this.engine.addRenderable(layer);

    this.resizeCanvas(layer.canvas, layer.ctx);

    return layer;
  }

  public getLayer(id: string): Layer | undefined {
    return this.layers.get(id);
  }

  private resizeCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ) {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
  }

  private handleResize = () => {
    this.layers.forEach((layer) => {
      this.resizeCanvas(layer.canvas, layer.ctx);
      layer.needsUpdate = true;
    });
  };

  public destroy() {
    this.resizeObserver.disconnect();
    this.layers.forEach((layer) => layer.canvas.remove());
    this.layers.clear();
  }
}
