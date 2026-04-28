// src/data/DataManager.ts
export type LogPoint = [depth: number, value: number];

export class DataManager {
  private rawData: LogPoint[] = [];

  public setData(data: LogPoint[]) {
    this.rawData = data.sort(
      (a: LogPoint, b: LogPoint) => Number(a) - Number(b),
    );
  }

  public getVisibleData(minDepth: number, maxDepth: number): LogPoint[] {
    if (this.rawData.length === 0) return [];

    const startIndex = this.binarySearch(minDepth);
    let endIndex = this.binarySearch(maxDepth);

    if (endIndex < this.rawData.length - 1) endIndex++;

    return this.rawData.slice(startIndex, endIndex);
  }

  private binarySearch(targetDepth: number): number {
    let left = 0;
    let right = this.rawData.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDepth = this.rawData[mid];

      if (Number(midDepth) === targetDepth) return mid;
      if (Number(midDepth) < targetDepth) left = mid + 1;
      else right = mid - 1;
    }

    return Math.max(0, right);
  }
}
