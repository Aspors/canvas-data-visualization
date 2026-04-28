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
    const ratio = (value - this.domainMin) / (this.domainMax - this.domainMin);
    return this.rangeMin + ratio * (this.rangeMax - this.rangeMin);
  }

  public toValue(pixel: number): number {
    const ratio = (pixel - this.rangeMin) / (this.rangeMax - this.rangeMin);
    return this.domainMin + ratio * (this.domainMax - this.domainMin);
  }
}
