import Point from "../../../Scene/Graphics/core/Point";
import Draggable from "./Draggable";

export enum LightSpread {
  POINT = 0,
  CONE = 1,
  BEAM = 2,
  LASER = 3,
  AREA = 4
}

export class LightSource extends Draggable {
  private emitterPower: number;
  private spatialSpread: number;
  private angularSpread: number;

  constructor(
    pos: Point,
    emitterPower: number,
    spatialSpread: number,
    angularSpread: number
  ) {
    super(pos);
    this.emitterPower = emitterPower;
    this.spatialSpread = spatialSpread;
    this.angularSpread = angularSpread;
  }

  public to4fvFormat() {
    return [
      [
        this.pos.x,
        this.pos.y,
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
