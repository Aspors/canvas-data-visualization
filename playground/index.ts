import ChartEngine from "../src/core/ChartEngine";
import { Renderer } from "../src/core/Renderer";
import { DataManager, LogPoint } from "../src/data/DataManager";
import { Grid } from "../src/drawables/Grid";
import { VerticalCurveSeries } from "../src/drawables/VerticalCurveSeries";
import { WheelZoomInteraction } from "../src/interactions/WheelZoomInteraction";
import { CrosshairState } from "../src/interactions/CrosshairState";
import { CrosshairInteraction } from "../src/interactions/CrosshairInteraction";
import { CrosshairDrawable } from "../src/drawables/Crosshair";
import { LinearScale } from "../src/scales/Scale";

const container = document.getElementById("chart-container");
if (!container) throw new Error("Container not found");

const dataManager = new DataManager();
const mockData: LogPoint[] = [];
let currentValue = 50;

for (let i = 0; i < 100000; i++) {
  const depth = -1000 - i * 0.01;
  currentValue += (Math.random() - 0.5) * 5;
  mockData.push([depth, currentValue]);
}

dataManager.setData(mockData);

const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

const scaleX = new LinearScale(0, 100, 0, containerWidth);
const scaleY = new LinearScale(
  mockData[0][0],
  mockData[mockData.length - 1][0],
  0,
  containerHeight,
);

const engine = new ChartEngine();
const renderer = new Renderer(container, engine, (w, h) => {
  scaleX.rangeMax = w;
  scaleY.rangeMax = h;
});

const bgLayer = renderer.createLayer("background", 0);
const grid = new Grid({ x: scaleX, y: scaleY });
bgLayer.add(grid);

const dataLayer = renderer.createLayer("data", 1);
const curve = new VerticalCurveSeries(
  dataManager,
  { x: scaleX, y: scaleY },
  { color: "#b17be0" },
);
dataLayer.add(curve);

const uiLayer = renderer.createLayer("ui", 2);
const crosshairState = new CrosshairState();
uiLayer.add(new CrosshairDrawable(crosshairState, { x: scaleX, y: scaleY }));
new CrosshairInteraction(container, crosshairState, [uiLayer]);

engine.startLoop();

const fullDataSpan = mockData.length > 0
  ? Math.abs(mockData[mockData.length - 1][0] - mockData[0][0])
  : 1000;
new WheelZoomInteraction(container, scaleY, [bgLayer, dataLayer, uiLayer], {
  minSpan: 10,
  maxSpan: fullDataSpan,
});
