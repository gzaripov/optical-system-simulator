export default class VertexBufferAttribute {
  constructor(
    public index: number,
    public name: string,
    public norm: boolean,
    public offset: number,
    public size: number,
    public type: number
  ) {}
}
