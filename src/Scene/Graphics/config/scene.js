import { Renderer } from "../core";

const map = (a, b) => [a * 0.5 / 1.78 + 0.5, -b * 0.5 + 0.5];

const config = {
  resolutions: [
    [820, 461],
    [1024, 576],
    [1280, 720],
    [1600, 900],
    [1920, 1080],
    [4096, 2160]
  ],
  scenes: [
    {
      shader: "scene1",
      name: "Lenses",
      posA: [0.5, 0.5],
      posB: [0.5, 0.5],
      spread: Renderer.SPREAD_POINT
    },
    {
      shader: "scene6",
      name: "Spheres",
      posA: map(-1.59, 0.65),
      posB: map(0.65, -0.75),
      spread: Renderer.SPREAD_BEAM
    },
    {
      shader: "scene7",
      name: "Playground",
      posA: [0.3, 0.52],
      posB: [0.3, 0.52],
      spread: Renderer.SPREAD_POINT
    },
    {
      shader: "scene4",
      name: "Prism",
      posA: [0.1, 0.65],
      posB: [0.4, 0.4],
      spread: Renderer.SPREAD_LASER
    },
    {
      shader: "scene5",
      name: "Cardioid",
      posA: [0.2, 0.5],
      posB: [0.2, 0.5],
      spread: Renderer.SPREAD_POINT
    },
    {
      shader: "scene3",
      name: "Cornell Box",
      posA: [0.5, 0.101],
      posB: [0.5, 0.2],
      spread: Renderer.SPREAD_AREA
    },
    {
      shader: "scene2",
      name: "Rough Mirror Spheres",
      posA: [0.25, 0.125],
      posB: [0.5, 0.66],
      spread: Renderer.SPREAD_LASER
    }
  ]
};

export default config;
