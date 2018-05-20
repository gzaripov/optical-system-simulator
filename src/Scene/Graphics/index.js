import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { scene as config, gasDischargeLines } from './config';
import {
  Renderer,
  BoundsRenderer,
  SpectrumRenderer,
  DragObserver,
  /* Lens, */
  colorBufferFloatTest,
} from './core';
import { ButtonGroup, Slider, ButtonGrid, MouseListener } from './ui';

const CanvasContainer = styled.div`
  position: relative;
`;

const Canvas = styled.canvas`
  position: absolute;
  left:0;
  right:0
  width: ${p => `${p.blockWidth}px`};
  height: ${p => `${p.blockHeight}px`};
`;

const BoundsCanvas = Canvas.extend`
  pointer-events: none;
`;

/* new Lens({
    type: Lens.TYPE.BICONCAVE,
    pos: [0.5, 0.0],
    height: 0.375,
    width: 0.15,
    leftRadius: 0.75,
    rightRadius: 0.75
  }),
  new Lens({
    type: Lens.TYPE.BICONVEX,
    pos: [0.0, 0.5],
    height: 0.375,
    width: 0.15,
    leftRadius: 0.75,
    rightRadius: 0.75
  }),
  new Lens({
    type: Lens.TYPE.BICONVEX,
    pos: [0.0, -0.5],
    height: 0.375,
    width: 0.15,
    leftRadius: 0.75,
    rightRadius: 0.75
  }) */

