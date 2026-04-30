import { DataManager, LogPoint } from "../src/data/DataManager";
import { WellLogChart } from "../src/WellLogChart";

const container = document.getElementById("chart-container");
if (!container) throw new Error("Container not found");

const dm1 = new DataManager();
const dm2 = new DataManager();
const dm3 = new DataManager();

let v = 50;
const data1: LogPoint[] = [];
const data2: LogPoint[] = [];
const data3: LogPoint[] = [];

for (let i = 0; i < 100000; i++) {
  const depth = -1000 - i * 0.01;
  v += (Math.random() - 0.5) * 5;
  data1.push([depth, v]);
  v += (Math.random() - 0.5) * 5;
  data2.push([depth, v]);
}
// Sparse scatter data: one point every ~100 depth units
for (let i = 0; i < 200; i++) {
  const depth = -1000 - i * 5;
  v += (Math.random() - 0.5) * 20;
  data3.push([depth, Math.max(0, Math.min(1, (v % 100) / 100))]);
}

dm1.setData(data1);
dm2.setData(data2);
dm3.setData(data3);

const chart = new WellLogChart(container, { trackGap: 8 })
  .addTrack(dm1,      { name: "GR",      color: "#5b9bd5" })
  .addTrack(dm2,      { name: "DT",      color: "#70ad47" })
  .addScatterTrack(dm3, { name: "SW_CORE", color: "#e060b0", radius: 4 })
  .enableDepthAxis()
  .enableCrosshair()
  .enableZoom({ minSpan: 10 })
  .start();

// Mount header above the chart
const wrapper = document.createElement("div");
wrapper.className = "chart-wrapper";
container.parentElement!.insertBefore(wrapper, container);
wrapper.appendChild(chart.createHeaderElement());
wrapper.appendChild(container);
