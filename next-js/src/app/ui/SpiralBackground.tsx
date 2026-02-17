"use client";
import p5 from "p5";
import P5Background from "./P5Background";

export const spiralSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  let gridSize = 30;
  let cols = width / gridSize;
  let rows = height / gridSize;
  let elasticity = 35;

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    cols = width / gridSize;
    rows = height / gridSize;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(0);
    s.noStroke();
  };

  s.draw = () => {
    s.background(61, 53, 100);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * gridSize;
        let y = j * gridSize;

        let dx = width / 2 - x;
        let dy = height / 2 - y;
        let dist = s.sqrt(dx * dx + dy * dy);

        let offsetX = s.sin(s.frameCount * 0.01 + dist * 0.05) * elasticity;
        let offsetY = s.cos(s.frameCount * 0.01 + dist * 0.05) * elasticity;

        if ((i + j) % 2 === 0) {
          s.fill(237, 157, 249); // Pink
        } else {
          s.fill(108, 92, 190); // Purple
        }

        s.rect(x + offsetX, y + offsetY, gridSize, gridSize);
      }
    }
  };
};

const SpiralBackground = () => {
  return <P5Background sketch={spiralSketch} />;
};

export default SpiralBackground;
