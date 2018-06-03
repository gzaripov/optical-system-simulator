import { Texture, Shader, VertexBuffer, RenderTarget } from '../gl';
import { wavelengthToRgbTable, gasDischargeLines } from '../config';
import { LAMBDA_MIN, LAMBDA_MAX } from './constants';
import shaders from '../shaders';
import RayState from './RayState';
import LightSource from './LightSource';

class Renderer {
  static SPECTRUM_WHITE = 0;
  static SPECTRUM_INCANDESCENT = 1;
  static SPECTRUM_GAS_DISCHARGE = 2;

  static SPECTRUM_SAMPLES = 256;
  static ICDF_SAMPLES = 1024;

  constructor(gl, multiBufExt, width, height, scenes) {
    this.gl = gl;
    this.multiBufExt = multiBufExt;
    this.quadVbo = this.createQuadVbo();

    this.maxSampleCount = 100000;
    this.spreadType = LightSource.SPREAD.CONE;
    this.emissionSpectrumType = Renderer.SPECTRUM_WHITE;
    this.emitterTemperature = 5000.0;
    this.emitterGas = 0;
    this.currentScene = 0;
    this.needsReset = true;

    this.compositeProgram = new Shader(gl, shaders, 'compose-vert', 'compose-frag');

    this.passProgram = new Shader(gl, shaders, 'compose-vert', 'pass-frag');
    this.initProgram = new Shader(gl, shaders, 'init-vert', 'init-frag');
    this.rayProgram = new Shader(gl, shaders, 'ray-vert', 'ray-frag');
    this.tracePrograms = [];
    for (let i = 0; i < scenes.length; ++i) {
      this.tracePrograms.push(new Shader(gl, shaders, 'trace-vert', scenes[i]));
    }

    this.maxPathLength = 12;

    this.spectrumTable = wavelengthToRgbTable();
    this.spectrum = new Texture(
      gl,
      this.spectrumTable.length / 4,
      1,
      4,
      true,
      true,
      true,
      this.spectrumTable,
    );
    this.emission = new Texture(gl, Renderer.SPECTRUM_SAMPLES, 1, 1, true, false, true, null);
    this.emissionIcdf = new Texture(gl, Renderer.ICDF_SAMPLES, 1, 1, true, false, true, null);
    this.emissionPdf = new Texture(gl, Renderer.SPECTRUM_SAMPLES, 1, 1, true, false, true, null);

    this.raySize = 512;
    this.resetActiveBlock();
    this.rayCount = this.raySize * this.raySize;
    this.currentState = 0;
    this.rayStates = [new RayState(gl, this.raySize), new RayState(gl, this.raySize)];

    this.rayVbo = new VertexBuffer(gl);
    this.rayVbo.addAttribute('TexCoord', 3, gl.FLOAT, false);
    this.rayVbo.init(this.rayCount * 2);

    const vboData = new Float32Array(this.rayCount * 2 * 3);
    for (let i = 0; i < this.rayCount; ++i) {
      const u = (i % this.raySize + 0.5) / this.raySize;
      const v = (Math.floor(i / this.raySize) + 0.5) / this.raySize;
      vboData[i * 6 + 0] = u;
      vboData[i * 6 + 3] = u;
      vboData[i * 6 + 1] = v;
      vboData[i * 6 + 4] = v;
      vboData[i * 6 + 2] = 0.0;
      vboData[i * 6 + 5] = 1.0;
    }
    this.rayVbo.copy(vboData);

    this.fbo = new RenderTarget(gl, multiBufExt);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.blendFunc(gl.ONE, gl.ONE);

    this.changeResolution(width, height);
    this.setEmitterPos([0, 0], [0, 0]);
    this.computeEmissionSpectrum();
  }

  resetActiveBlock() {
    this.activeBlock = 4;
  }

  setEmissionSpectrumType(type) {
    this.emissionSpectrumType = type;
    this.computeEmissionSpectrum();
  }

  setEmitterTemperature(temperature) {
    this.emitterTemperature = temperature;
    if (this.emissionSpectrumType === Renderer.SPECTRUM_INCANDESCENT) {
      this.computeEmissionSpectrum();
    }
  }

