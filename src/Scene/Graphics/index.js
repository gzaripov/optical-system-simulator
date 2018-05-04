import React, { Component } from "react";
import styled from "styled-components";
import { scene as config, gasDischargeLines } from "./config";
import { Texture, RenderTarget, Shader, VertexBuffer } from "./gl";
import { Renderer, SpectrumRenderer, colorBufferFloatTest } from "./core";
import {
  ButtonGroup,
  ProgressBar,
  Slider,
  ButtonGrid,
  MouseListener
} from "./ui";
import shaders from "./shaders";

const Canvas = styled.canvas``;

// onProgreesChanged
class Graphics extends Component {
  componentDidMount() {
    this.content = document.getElementById("content");
    this.controls = document.getElementById("controls");
    this.spectrumCanvas = document.getElementById("spectrum-canvas");

    this.boundRenderLoop = this.renderLoop.bind(this);
    this.ratio = window.devicePixelRatio;
    try {
      this.setupGL();
    } catch (e) {
      /* GL errors at this stage are to be expected to some degree,
           so display a nice error message and call it quits */
      this.fail(e.message + ". This demo won't run in your browser.");
      return;
    }
    try {
      this.setupUI();
    } catch (e) {
      /* Errors here are a bit more serious and shouldn't normally happen.
           Let's just dump what we have and hope the user can make sense of it */
      console.error(e);
      this.fail(
        "Ooops! Something unexpected happened. The error message is listed below:<br/>" +
          "<pre>" +
          e.message +
          "</pre>"
      );
      return;
    }

    /* Ok, all seems well. Time to show the controls */
    this.controls.style.visibility = "visible";

    window.requestAnimationFrame(this.boundRenderLoop);
  }

  setupGL() {
    try {
      var gl =
        this.canvas.getContext("webgl") ||
        this.canvas.getContext("experimental-webgl");
    } catch (e) {}
    if (!gl) throw new Error("Could not initialise WebGL");

    var floatExt = gl.getExtension("OES_texture_float");
    var floatLinExt = gl.getExtension("OES_texture_float_linear");
    var floatBufExt = gl.getExtension("WEBGL_color_buffer_float");
    var multiBufExt = gl.getExtension("WEBGL_draw_buffers");

    if (!floatExt || !floatLinExt)
      throw new Error("Your platform does not support float textures");
    if (!multiBufExt)
      throw new Error(
        "Your platform does not support the draw buffers extension"
      );

    if (!floatBufExt) colorBufferFloatTest(gl, multiBufExt);

    this.gl = gl;
    this.multiBufExt = multiBufExt;
  }

