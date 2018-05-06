import Draggable from "./Draggable";

export default class LightEmitter extends Draggable {
  /**
   * @constructor
   * @param {[float, float]} pos Emitter position
   * @param {float} power Power of emitter
   * @param {float} spatialSpread 'Width' of emitter
   * @param {[float, float]} angularSpread Angular spread of emitter
   */
  constructor({ pos, power, spatialSpread, angularSpread }) {
    super(pos);
    this.power = power;
    this.spatialSpread = spatialSpread;
    this.angularSpread = angularSpread;
  }

  to4fvFormat() {
    return [
      [
        ...this.pos,
        Math.cos(this.angularSpread[0]),
        -Math.sin(this.angularSpread[0])
      ],
      [
        this.emitterPower,
        this.spatialSpread,
        -this.angularSpread[0],
        this.angularSpread[1]
      ]
    ];
  }
}
