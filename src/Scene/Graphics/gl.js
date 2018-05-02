function glTypeSize(gl, type) {
  switch (type) {
    case gl.BYTE:
    case gl.UNSIGNED_BYTE:
      return 1;
    case gl.SHORT:
    case gl.UNSIGNED_SHORT:
      return 2;
    case gl.INT:
    case gl.UNSIGNED_INT:
    case gl.FLOAT:
      return 4;
    default:
      return 0;
  }
}

class Texture {
  constructor(
    gl,
    width,
    height,
    channels,
    isFloat,
    isLinear,
    isClamped,
    texels
  ) {
    var coordMode = isClamped ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    this.type = isFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;
    this.format = [gl.LUMINANCE, gl.RG, gl.RGB, gl.RGBA][channels - 1];
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.glName = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.glName);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.format,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      texels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, coordMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, coordMode);
    this.setSmooth(isLinear);

    this.boundUnit = -1;
  }

  setSmooth(smooth) {
    const { gl } = this;
    let interpMode = smooth ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, interpMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, interpMode);
  }

  copy(texels) {
    const { gl } = this;
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.format,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      texels
    );
  }

  bind(unit) {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.glName);
    this.boundUnit = unit;
  }
}

class RenderTarget {
  constructor(gl, multiBufExt) {
    this.glName = gl.createFramebuffer();
    this.gl = gl;
    this.multiBufExt = multiBufExt;
  }

  bind() {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glName);
  }

  unbind() {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  attachTexture(texture, index) {
    const { gl } = this;
    this.gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + index,
      gl.TEXTURE_2D,
      texture.glName,
      0
    );
  }

  detachTexture(index) {
    const { gl } = this;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + index,
      gl.TEXTURE_2D,
      null,
      0
    );
  }

  drawBuffers(numBufs) {
    var buffers = [];
    for (let i = 0; i < numBufs; ++i) {
      buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
    }
    this.multiBufExt.drawBuffersWEBGL(buffers);
  }
}

class Shader {
  constructor(gl, shaderDict, vert, frag) {
    this.gl = gl;
    this.vertex = this.createShaderObject(shaderDict, vert, false);
    this.fragment = this.createShaderObject(shaderDict, frag, true);
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertex);
    gl.attachShader(this.program, this.fragment);
    gl.linkProgram(this.program);

    this.uniforms = {};

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
      alert("Could not initialise shaders");
  }

  bind() {
    this.gl.useProgram(this.program);
  }

  createShaderObject(shaderDict, name, isFragment) {
    const { gl } = this;
    var shaderSource = this.resolveShaderSource(shaderDict, name);
    var shaderObject = gl.createShader(
      isFragment ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER
    );
    gl.shaderSource(shaderObject, shaderSource);
    gl.compileShader(shaderObject);

    if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
      /* Add some line numbers for convenience */
      var lines = shaderSource.split("\n");
      for (var i = 0; i < lines.length; ++i)
        lines[i] = ("   " + (i + 1)).slice(-4) + " | " + lines[i];
      shaderSource = lines.join("\n");

      throw new Error(
        (isFragment ? "Fragment" : "Vertex") +
          " shader compilation error for shader '" +
          name +
          "':\n\n    " +
          gl
            .getShaderInfoLog(shaderObject)
            .split("\n")
            .join("\n    ") +
          "\nThe expanded shader source code was:\n\n" +
          shaderSource
      );
    }

    return shaderObject;
  }

  resolveShaderSource(shaderDict, name) {
    if (!(name in shaderDict))
      throw new Error("Unable to find shader source for '" + name + "'");
    var shaderSource = shaderDict[name];

    /* Rudimentary include handling for convenience.
           Not the most robust, but it will do for our purposes */
    var pattern = new RegExp('#include "(.+)"');
    var match;
    while ((match = pattern.exec(shaderSource))) {
      shaderSource =
        shaderSource.slice(0, match.index) +
        this.resolveShaderSource(shaderDict, match[1]) +
        shaderSource.slice(match.index + match[0].length);
    }

    return shaderSource;
  }

  uniformIndex(name) {
    const { gl } = this;
    if (!(name in this.uniforms))
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    return this.uniforms[name];
  }

  uniformTexture(name, texture) {
    const { gl } = this;
    let id = this.uniformIndex(name);
    if (id !== -1) gl.uniform1i(id, texture.boundUnit);
  }

  uniformF(name, f) {
    const { gl } = this;
    let id = this.uniformIndex(name);
    if (id !== -1) gl.uniform1f(id, f);
  }

  uniform2F(name, f1, f2) {
    const { gl } = this;
    let id = this.uniformIndex(name);
    if (id !== -1) gl.uniform2f(id, f1, f2);
  }
}

class VertexBuffer {
  constructor(gl) {
    this.gl = gl;
    this.attributes = [];
    this.elementSize = 0;
  }

  bind() {
    const { gl } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
  }

  addAttribute(name, size, type, norm) {
    this.attributes.push({
      name: name,
      size: size,
      type: type,
      norm: norm,
      offset: this.elementSize,
      index: -1
    });
    this.elementSize += size * glTypeSize(this.gl, type);
  }

  init(numVerts) {
    const { gl } = this;
    this.length = numVerts;
    this.glName = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.length * this.elementSize,
      gl.STATIC_DRAW
    );
  }

  copy(data) {
    const { gl } = this;
    if (data.byteLength !== this.length * this.elementSize)
      throw new Error("Resizing VBO during copy strongly discouraged");
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  draw(shader, mode, length) {
    const { gl } = this;
    for (let i = 0; i < this.attributes.length; ++i) {
      this.attributes[i].index = gl.getAttribLocation(
        shader.program,
        this.attributes[i].name
      );
      if (this.attributes[i].index >= 0) {
        var attr = this.attributes[i];
        gl.enableVertexAttribArray(attr.index);
        gl.vertexAttribPointer(
          attr.index,
          attr.size,
          attr.type,
          attr.norm,
          this.elementSize,
          attr.offset
        );
      }
    }

    gl.drawArrays(mode, 0, length ? length : this.length);

    for (let i = 0; i < this.attributes.length; ++i) {
      if (this.attributes[i].index >= 0) {
        gl.disableVertexAttribArray(this.attributes[i].index);
        this.attributes[i].index = -1;
      }
    }
  }
}

export { glTypeSize, Texture, RenderTarget, Shader, VertexBuffer };
