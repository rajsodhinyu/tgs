"use client";
import * as React from "react";
import p5 from "p5";
let img = (
  <img
    className="h-16 md:h-28 min-w-10"
    src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
  />
);

const dials = () => {
  const s = (s: p5) => {
    let width = s.windowWidth;
    let height = s.windowHeight;

    let gridSize = 30; // Size of each grid cell
    let cols = width / gridSize;
    let rows = height / gridSize;
    let elasticity = 35; // Factor for mouse movement influence

    s.preload = () => {};
    s.windowResized = () => {
      s.resizeCanvas(s.windowWidth, s.windowHeight);
      width = s.windowWidth;
      height = s.windowHeight;
    };

    s.setup = () => {
      s.createCanvas(width, height);
      s.background(0);
      s.noStroke();
    };

    s.draw = () => {
      s.background(26, 27, 35); // Black background
      let path = s.getURLPath();
      s.text(path.toString(), width / 2, height / 2);
      if (path.toString() == "") {
        // Loop through the grid
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            // Calculate x, y position
            let x = i * gridSize;
            let y = j * gridSize;

            // Calculate offset based on mouse position
            let dx = width / 1 - x;
            let dy = height / 2 - y;
            let dist = s.sqrt(dx * dx + dy * dy);

            // Offset based on elasticity
            let offsetX = s.atan(s.frameCount * 0.01 + dist);
            let offsetY = s.tan(s.frameCount * 0.01 + dist);
            //let offsetX = s.atan(s.frameCount * 0.01 + dist * 0.1);
            // let offsetY = s.tan(s.frameCount * 0.001 + dist * 0.03);

            // Alternate colors
            if ((i + j) % 5 === 0) {
              s.fill(237, 157, 249); // Pink
            } else {
              s.fill(108, 92, 190); // Purple
            }

            // Draw the rectangle with offset
            let dial = s.map(
              s.sin(s.frameCount * 0.01),
              -1,
              1,
              0.01,
              0.1,
              true,
            );
            // s.frameCount * 0.01 * 0.05
            s.rect(x + offsetX, y + offsetY, gridSize * dial, gridSize);
          }
        }
      } else {
        s.remove();
      }
    };
  };
  const myP5 = new p5(s);
  myP5.remove;
  return <div id="test"></div>;
};

const Backround = dials;

export default Backround;