  setEmitterGas(gasId) {
    this.emitterGas = gasId;
    if (this.emissionSpectrumType === Renderer.SPECTRUM_GAS_DISCHARGE) {
      this.computeEmissionSpectrum();
    }
  }

  computeEmissionSpectrum() {
    if (!this.emissionSpectrum) this.emissionSpectrum = new Float32Array(Renderer.SPECTRUM_SAMPLES);
    const h = 6.62607004e-34;
    const c = 299792458.0;
    const kB = 1.3806488e-23;
    const T = this.emitterTemperature;

    const { wavelengths, strengths } = gasDischargeLines[this.emitterGas];
    const LAMBDA_LENGTH = LAMBDA_MAX - LAMBDA_MIN;

    switch (this.emissionSpectrumType) {
      case Renderer.SPECTRUM_WHITE:
        for (let i = 0; i < Renderer.SPECTRUM_SAMPLES; ++i) this.emissionSpectrum[i] = 1.0;
        break;
      case Renderer.SPECTRUM_INCANDESCENT:
        for (let i = 0; i < Renderer.SPECTRUM_SAMPLES; ++i) {
          const l =
            (LAMBDA_MIN + (LAMBDA_MAX - LAMBDA_MIN) * (i + 0.5) / Renderer.SPECTRUM_SAMPLES) * 1e-9;
          const power =
            1e-12 *
            (2.0 * h * c * c) /
            (l * l * l * l * l * (Math.exp(h * c / (l * kB * T)) - 1.0));

          this.emissionSpectrum[i] = power;
        }
        break;
      case Renderer.SPECTRUM_GAS_DISCHARGE:
        for (let i = 0; i < Renderer.SPECTRUM_SAMPLES; ++i) this.emissionSpectrum[i] = 0.0;

        for (let i = 0; i < wavelengths.length; ++i) {
          const normalizeWave = Math.floor((wavelengths[i] - LAMBDA_MIN) / LAMBDA_LENGTH);
          const idx = normalizeWave * Renderer.SPECTRUM_SAMPLES;
          if (idx >= 0 && idx < Renderer.SPECTRUM_SAMPLES) {
            this.emissionSpectrum[idx] += strengths[i];
          }
        }
        break;
      default:
        throw new Error('Unknown Renderer');
    }

    this.computeSpectrumIcdf();

    this.emission.bind(0);
    this.emission.copy(this.emissionSpectrum);
    this.reset();
  }

  computeSpectrumIcdf() {
    if (!this.cdf) {
      this.cdf = new Float32Array(Renderer.SPECTRUM_SAMPLES + 1);
      this.pdf = new Float32Array(Renderer.SPECTRUM_SAMPLES);
      this.icdf = new Float32Array(Renderer.ICDF_SAMPLES);
    }

    let sum = 0.0;
    for (let i = 0; i < Renderer.SPECTRUM_SAMPLES; ++i) sum += this.emissionSpectrum[i];

    /* Mix in 10% of a uniform sample distribution to stay on the safe side.
           Especially gas emission spectra with lots of emission lines
           tend to have small peaks that fall through the cracks otherwise */
    const safetyPadding = 0.1;
    const normalization = Renderer.SPECTRUM_SAMPLES / sum;

    /* Precompute cdf and pdf (unnormalized for now) */
    this.cdf[0] = 0.0;
    for (let i = 0; i < Renderer.SPECTRUM_SAMPLES; ++i) {
      this.emissionSpectrum[i] *= normalization;

      /* Also take into account the observer response when distributing samples.
               Otherwise tends to prioritize peaks just barely outside the visible spectrum */
      const observerResponse =
        1.0 /
        3.0 *
        (Math.abs(this.spectrumTable[i * 4]) +
          Math.abs(this.spectrumTable[i * 4 + 1]) +
          Math.abs(this.spectrumTable[i * 4 + 2]));

      this.pdf[i] =
        observerResponse * (this.emissionSpectrum[i] + safetyPadding) / (1.0 + safetyPadding);
      this.cdf[i + 1] = this.pdf[i] + this.cdf[i];
    }

    /* All done! Time to normalize */
    const cdfSum = this.cdf[Renderer.SPECTRUM_SAMPLES];
    for (let i = 0; i < Renderer.SPECTRUM_SAMPLES; ++i) {
      this.pdf[i] *= Renderer.SPECTRUM_SAMPLES / cdfSum;
      this.cdf[i + 1] /= cdfSum;
    }
    /* Make sure we don't fall into any floating point pits */
    this.cdf[Renderer.SPECTRUM_SAMPLES] = 1.0;

    /* Precompute an inverted mapping of the cdf. This is biased!
           Unfortunately we can't really afford to do runtime bisection
           on the GPU, so this will have to do. For our purposes a small
           amount of bias is tolerable anyway. */
    let cdfIdx = 0;
    for (let i = 0; i < Renderer.ICDF_SAMPLES; ++i) {
      const target = Math.min((i + 1) / Renderer.ICDF_SAMPLES, 1.0);
      while (this.cdf[cdfIdx] < target) cdfIdx++;
      this.icdf[i] = (cdfIdx - 1.0) / Renderer.SPECTRUM_SAMPLES;
    }

    this.emissionIcdf.bind(0);
    this.emissionIcdf.copy(this.icdf);
    this.emissionPdf.bind(0);
    this.emissionPdf.copy(this.pdf);
  }