class Graphics extends Component {
  propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    scale: PropTypes.number,
    onProgressChanged: PropTypes.func,
    lenses: PropTypes.arrayOf(PropTypes.shape()),
  };

  defaultProps = {
    scale: 1.0,
    lenses: [],
    onProgressChanged: () => {},
  };

  componentDidMount() {
    this.dragObserver = new DragObserver();
    this.controls = document.getElementById('controls');
    this.spectrumCanvas = document.getElementById('spectrum-canvas');
    this.dragObserver.addMovable(this.props.lenses);
    this.boundRenderLoop = this.renderLoop.bind(this);
    try {
      this.setupGL();
    } catch (e) {
      /* GL errors at this stage are to be expected to some degree,
           so display a nice error message and call it quits */
      this.fail(`${e.message}. This demo won't run in your browser.`);
      return;
    }
    try {
      this.setupUI();
    } catch (e) {
      /* Errors here are a bit more serious and shouldn't normally happen.
           Let's just dump what we have and hope the user can make sense of it */
      console.error(e);
      this.fail(`${'Ooops! Something unexpected happened. The error message is listed below:<br/>' +
          '<pre>'}${e.message}</pre>`);
      return;
    }

    /* Ok, all seems well. Time to show the controls */
    this.controls.style.visibility = 'visible';

    window.requestAnimationFrame(this.boundRenderLoop);
  }

  setupGL() {
    let gl;
    try {
      gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    } catch (e) {
      throw e;
    }
    if (!gl) throw new Error('Could not initialise WebGL');

    const floatExt = gl.getExtension('OES_texture_float');
    const floatLinExt = gl.getExtension('OES_texture_float_linear');
    const floatBufExt = gl.getExtension('WEBGL_color_buffer_float');
    const multiBufExt = gl.getExtension('WEBGL_draw_buffers');

    if (!floatExt || !floatLinExt) throw new Error('Your platform does not support float textures');
    if (!multiBufExt) throw new Error('Your platform does not support the draw buffers extension');

    if (!floatBufExt) colorBufferFloatTest(gl, multiBufExt);

    this.gl = gl;
    this.helperCanvas = this.altCanvas.getContext('2d');
    this.multiBufExt = multiBufExt;
  }

  setupUI() {
    const sceneShaders = [];
    const sceneNames = [];

    for (let i = 0; i < config.scenes.length; ++i) {
      sceneShaders.push(config.scenes[i].shader);
      sceneNames.push(config.scenes[i].name);
    }

    this.renderer = new Renderer(
      this.gl,
      this.multiBufExt,
      this.canvas.width,
      this.canvas.height,
      sceneShaders,
    );

    this.boundsRenderer = new BoundsRenderer(
      this.helperCanvas,
      this.canvas.width,
      this.canvas.height,
    );

    this.spectrumRenderer = new SpectrumRenderer(
      this.spectrumCanvas,
      this.renderer.getEmissionSpectrum(),
    );

    /* Let's try and make member variables in JS a little less verbose... */
    const { spectrumRenderer, renderer, canvas } = this;
    const resolutionLabels = [];
    for (let i = 0; i < config.resolutions.length; ++i) {
      resolutionLabels.push(`${config.resolutions[i][0]}x${config.resolutions[i][1]}`);
    }

    new ButtonGroup('resolution-selector', false, resolutionLabels, () => {
      // .changeResolution(width, height);
    });
    const spreadSelector = new ButtonGroup(
      'spread-selector',
      true,
      ['Point', 'Cone', 'Beam', 'Laser', 'Area'],
      renderer.setSpreadType.bind(renderer),
    );

    function selectScene(idx) {
      renderer.changeScene(idx);
      spreadSelector.select(config.scenes[idx].spread);
      renderer.setNormalizedEmitterPos(config.scenes[idx].posA, config.scenes[idx].posB);
    }

    new ButtonGroup('scene-selector', true, sceneNames, selectScene);

    new MouseListener({
      target: canvas,
      mouseMoveCallback: (pos) => {
        if (this.dragObserver.hasSelectedElement()) {
          this.dragObserver.move(pos);
          this.renderer.reset();
        }
      },
      mouseDownCallback: pos => this.dragObserver.select(pos),
      mouseUpCallback: () => this.dragObserver.deselect(),
      scale: this.props.scale,
    });

    const temperatureSlider = new Slider(
      'emission-temperature',
      1000,
      10000,
      true,
      (temperature, slider) => {
        slider.setLabel(`Temperature: ${temperature}K`);
        renderer.setEmitterTemperature(temperature);
        spectrumRenderer.setSpectrum(renderer.getEmissionSpectrum());
      },
    );

    const bounceSlider = new Slider('path-length', 1, 20, true, (length, slider) => {
      slider.setLabel(`${length - 1} light bounces`);
      renderer.setMaxPathLength(length);
    });
    bounceSlider.setValue(12);

    const sampleSlider = new Slider('sample-count', 400, 700, true, (exponent100, slider) => {
      const sampleCount = Math.floor(10 ** (exponent100 * 0.01));
      slider.setLabel(`${sampleCount} light paths`);
      renderer.setMaxSampleCount(sampleCount);
    });
    sampleSlider.setValue(600);

    const gasOptions = [];
    for (let i = 0; i < gasDischargeLines.length; ++i) gasOptions.push(gasDischargeLines[i].name);
    const gasGrid = new ButtonGrid('gas-selection', 4, gasOptions, (gasId) => {
      renderer.setEmitterGas(gasId);
      spectrumRenderer.setSpectrum(renderer.getEmissionSpectrum());
    });

    temperatureSlider.show(false);
    gasGrid.show(false);

    new ButtonGroup(
      'emission-selector',
      false,
      ['White', 'Incandescent', 'Gas Discharge'],
      (type) => {
        renderer.setEmissionSpectrumType(type);
        spectrumRenderer.setSmooth(type !== Renderer.SPECTRUM_GAS_DISCHARGE);
        spectrumRenderer.setSpectrum(renderer.getEmissionSpectrum());
        temperatureSlider.show(type === Renderer.SPECTRUM_INCANDESCENT);
        gasGrid.show(type === Renderer.SPECTRUM_GAS_DISCHARGE);
      },
    );

    selectScene(0);
  }

  fail(message) {
    const sorryP = document.createElement('p');
    sorryP.appendChild(document.createTextNode('Sorry! :('));
    sorryP.style.fontSize = '50px';

    const failureP = document.createElement('p');
    failureP.className = 'warning-box';
    failureP.innerHTML = message;

    const errorImg = document.createElement('img');
    errorImg.title = 'The Element of Failure';
    errorImg.alt = 'The Element of Failure';
    errorImg.src = 'derp.gif';

    const failureDiv = document.createElement('div');
    failureDiv.className = 'center';
    failureDiv.appendChild(sorryP);
    failureDiv.appendChild(errorImg);
    failureDiv.appendChild(failureP);
  }

  renderLoop(timestamp) {
    window.requestAnimationFrame(this.boundRenderLoop);

    if (!this.renderer.finished()) {
      this.renderer.lenses = this.props.lenses;
      this.dragObserver.addMovable(this.props.lenses);
      this.renderer.render(timestamp);
      this.boundsRenderer.clear();
      this.props.lenses.forEach(lense => this.boundsRenderer.draw(lense));
    }

    const raysTraced = this.renderer.totalRaysTraced();
    const maxRayCount = this.renderer.maxRayCount();

    this.props.onProgressChanged(Math.min(raysTraced, maxRayCount), maxRayCount);
  }

  // shouldComponentUpdate = (nextProps, nextState) => {};

  render() {
    const { width, height, scale } = this.props;
    const canvasWidth = Math.floor(width * scale);
    const canvasHeight = Math.floor(height * scale);
    return (
      <CanvasContainer>
        <Canvas
          innerRef={(c) => {
            this.canvas = c;
            return this.canvas;
          }}
          blockWidth={width}
          blockHeight={height}
          width={`${canvasWidth}px`}
          height={`${canvasHeight}px`}
        />
        <BoundsCanvas
          innerRef={(c) => {
            this.altCanvas = c;
            return this.altCanvas;
          }}
          blockWidth={width}
          blockHeight={height}
          width={`${canvasWidth}px`}
          height={`${canvasHeight}px`}
        />
      </CanvasContainer>
    );
  }
}

const mapState = ({ scene }) => ({
  lenses: scene.lenses,
});

const mapDispatch = ({ modals, scene }) => ({
  onClose: () => modals.hideModal('addLens'),
  addLens: scene.addLens,
});

export default connect(mapState, mapDispatch)(Graphics);
