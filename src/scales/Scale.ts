export abstract class Scale {
  constructor(
    public domainMin: number,
    public domainMax: number,
    public rangeMin: number,
    public rangeMax: number,
  ) {}

  abstract toPixel(value: number): number;
  abstract toValue(pixel: number): number;
}

export class LinearScale extends Scale {
  public toPixel(value: number): number {
    const domainSpan = this.domainMax - this.domainMin;
    if (domainSpan === 0) return this.rangeMin;
    const ratio = (value - this.domainMin) / domainSpan;
    return this.rangeMin + ratio * (this.rangeMax - this.rangeMin);
  }

  public toValue(pixel: number): number {
    const rangeSpan = this.rangeMax - this.rangeMin;
    if (rangeSpan === 0) return this.domainMin;
    const ratio = (pixel - this.rangeMin) / rangeSpan;
    return this.domainMin + ratio * (this.domainMax - this.domainMin);
  }
}