  setupUI() {
    var sceneShaders = [],
      sceneNames = [];
    for (let i = 0; i < config.scenes.length; ++i) {
      sceneShaders.push(config.scenes[i].shader);
      sceneNames.push(config.scenes[i].name);
    }

    this.renderer = new Renderer(
      this.gl,
      this.multiBufExt,
      this.canvas.width,
      this.canvas.height,
      sceneShaders
    );

    this.spectrumRenderer = new SpectrumRenderer(
      this.spectrumCanvas,
      this.renderer.getEmissionSpectrum()
    );

    /* Let's try and make member variables in JS a little less verbose... */
    var spectrumRenderer = this.spectrumRenderer;
    var renderer = this.renderer;
    var content = this.content;
    var canvas = this.canvas;
    var ratio = this.ratio;

    this.progressBar = new ProgressBar("render-progress", true);

    var resolutionLabels = [];
    for (let i = 0; i < config.resolutions.length; ++i)
      resolutionLabels.push(
        config.resolutions[i][0] + "x" + config.resolutions[i][1]
      );

    new ButtonGroup("resolution-selector", false, resolutionLabels, function(
      idx
    ) {
      var width = config.resolutions[idx][0];
      var height = config.resolutions[idx][1];
      content.style.width = width / ratio + "px";
      content.style.height = height / ratio + "px";
      canvas.width = width;
      canvas.height = height;

      canvas.style.width = width / ratio + "px";
      canvas.style.height = height / ratio + "px";

      renderer.changeResolution(width, height);
    });
    var spreadSelector = new ButtonGroup(
      "spread-selector",
      true,
      ["Point", "Cone", "Beam", "Laser", "Area"],
      renderer.setSpreadType.bind(renderer)
    );

    function selectScene(idx) {
      renderer.changeScene(idx);
      spreadSelector.select(config.scenes[idx].spread);
      renderer.setNormalizedEmitterPos(
        config.scenes[idx].posA,
        config.scenes[idx].posB
      );
    }
    new ButtonGroup("scene-selector", true, sceneNames, selectScene);

    new MouseListener(canvas, renderer.setEmitterPos.bind(renderer));

    var temperatureSlider = new Slider(
      "emission-temperature",
      1000,
      10000,
      true,
      function(temperature) {
        this.setLabel("Temperature: " + temperature + "K");
        renderer.setEmitterTemperature(temperature);
        spectrumRenderer.setSpectrum(renderer.getEmissionSpectrum());
      }
    );

    var bounceSlider = new Slider("path-length", 1, 20, true, function(length) {
      this.setLabel(length - 1 + " light bounces");
      renderer.setMaxPathLength(length);
    });
    bounceSlider.setValue(12);

    var sampleSlider = new Slider("sample-count", 400, 700, true, function(
      exponent100
    ) {
      var sampleCount = Math.floor(Math.pow(10, exponent100 * 0.01));
      this.setLabel(sampleCount + " light paths");
      renderer.setMaxSampleCount(sampleCount);
    });
    sampleSlider.setValue(600);

    var gasOptions = [];
    for (let i = 0; i < gasDischargeLines.length; ++i)
      gasOptions.push(gasDischargeLines[i].name);
    var gasGrid = new ButtonGrid("gas-selection", 4, gasOptions, function(
      gasId
    ) {
      renderer.setEmitterGas(gasId);
      spectrumRenderer.setSpectrum(renderer.getEmissionSpectrum());
    });

    temperatureSlider.show(false);
    gasGrid.show(false);

    new ButtonGroup(
      "emission-selector",
      false,
      ["White", "Incandescent", "Gas Discharge"],
      function(type) {
        renderer.setEmissionSpectrumType(type);
        spectrumRenderer.setSmooth(type !== Renderer.SPECTRUM_GAS_DISCHARGE);
        spectrumRenderer.setSpectrum(renderer.getEmissionSpectrum());
        temperatureSlider.show(type === Renderer.SPECTRUM_INCANDESCENT);
        gasGrid.show(type === Renderer.SPECTRUM_GAS_DISCHARGE);
      }
    );

    selectScene(0);
  }

  fail(message) {
    var sorryP = document.createElement("p");
    sorryP.appendChild(document.createTextNode("Sorry! :("));
    sorryP.style.fontSize = "50px";

    var failureP = document.createElement("p");
    failureP.className = "warning-box";
    failureP.innerHTML = message;

    var errorImg = document.createElement("img");
    errorImg.title = errorImg.alt = "The Element of Failure";
    errorImg.src = "derp.gif";

    var failureDiv = document.createElement("div");
    failureDiv.className = "center";
    failureDiv.appendChild(sorryP);
    failureDiv.appendChild(errorImg);
    failureDiv.appendChild(failureP);
  }

  renderLoop(timestamp) {
    window.requestAnimationFrame(this.boundRenderLoop);

    if (!this.renderer.finished()) this.renderer.render(timestamp);

    const raysTraced = this.renderer.totalRaysTraced();
    const maxRayCount = this.renderer.maxRayCount();

    this.props.onProgressChanged(
      Math.min(raysTraced, maxRayCount),
      maxRayCount
    );
  }

  render() {
    const { width, height } = this.props;
    return (
      <Canvas
        innerRef={c => (this.canvas = c)}
        width={width + "px"}
        height={height + "px"}
      />
    );
  }
}

export default Graphics;
