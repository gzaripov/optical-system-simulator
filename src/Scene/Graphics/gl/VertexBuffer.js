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
      name,
      size,
      type,
      norm,
      offset: this.elementSize,
      index: -1,
    });
    this.elementSize += size * glTypeSize(this.gl, type);
  }

  init(numVerts) {
    const { gl } = this;
    this.length = numVerts;
    this.glName = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
    gl.bufferData(gl.ARRAY_BUFFER, this.length * this.elementSize, gl.STATIC_DRAW);
  }

  copy(data) {
    const { gl } = this;
    if (data.byteLength !== this.length * this.elementSize) { throw new Error('Resizing VBO during copy strongly discouraged'); }
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  draw(shader, mode, length) {
    const { gl } = this;
    for (let i = 0; i < this.attributes.length; ++i) {
      this.attributes[i].index = gl.getAttribLocation(shader.program, this.attributes[i].name);
      if (this.attributes[i].index >= 0) {
        const attr = this.attributes[i];
        gl.enableVertexAttribArray(attr.index);
        gl.vertexAttribPointer(
          attr.index,
          attr.size,
          attr.type,
          attr.norm,
          this.elementSize,
          attr.offset,
        );
      }
    }

    gl.drawArrays(mode, 0, length || this.length);

    for (let i = 0; i < this.attributes.length; ++i) {
      if (this.attributes[i].index >= 0) {
        gl.disableVertexAttribArray(this.attributes[i].index);
        this.attributes[i].index = -1;
      }
    }
  }
}

export default VertexBuffer;
