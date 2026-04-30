import ChartEngine from "./core/ChartEngine";
import { Layer } from "./core/Layer";
import { Renderer } from "./core/Renderer";
import { DataManager } from "./data/DataManager";
import { CrosshairDrawable } from "./drawables/Crosshair";
import { DepthAxis, DepthAxisOptions } from "./drawables/DepthAxis";
import { Grid } from "./drawables/Grid";
import { ScatterSeries, ScatterSeriesOptions } from "./drawables/ScatterSeries";
import { VerticalCurveSeries } from "./drawables/VerticalCurveSeries";
import { CrosshairInteraction } from "./interactions/CrosshairInteraction";
import { CrosshairState } from "./interactions/CrosshairState";
import { WheelZoomInteraction } from "./interactions/WheelZoomInteraction";
import { LinearScale, Scale } from "./scales/Scale";

export interface WellLogChartOptions {
  trackGap?: number;
}

export interface WellLogTrackOptions {
  color?: string;
  lineWidth?: number;
  name?: string;
}

export interface WellLogScatterTrackOptions extends ScatterSeriesOptions {
  name?: string;
}

export interface WellLogZoomOptions {
  minSpan?: number;
  maxSpan?: number;
}

export class WellLogTrack {
  constructor(
    readonly scaleX: Scale,
    readonly scaleY: Scale,
    readonly name: string = "",
  ) {}
}

export class WellLogChart {
  readonly engine: ChartEngine;

  private readonly wrapperEl: HTMLDivElement;
  private readonly scaleY: LinearScale;
  private readonly trackGap: number;

  private readonly tracks: WellLogTrack[] = [];
  private readonly trackEls: HTMLDivElement[] = [];
  private readonly trackRenderers: Renderer[] = [];
  private readonly bgLayers: Layer[] = [];
  private readonly dataLayers: Layer[] = [];
  private readonly uiLayers: Layer[] = [];
  private readonly trackMeta: Array<{ dm: DataManager; name: string }> = [];

  private crosshairState: CrosshairState | null = null;
  private readonly crosshairInteractions: CrosshairInteraction[] = [];

  private zoomInteraction: WheelZoomInteraction | null = null;
  private pendingZoomOptions: WellLogZoomOptions | null = null;

  private axisEl: HTMLDivElement | null = null;
  private axisRenderer: Renderer | null = null;
  private pendingDepthAxisOptions: DepthAxisOptions | null = null;
  private axisWidth = 0;

  constructor(container: HTMLElement, options: WellLogChartOptions = {}) {
    this.trackGap = options.trackGap ?? 0;
    this.scaleY = new LinearScale(0, 1, 0, container.getBoundingClientRect().height);
    this.engine = new ChartEngine();

    this.wrapperEl = document.createElement("div");
    this.wrapperEl.style.cssText = [
      "display:flex",
      "height:100%",
      `gap:${this.trackGap}px`,
      "overflow:hidden",
    ].join(";");
    container.style.overflow = "hidden";
    container.appendChild(this.wrapperEl);
  }

  addTrack(dataManager: DataManager, options: WellLogTrackOptions = {}): this {
    const scaleX = this.addTrackCore(dataManager, options.name ?? "");
    this.dataLayers[this.dataLayers.length - 1].add(new VerticalCurveSeries(
      dataManager,
      { x: scaleX, y: this.scaleY },
      { color: options.color ?? "#b17be0", lineWidth: options.lineWidth },
    ));
    this.tracks.push(new WellLogTrack(scaleX, this.scaleY, options.name ?? ""));
    return this;
  }

  addScatterTrack(dataManager: DataManager, options: WellLogScatterTrackOptions = {}): this {
    const scaleX = this.addTrackCore(dataManager, options.name ?? "");
    this.dataLayers[this.dataLayers.length - 1].add(new ScatterSeries(
      dataManager,
      { x: scaleX, y: this.scaleY },
      { color: options.color, radius: options.radius },
    ));
    this.tracks.push(new WellLogTrack(scaleX, this.scaleY, options.name ?? ""));
    return this;
  }

  enableCrosshair(): this {
    this.crosshairState = new CrosshairState();
    this.tracks.forEach((track, i) => {
      this.uiLayers[i].add(new CrosshairDrawable(
        this.crosshairState!,
        { x: track.scaleX, y: this.scaleY },
        { showYTooltip: i === 0, trackIndex: i },
      ));
      this.crosshairInteractions.push(new CrosshairInteraction(
        this.trackEls[i],
        this.crosshairState!,
        this.uiLayers,
        i,
      ));
    });
    return this;
  }

  enableZoom(options: WellLogZoomOptions = {}): this {
    this.pendingZoomOptions = options;
    return this;
  }

  enableDepthAxis(options: DepthAxisOptions = {}): this {
    this.pendingDepthAxisOptions = options;
    this.axisWidth = options.width ?? 60;

    const axisEl = document.createElement("div");
    axisEl.style.cssText = [
      `width:${this.axisWidth}px`,
      "flex-shrink:0",
      "position:relative",
      "overflow:hidden",
    ].join(";");
    this.wrapperEl.prepend(axisEl);
    this.axisEl = axisEl;

    return this;
  }

