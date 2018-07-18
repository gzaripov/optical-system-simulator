import { Settings } from "http2";
import { Lens } from "../Scene/Graphics/core/Lens";
import { LightSource } from "../Scene/Graphics/core/LightSource";
import Prism from "../Scene/Graphics/core/Prism";

export interface SceneState {
  lightSource: LightSource;
  settings: Settings;
  lenses: Lens[];
  prisms: Prism;
}
