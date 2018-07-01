import Shader from "./Shader";
import Attribute from "./VertexBufferAttribute";

function glTypeSize(gl: WebGLRenderingContext, type: number): number {
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
  private gl: WebGLRenderingContext;
  private glName: WebGLBuffer;
  private length: number;
  private elementSize: number;
  private attributes: Attribute[];

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.attributes = [];
    this.elementSize = 0;
  }

  public init(numVerts: number) {
    const { gl } = this;
    this.length = numVerts;
    this.glName = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.length * this.elementSize,
      gl.STATIC_DRAW
    );
  }

  public bind() {
    const { gl } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
  }

  public addAttribute(name: string, size: number, type: number, norm: boolean) {
    this.attributes.push(
      new Attribute(-1, name, norm, this.elementSize, size, type)
    );
    this.elementSize += size * glTypeSize(this.gl, type);
  }

  public copy(data: Float32Array) {
    const { gl } = this;
    if (data.byteLength !== this.length * this.elementSize) {
      throw new Error("Resizing VBO during copy strongly discouraged");
    }
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  public draw(shader: Shader, mode: number, length: number) {
    const { gl } = this;
    this.attributes.forEach(attribute => {
      attribute.index = gl.getAttribLocation(shader.program, attribute.name);
      if (attribute.index >= 0) {
        const attr = attribute;
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
    });

    gl.drawArrays(mode, 0, length || this.length);

    this.attributes.forEach(attribute => {
      if (attribute.index >= 0) {
        gl.disableVertexAttribArray(attribute.index);
        attribute.index = -1;
      }
    });
  }
}

export default VertexBuffer;