  getEmissionSpectrum() {
    return this.emissionSpectrum;
  }

  setMaxPathLength(length) {
    this.maxPathLength = length;
    this.reset();
  }

  setMaxSampleCount(count) {
    this.maxSampleCount = count;
  }

  changeResolution(width, height) {
    const { gl } = this;

    if (this.width && this.height) {
      this.emitterPos[0] = (this.emitterPos[0] + 0.5) * width / this.width - 0.5;
      this.emitterPos[1] = (this.emitterPos[1] + 0.5) * height / this.height - 0.5;
    }

    this.width = width;
    this.height = height;
    this.aspect = this.width / this.height;
    this.screenBuffer = new Texture(gl, this.width, this.height, 4, true, false, true, null);

    this.waveBuffer = new Texture(gl, this.width, this.height, 4, true, false, true, null);

    this.resetActiveBlock();
    this.reset();
  }

  changeScene(idx) {
    this.resetActiveBlock();
    this.currentScene = idx;
    this.reset();
  }

  reset() {
    if (!this.needsReset) return;
    this.needsReset = false;
    this.wavesTraced = 0;
    this.raysTraced = 0;
    this.samplesTraced = 0;
    this.pathLength = 0;
    this.elapsedTimes = [];

    this.fbo.bind();
    this.fbo.drawBuffers(1);
    this.fbo.attachTexture(this.screenBuffer, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.fbo.unbind();
  }

  setSpreadType(type) {
    this.resetActiveBlock();
    this.spreadType = type;
    this.computeSpread();
    this.reset();
  }

  setNormalizedEmitterPos(posA, posB) {
    this.setEmitterPos(
      [posA[0] * this.width, posA[1] * this.height],
      [posB[0] * this.width, posB[1] * this.height],
    );
  }

  setEmitterPos(posA, posB) {
    console.log(posA, posB);
    this.emitterPos = this.spreadType === LightSource.SPREAD.POINT ? posB : posA;
    this.emitterAngle =
      this.spreadType === LightSource.SPREAD.POINT
        ? 0.0
        : Math.atan2(-posB[1] - posA[1], posB[0] - posA[0]);
    this.computeSpread();
    this.reset();
  }

  computeSpread() {
    switch (this.spreadType) {
      case LightSource.SPREAD.POINT:
        this.emitterPower = 0.1;
        this.spatialSpread = 0.0;
        this.angularSpread = [0.0, Math.PI * 2.0];
        break;
      case LightSource.SPREAD.CONE:
        this.emitterPower = 0.03;
        this.spatialSpread = 0.0;
        this.angularSpread = [this.emitterAngle, Math.PI * 0.3];
        break;
      case LightSource.SPREAD.BEAM:
        this.emitterPower = 0.03;
        this.spatialSpread = 0.4;
        this.angularSpread = [this.emitterAngle, 0.0];
        break;
      case LightSource.SPREAD.LASER:
        this.emitterPower = 0.05;
        this.spatialSpread = 0.0;
        this.angularSpread = [this.emitterAngle, 0.0];
        break;
      case LightSource.SPREAD.AREA:
        this.emitterPower = 0.1;
        this.spatialSpread = 0.4;
        this.angularSpread = [this.emitterAngle, Math.PI];
        break;
      default:
        throw new Error(`Unknwown Spread type: ${this.spreadType}`);
    }
  }

  createQuadVbo() {
    const vbo = new VertexBuffer(this.gl);
    vbo.addAttribute('Position', 3, this.gl.FLOAT, false);
    vbo.addAttribute('TexCoord', 2, this.gl.FLOAT, false);
    vbo.init(4);
    vbo.copy(new Float32Array([
      1.0,
      1.0,
      0.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      0.0,
      0.0,
      1.0,
      -1.0,
      -1.0,
      0.0,
      0.0,
      0.0,
      1.0,
      -1.0,
      0.0,
      1.0,
      0.0,
    ]));

    return vbo;
  }

  totalRaysTraced() {
    return this.raysTraced;
  }

  maxRayCount() {
    return this.maxPathLength * this.maxSampleCount;
  }

  totalSamplesTraced() {
    return this.samplesTraced;
  }

  progress() {
    return Math.min(this.totalRaysTraced() / this.maxRayCount(), 1.0);
  }

  finished() {
    return this.totalSamplesTraced() >= this.maxSampleCount;
  }

  composite() {
    this.screenBuffer.bind(0);
    this.compositeProgram.bind();
    this.compositeProgram.uniformTexture('Frame', this.screenBuffer);
    this.compositeProgram.uniformF(
      'Exposure',
      this.width / Math.max(this.samplesTraced, this.raySize * this.activeBlock),
    );
    this.quadVbo.draw(this.compositeProgram, this.gl.TRIANGLE_FAN);
  }

  // use util
  normalize(p, max) {
    return p / max * 2.0 - 1.0;
  }

  normalizeEmitterPos() {
    return [
      this.normalize(this.emitterPos[0], this.width) * this.aspect,
      this.normalize(this.emitterPos[1], this.height),
    ];
  }

  render(timestamp) {
    this.needsReset = true;
    this.elapsedTimes.push(timestamp);

    let current = this.currentState;
    let next = 1 - current;

    this.fbo.bind();

    const { gl } = this;
    gl.viewport(0, 0, this.raySize, this.raySize);
    gl.scissor(0, 0, this.raySize, this.activeBlock);
    gl.enable(gl.SCISSOR_TEST);
    this.fbo.drawBuffers(3);
    this.rayStates[next].attach(this.fbo);
    this.quadVbo.bind();

    if (this.pathLength === 0) {
      this.initProgram.bind();
      this.rayStates[current].rngTex.bind(0);
      this.spectrum.bind(1);
      this.emission.bind(2);
      this.emissionIcdf.bind(3);
      this.emissionPdf.bind(4);
      this.initProgram.uniformTexture('RngData', this.rayStates[current].rngTex);
      this.initProgram.uniformTexture('Spectrum', this.spectrum);
      this.initProgram.uniformTexture('Emission', this.emission);
      this.initProgram.uniformTexture('ICDF', this.emissionIcdf);
      this.initProgram.uniformTexture('PDF', this.emissionPdf);
      this.initProgram.uniform2F('EmitterPos', this.emitterPos[0], this.emitterPos[1]);
      this.initProgram.uniform2F(
        'EmitterDir',
        Math.cos(this.angularSpread[0]),
        -Math.sin(this.angularSpread[0]),
      );
      this.initProgram.uniformF('EmitterPower', this.emitterPower);
      this.initProgram.uniformF('SpatialSpread', this.spatialSpread);
      this.initProgram.uniform2F('AngularSpread', -this.angularSpread[0], this.angularSpread[1]);
      /*
      this.initProgram.uniformI("EmittersLength", 1);
      this.initProgram.uniform4fv("EmitterData", [
        this.emitterPower,
        this.spatialSpread,
        -this.angularSpread[0],
        this.angularSpread[1]
      ]);
      */
      this.quadVbo.draw(this.initProgram, gl.TRIANGLE_FAN);

      current = 1 - current;
      next = 1 - next;
      this.rayStates[next].attach(this.fbo);
    }

    const traceProgram = this.tracePrograms[this.currentScene];
    traceProgram.bind();
    // traceProgram.uniform2F("lensPos", ...this.normalizeEmitterPos());

    this.lenses.forEach((lens, index) => lens.to4fvFormat(traceProgram, index));
    traceProgram.uniformI('LensLength', this.lenses.length);
    // raceProgram.uniform4fv("LensData", Renderer.lenses[0].to4fvFormat());

    this.rayStates[current].bind(traceProgram);
    this.quadVbo.draw(traceProgram, gl.TRIANGLE_FAN);

    this.rayStates[next].detach(this.fbo);

    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, this.width, this.height);

    this.fbo.drawBuffers(1);
    this.fbo.attachTexture(this.waveBuffer, 0);

    if (this.pathLength === 0 || this.wavesTraced === 0) gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);

