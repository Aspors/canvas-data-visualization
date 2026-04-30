export type LogPoint = [depth: number, value: number];

const MAX_RENDER_POINTS = 4096;

export class DataManager {
  private rawBuffer: Float64Array = new Float64Array(0);
  private rawLength: number = 0;

  private valMin = 0;
  private valMax = 0;

  private renderBuffer = new Float64Array(MAX_RENDER_POINTS * 2);

  public setData(data: LogPoint[]): void {
    const sorted = [...data].sort((a, b) => a[0] - b[0]);
    this.rawLength = sorted.length;
    this.rawBuffer = new Float64Array(sorted.length * 2);

    let vMin = Infinity;
    let vMax = -Infinity;

    for (let i = 0; i < sorted.length; i++) {
      this.rawBuffer[i * 2]     = sorted[i][0];
      this.rawBuffer[i * 2 + 1] = sorted[i][1];
      if (sorted[i][1] < vMin) vMin = sorted[i][1];
      if (sorted[i][1] > vMax) vMax = sorted[i][1];
    }

    this.valMin = vMin === Infinity ? 0 : vMin;
    this.valMax = vMax === -Infinity ? 0 : vMax;
  }

  public getVisibleData(minDepth: number, maxDepth: number): LogPoint[] {
    if (this.rawLength === 0) return [];
    const startIdx = this.binarySearch(minDepth);
    const endIdx   = this.binarySearch(maxDepth);
    const result: LogPoint[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      result.push([this.rawBuffer[i * 2], this.rawBuffer[i * 2 + 1]]);
    }
    return result;
  }

  public getDepthRange(): { min: number; max: number } {
    if (this.rawLength === 0) return { min: 0, max: 1 };
    return {
      min: this.rawBuffer[0],
      max: this.rawBuffer[(this.rawLength - 1) * 2],
    };
  }

  public getValueRange(): { min: number; max: number } {
    return { min: this.valMin, max: this.valMax };
  }

  public getDownsampledData(minDepth: number, maxDepth: number, bucketCount: number): Float64Array {
    if (this.rawLength === 0) return this.renderBuffer.subarray(0, 0);

    const startIdx     = this.binarySearch(minDepth);
    const endIdx       = this.binarySearch(maxDepth);
    const visibleCount = endIdx - startIdx + 1;

    const maxPassthrough = Math.min(MAX_RENDER_POINTS, bucketCount * 2);
    if (visibleCount <= maxPassthrough) {
      for (let i = 0; i < visibleCount; i++) {
        const src = (startIdx + i) * 2;
        this.renderBuffer[i * 2]     = this.rawBuffer[src];
        this.renderBuffer[i * 2 + 1] = this.rawBuffer[src + 1];
      }
      return this.renderBuffer.subarray(0, visibleCount * 2);
    }

    const buckets  = Math.min(bucketCount, MAX_RENDER_POINTS / 2);
    let outCount = 0;

    for (let b = 0; b < buckets; b++) {
      const bStart = startIdx + Math.floor((b       * visibleCount) / buckets);
      const bEnd   = startIdx + Math.floor(((b + 1) * visibleCount) / buckets);
      if (bStart >= bEnd) continue;

      let minVal = this.rawBuffer[bStart * 2 + 1];
      let maxVal = this.rawBuffer[bStart * 2 + 1];
      let minIdx = bStart;
      let maxIdx = bStart;

      for (let i = bStart + 1; i < bEnd; i++) {
        const v = this.rawBuffer[i * 2 + 1];
        if (v < minVal) { minVal = v; minIdx = i; }
        if (v > maxVal) { maxVal = v; maxIdx = i; }
      }

      if (minIdx === maxIdx) {
        this.renderBuffer[outCount * 2]     = this.rawBuffer[minIdx * 2];
        this.renderBuffer[outCount * 2 + 1] = this.rawBuffer[minIdx * 2 + 1];
        outCount++;
      } else {
        const first  = minIdx < maxIdx ? minIdx : maxIdx;
        const second = minIdx < maxIdx ? maxIdx : minIdx;
        this.renderBuffer[outCount * 2]     = this.rawBuffer[first * 2];
        this.renderBuffer[outCount * 2 + 1] = this.rawBuffer[first * 2 + 1];
        outCount++;
        this.renderBuffer[outCount * 2]     = this.rawBuffer[second * 2];
        this.renderBuffer[outCount * 2 + 1] = this.rawBuffer[second * 2 + 1];
        outCount++;
      }
    }

    return this.renderBuffer.subarray(0, outCount * 2);
  }

  private binarySearch(targetDepth: number): number {
    let left  = 0;
    let right = this.rawLength - 1;

    while (left <= right) {
      const mid      = Math.floor((left + right) / 2);
      const midDepth = this.rawBuffer[mid * 2];

      if (midDepth === targetDepth) return mid;
      if (midDepth < targetDepth)   left  = mid + 1;
      else                          right = mid - 1;
    }

    return Math.max(0, right);
  }
}
