import { LAMBDA_MIN, LAMBDA_MAX } from './constants';

class SpectrumRenderer {
  constructor(canvas, spectrum) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.spectrum = spectrum;
    this.smooth = true;

    this.spectrumFill = new Image();
    this.spectrumFill.src = 'Spectrum.png';
    this.spectrumFill.addEventListener('load', this.loadPattern.bind(this));
    if (this.spectrumFill.complete) this.loadPattern();
  }

  setSpectrum(spectrum) {
    this.spectrum = spectrum;
    this.draw();
  }

  loadPattern() {
    this.pattern = this.context.createPattern(this.spectrumFill, 'repeat-y');
    this.draw();
  }

  setColor(r, g, b) {
    this.context.strokeStyle = `rgb(${r},${g},${b})`;
  }

  drawLine(p) {
    this.context.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) {
      this.context.lineTo(p[i], p[i + 1]);
    }
  }

  setSmooth(smooth) {
    this.smooth = smooth;
  }

  draw() {
    const ctx = this.context;

    const w = this.canvas.width;
    const h = this.canvas.height;
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

    const mapX = x => graphX + Math.floor(graphW * (x - axisX0) / (axisX1 - axisX0));
    const mapY = y => graphY - Math.floor(graphH * (y - axisY0) / (axisY1 - axisY0));

    ctx.beginPath();
    this.setColor(128, 128, 128);
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 2]);
    for (let gx = axisX0 - 10 + xTicks; gx <= axisX1; gx += xTicks) {
      this.drawLine([mapX(gx), graphY, mapX(gx), graphY - graphH]);
    }
    for (let gy = axisY0 + yTicks; gy <= axisY1; gy += yTicks) {
      this.drawLine([graphX, mapY(gy), graphX + graphW, mapY(gy)]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    let max = 0.0;
    for (let i = 0; i < this.spectrum.length; ++i) max = Math.max(this.spectrum[i], max);
    max *= 1.1;

    const grapher = this;
    const drawGraph = () => {
      const { spectrum } = grapher;
      const path = new Path2D();
      path.moveTo(0, h);
      for (let gx = axisX0; gx <= axisX1; gx += grapher.smooth ? 15 : 1) {
        const x = mapX(gx);
        const sx = spectrum.length * (gx - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN);
        const y = mapY(spectrum[Math.max(Math.min(Math.floor(sx), spectrum.length - 1), 0)] / max);
        if (gx === axisX0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      return path;
    };

    const filled = drawGraph();
    filled.lineTo(graphX + graphW, graphY);
    filled.lineTo(graphX, graphY);
    ctx.fillStyle = this.pattern;
    ctx.fill(filled);
    ctx.fillStyle = 'black';

    const outline = drawGraph();
    this.setColor(0, 0, 0);
    ctx.lineWidth = 2;
    ctx.stroke(outline);

    ctx.beginPath();
    this.setColor(128, 128, 128);
    ctx.lineWidth = 2;
    this.drawLine([
      graphX + graphW,
      graphY - tickSize,
      graphX + graphW,
      graphY,
      graphX,
      graphY,
      graphX,
      graphY - graphH,
      graphX + tickSize,
      graphY - graphH,
    ]);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let gx = axisX0 - 10 + xTicks; gx < axisX1; gx += xTicks) {
      this.drawLine([mapX(gx), graphY, mapX(gx), graphY - tickSize]);
    }

    for (let gy = axisY0 + yTicks; gy < axisY1; gy += yTicks) {
      this.drawLine([graphX, mapY(gy), graphX + tickSize, mapY(gy)]);
    }

    ctx.stroke();

    ctx.font = '15px serif';
    ctx.textAlign = 'center';
    for (let gx = axisX0 - 10 + xTicks; gx < axisX1; gx += xTicks) {
      ctx.fillText(gx, mapX(gx), graphY + 15);
    }
    ctx.fillText('λ', graphX + graphW, graphY + 16);
  }
}

export default SpectrumRenderer;
