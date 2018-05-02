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

export default Shader;
