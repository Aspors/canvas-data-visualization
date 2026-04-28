import ChartEngine from "../src/core/ChartEngine";
import { Renderer } from "../src/core/Renderer";
import { DataManager, LogPoint } from "../src/data/DataManager";
import { Grid } from "../src/drawables/Grid";
import { VerticalCurveSeries } from "../src/drawables/VerticalCurveSeries";
import { WheelZoomInteraction } from "../src/interactions/WheelZoomInteraction";
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

const scaleX = new LinearScale(0, 100, 0, 400);

const scaleY = new LinearScale(-1000, -1100, 0, 800);

const engine = new ChartEngine();
const renderer = new Renderer(container, engine);

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
engine.startLoop();

new WheelZoomInteraction(container, scaleY, dataLayer);