    this.rayProgram.bind();
    this.rayStates[current].posTex.bind(0);
    this.rayStates[next].posTex.bind(1);
    this.rayStates[current].rgbTex.bind(2);
    this.rayProgram.uniformTexture('PosDataA', this.rayStates[current].posTex);
    this.rayProgram.uniformTexture('PosDataB', this.rayStates[next].posTex);
    this.rayProgram.uniformTexture('RgbData', this.rayStates[current].rgbTex);
    this.rayProgram.uniformF('Aspect', this.aspect);
    this.rayVbo.bind();
    this.rayVbo.draw(this.rayProgram, gl.LINES, this.raySize * this.activeBlock * 2);

    this.raysTraced += this.raySize * this.activeBlock;
    this.pathLength += 1;

    this.quadVbo.bind();

    if (this.pathLength === this.maxPathLength || this.wavesTraced === 0) {
      this.fbo.attachTexture(this.screenBuffer, 0);

      this.waveBuffer.bind(0);
      this.passProgram.bind();
      this.passProgram.uniformTexture('Frame', this.waveBuffer);
      this.quadVbo.draw(this.passProgram, gl.TRIANGLE_FAN);

      if (this.pathLength === this.maxPathLength) {
        this.samplesTraced += this.raySize * this.activeBlock;
        this.wavesTraced += 1;
        this.pathLength = 0;

        if (this.elapsedTimes.length > 5) {
          let avgTime = 0;
          for (let i = 1; i < this.elapsedTimes.length; ++i) {
            avgTime += this.elapsedTimes[i] - this.elapsedTimes[i - 1];
          }
          avgTime /= this.elapsedTimes.length - 1;

          /* Let's try to stay at reasonable frame times. Targeting 16ms is
                       a bit tricky because there's a lot of variability in how often
                       the browser executes this loop and 16ms might well not be
                       reachable, but 24ms seems to do ok */
          if (avgTime > 24.0) this.activeBlock = Math.max(4, this.activeBlock - 4);
          else this.activeBlock = Math.min(512, this.activeBlock + 4);

          this.elapsedTimes = [this.elapsedTimes[this.elapsedTimes.length - 1]];
        }
      }
    }

    gl.disable(gl.BLEND);

    this.fbo.unbind();

    this.composite();

    this.currentState = next;
  }

  updateSettings(settings) {
    this.setMaxSampleCount(settings.maxSampleCount);
    this.setMaxPathLength(settings.maxPathLength);

    /* this.spreadType = Renderer.SPREAD.POINT;
    this.emissionSpectrumType = Renderer.SPECTRUM_WHITE;
    this.emitterTemperature = 5000.0;
    this.emitterGas = 0;
    this.currentScene = 0;
    this.needsReset = true; */
  }
}

export default Renderer;