  createHeaderElement(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.style.cssText = `display:flex; align-items:stretch; box-sizing:border-box; width:100%; gap:${this.trackGap}px;`;

    if (this.axisWidth > 0) {
      const axisCol = document.createElement("div");
      axisCol.style.cssText = [
        `width:${this.axisWidth}px`,
        "flex-shrink:0",
        "font-size:11px",
        "color:#888",
        "padding:6px 6px 6px 0",
        "text-align:right",
        "box-sizing:border-box",
      ].join(";");
      axisCol.textContent = this.pendingDepthAxisOptions?.label ?? "TVDSS, м";
      wrap.appendChild(axisCol);
    }

    const tracksWrap = document.createElement("div");
    tracksWrap.style.cssText = `flex:1; display:flex; gap:${this.trackGap}px;`;

    this.trackMeta.forEach(({ dm, name }) => {
      const cell = document.createElement("div");
      cell.style.cssText = [
        "flex:1",
        "text-align:center",
        "padding:6px 4px",
        "border-left:1px solid #e0e0e0",
        "box-sizing:border-box",
      ].join(";");

      const title = document.createElement("div");
      title.style.cssText = "font-weight:600; font-size:13px; margin-bottom:2px;";
      title.textContent = name;

      const range = dm.getValueRange();
      const subtitle = document.createElement("div");
      subtitle.style.cssText = "font-size:11px; color:#888;";
      subtitle.textContent = `${range.min.toFixed(2)} – ${range.max.toFixed(2)}`;

      cell.appendChild(title);
      cell.appendChild(subtitle);
      tracksWrap.appendChild(cell);
    });

    wrap.appendChild(tracksWrap);
    return wrap;
  }

  start(): this {
    if (this.pendingDepthAxisOptions !== null && this.axisEl) {
      this.axisRenderer = new Renderer(this.axisEl, this.engine);
      const axisLayer = this.axisRenderer.createLayer("axis", 0);
      axisLayer.add(new DepthAxis(this.scaleY, this.pendingDepthAxisOptions));
    }

    if (this.pendingZoomOptions !== null) {
      const fullSpan = Math.abs(this.scaleY.domainMax - this.scaleY.domainMin);
      const allLayers = [...this.bgLayers, ...this.dataLayers, ...this.uiLayers];
      this.zoomInteraction = new WheelZoomInteraction(
        this.wrapperEl,
        this.scaleY,
        allLayers,
        {
          minSpan: this.pendingZoomOptions.minSpan ?? fullSpan * 0.01,
          maxSpan: this.pendingZoomOptions.maxSpan ?? fullSpan,
        },
      );
    }

    this.engine.startLoop();
    return this;
  }

  destroy(): void {
    this.zoomInteraction?.destroy();
    this.crosshairInteractions.forEach((i) => i.destroy());
    this.trackRenderers.forEach((r) => r.destroy());
    this.axisRenderer?.destroy();
    this.engine.destroy();
  }

  private addTrackCore(dm: DataManager, name: string): LinearScale {
    const trackIndex = this.tracks.length;

    if (trackIndex === 0) {
      const { min: deepest, max: shallowest } = dm.getDepthRange();
      this.scaleY.domainMin = shallowest;
      this.scaleY.domainMax = deepest;
    }

    const trackEl = document.createElement("div");
    trackEl.style.cssText = "flex:1; position:relative; overflow:hidden; min-width:0;";
    this.wrapperEl.appendChild(trackEl);
    this.trackEls.push(trackEl);

    const scaleX = new LinearScale(0, 100, 0, 0);

    const renderer = new Renderer(trackEl, this.engine, (w, h) => {
      scaleX.rangeMax = w;
      this.scaleY.rangeMax = h;
    });

    const bgLayer   = renderer.createLayer("background", 0);
    const dataLayer = renderer.createLayer("data", 1);
    const uiLayer   = renderer.createLayer("ui", 2);

    this.trackRenderers.push(renderer);
    this.bgLayers.push(bgLayer);
    this.dataLayers.push(dataLayer);
    this.uiLayers.push(uiLayer);

    const hasAxis = this.axisWidth > 0;
    bgLayer.add(new Grid(
      { x: scaleX, y: this.scaleY },
      hasAxis ? { showYLabels: false } : {},
    ));

    if (this.crosshairState) {
      uiLayer.add(new CrosshairDrawable(
        this.crosshairState,
        { x: scaleX, y: this.scaleY },
        { showYTooltip: trackIndex === 0, trackIndex },
      ));
      this.crosshairInteractions.push(new CrosshairInteraction(
        trackEl, this.crosshairState, this.uiLayers, trackIndex,
      ));
    }

    this.trackMeta.push({ dm, name });
    return scaleX;
  }
}
