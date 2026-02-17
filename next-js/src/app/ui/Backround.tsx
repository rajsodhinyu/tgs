"use client";
import p5 from "p5";
import P5Background from "./P5Background";

export const gridSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  let gridSize = 30;
  let cols = width / gridSize;
  let rows = height / gridSize;

  s.preload = () => {};
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
    s.background(26, 27, 35);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * gridSize;
        let y = j * gridSize;

        let dx = width / 1 - x;
        let dy = height / 2 - y;
        let dist = s.sqrt(dx * dx + dy * dy);

        let offsetX = s.atan(s.frameCount * 0.01 + dist);
        let offsetY = s.tan(s.frameCount * 0.01 + dist);

        if ((i + j) % 5 === 0) {
          s.fill(237, 157, 249); // Pink
        } else {
          s.fill(108, 92, 190); // Purple
        }

        let dial = s.map(
          s.sin(s.frameCount * 0.01),
          -1,
          1,
          0.01,
          0.1,
          true,
        );
        s.rect(x + offsetX, y + offsetY, gridSize * dial, gridSize);
      }
    }
  };
};

const Backround = () => {
  return <P5Background sketch={gridSketch} />;
};

export default Backround;
