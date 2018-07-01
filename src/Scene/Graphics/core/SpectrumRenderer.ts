import { LAMBDA_MAX, LAMBDA_MIN } from "./constants";
import Point from "./Point";

class SpectrumRenderer {
  private context: CanvasRenderingContext2D;
  private spectrum: Float32Array;
  private smooth: boolean;
  private spectrumFill: HTMLImageElement;
  private pattern: CanvasPattern;

  constructor(context: CanvasRenderingContext2D, spectrum: Float32Array) {
    this.context = context;
    this.spectrum = spectrum;
    this.smooth = true;

    this.spectrumFill = new Image();
    this.spectrumFill.src = "Spectrum.png";
    this.spectrumFill.addEventListener("load", this.loadPattern.bind(this));
    if (this.spectrumFill.complete) {
      this.loadPattern();
    }
  }

  public setSpectrum(spectrum: Float32Array) {
    this.spectrum = spectrum;
    this.draw();
  }

  public loadPattern() {
    this.pattern = this.context.createPattern(this.spectrumFill, "repeat-y");
    this.draw();
  }

  public setColor(r: number, g: number, b: number) {
    this.context.strokeStyle = `rgb(${r},${g},${b})`;
  }

  public setSmooth(smooth: boolean) {
    this.smooth = smooth;
  }

  public draw() {
    const ctx = this.context;

    const w = this.context.canvas.width;
    const h = this.context.canvas.height;
    const marginX = 10;
    const marginY = 20;

    ctx.clearRect(0, 0, w, h);

    const graphW = w - 2 * marginX;
    const graphH = h - 2 * marginY;
    const graphX = 0 * 0.5 + marginX;
    const graphY = 0 * 0.5 + h - marginY;

    const axisX0 = 360;
    const axisX1 = 750;
    const axisY0 = 0.0;
    const axisY1 = 1.0;
    const xTicks = 50.0;
    const yTicks = 0.2;
    const tickSize = 10;

    const mapX = (x: number) =>
      graphX + Math.floor((graphW * (x - axisX0)) / (axisX1 - axisX0));
    const mapY = (y: number) =>
      graphY - Math.floor((graphH * (y - axisY0)) / (axisY1 - axisY0));

    ctx.beginPath();
    this.setColor(128, 128, 128);
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 2]);
    for (let gx = axisX0 - 10 + xTicks; gx <= axisX1; gx += xTicks) {
      this.drawLine(
        new Point(mapX(gx), graphY),
        new Point(mapX(gx), graphY - graphH)
      );
    }
    for (let gy = axisY0 + yTicks; gy <= axisY1; gy += yTicks) {
      this.drawLine(
        new Point(graphX, mapY(gy)),
        new Point(graphX + graphW, mapY(gy))
      );
    }
    ctx.stroke();
    ctx.setLineDash([]);

    let max = 0.0;

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.spectrum.length; ++i) {
      max = Math.max(this.spectrum[i], max);
    }
    max *= 1.1;

    const grapher = this;
    const drawGraph = () => {
      const { spectrum } = grapher;
      const path = new Path2D();
      path.moveTo(0, h);
      for (let gx = axisX0; gx <= axisX1; gx += grapher.smooth ? 15 : 1) {
        const x = mapX(gx);
        const sx =
          (spectrum.length * (gx - LAMBDA_MIN)) / (LAMBDA_MAX - LAMBDA_MIN);
        const y = mapY(
          spectrum[Math.max(Math.min(Math.floor(sx), spectrum.length - 1), 0)] /
            max
        );
        if (gx === axisX0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      return path;
    };

    const filled = drawGraph();
    filled.lineTo(graphX + graphW, graphY);
    filled.lineTo(graphX, graphY);
    ctx.fillStyle = this.pattern;
    ctx.fill(filled);
    ctx.fillStyle = "black";

    const outline = drawGraph();
    this.setColor(0, 0, 0);
    ctx.lineWidth = 2;
    ctx.stroke(outline);

    ctx.beginPath();
    this.setColor(128, 128, 128);
    ctx.lineWidth = 2;
    this.drawLine(
      new Point(graphX + graphW, graphY - tickSize),
      new Point(graphX + graphW, graphY),
      new Point(graphX, graphY),
      new Point(graphX, graphY - graphH),
      new Point(graphX + tickSize, graphY - graphH)
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let gx = axisX0 - 10 + xTicks; gx < axisX1; gx += xTicks) {
      this.drawLine(
        new Point(mapX(gx), graphY),
        new Point(mapX(gx), graphY - tickSize)
      );
    }

    for (let gy = axisY0 + yTicks; gy < axisY1; gy += yTicks) {
      this.drawLine(
        new Point(graphX, mapY(gy)),
        new Point(graphX + tickSize, mapY(gy))
      );
    }

    ctx.stroke();

    ctx.font = "15px serif";
    ctx.textAlign = "center";
    for (let gx = axisX0 - 10 + xTicks; gx < axisX1; gx += xTicks) {
      ctx.fillText(gx.toString(), mapX(gx), graphY + 15);
    }
    ctx.fillText("λ", graphX + graphW, graphY + 16);
  }

  private drawLine(...points: Point[]) {
    const p = points.pop()!;
    this.context.moveTo(p.x, p.y);
    points.forEach(point => this.context.lineTo(point.x, point.y));
  }
}

export default SpectrumRenderer;
