import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { gasDischargeLines } from './config';
import { Renderer, BoundsRenderer, DragObserver, Lens, colorBufferFloatTest } from './core';
import MouseListener from './MouseListener';

const CanvasContainer = styled.div`
  position: relative;
`;

const Canvas = styled.canvas`
  position: absolute;
  left: 0;
  right: 0;
  width: ${p => `${p.blockWidth}px`};
  height: ${p => `${p.blockHeight}px`};
`;

const BoundsCanvas = Canvas.extend`
  pointer-events: none;
`;

class Graphics extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    scale: PropTypes.number,
    onProgressChanged: PropTypes.func,
    lenses: PropTypes.arrayOf(PropTypes.shape()),
    prisms: PropTypes.arrayOf(PropTypes.shape()),
    settings: PropTypes.shape().isRequired,
    lightSource: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    scale: 1.0,
    lenses: [],
    prisms: [],
    onProgressChanged: () => {},
  };

  componentDidMount() {
    this.dragObserver = new DragObserver();
    // this.spectrumCanvas = document.getElementById('spectrum-canvas');
    this.dragObserver.setMovables(this.props.lenses);
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
    this.renderer = new Renderer(this.gl, this.multiBufExt, this.canvas.width, this.canvas.height);

    this.boundsRenderer = new BoundsRenderer(
      this.helperCanvas,
      this.canvas.width,
      this.canvas.height,
    );

    new MouseListener({
      target: this.canvas,
      mouseMoveCallback: (bias, endPos, startPos) => {
        this.dragObserver.move(bias, endPos, startPos);
        this.renderer.reset();
      },
      mouseDownCallback: pos => this.dragObserver.select(pos),
      mouseUpCallback: () => this.dragObserver.deselect(),
      scale: this.props.scale,
    });

    const gasOptions = [];
    for (let i = 0; i < gasDischargeLines.length; ++i) gasOptions.push(gasDischargeLines[i].name);
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
      this.renderer.prisms = this.props.prisms;
      this.dragObserver.setMovables(this.props.lenses);
      this.renderer.render(timestamp);
      this.boundsRenderer.clear();
      this.props.lenses.forEach(lense => this.boundsRenderer.draw(lense));
    }

    const raysTraced = this.renderer.totalRaysTraced();
    const maxRayCount = this.renderer.maxRayCount();

    this.props.onProgressChanged(Math.min(raysTraced, maxRayCount), maxRayCount);
  }

  render() {
    const {
      width, height, scale, lightSource, settings,
    } = this.props;
    const relativeScale = scale / window.devicePixelRatio;
    const canvasWidth = Math.floor(width * relativeScale);
    const canvasHeight = Math.floor(height * relativeScale);
    if (this.renderer) {
      if (this.canvas.width !== canvasWidth) {
        this.renderer.changeResolution(canvasWidth, canvasHeight);
      }
      this.renderer.updateSettings(settings);
      this.renderer.setLightSource(lightSource);
      this.renderer.reset();
    }
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

const mapState = ({ scene: { lenses, settings, lightSource } }) => ({
  lenses: lenses.map(lens => new Lens(lens)),
  settings,
  lightSource,
  scale: settings.scale,
});

const mapDispatch = ({ modals, scene }) => ({
  onClose: () => modals.hideModal('addLens'),
  addLens: scene.addLens,
});

export default connect(
  mapState,
  mapDispatch,
)(Graphics);
