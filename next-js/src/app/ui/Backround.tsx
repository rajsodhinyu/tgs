"use client";

import * as React from "react";
import p5 from "p5";

const checkerboard = () => {
  const s = (s: p5) => {
    let width = s.windowWidth;
    let height = s.windowHeight;

    let gridSize = 90; // Size of each grid cell
    let cols = width / gridSize;
    let rows = height / gridSize;
    let elasticity = 10; // Factor for mouse movement influence

    s.preload = () => {};
    s.setup = () => {
      s.createCanvas(width, height);
      s.background(0);
      s.noStroke();
    };

    s.draw = () => {
      s.background(61, 53, 100); // Black background

      // Loop through the grid
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Calculate x, y position
          let x = i * gridSize;
          let y = j * gridSize;

          // Calculate offset based on mouse position
          let dx = 0.1 * s.mouseX - x - 1000;
          let dy = 0.1 * s.mouseY - y - 1000;
          let dist = s.sqrt(dx * dx + dy * dy);

          // Offset based on elasticity
          let offsetX = s.cos(s.frameCount * 0.01 + dist * 0.2) * elasticity;
          let offsetY = s.cos(s.frameCount * 0.01 + dist * 0.2) * elasticity;

          // Alternate colors
          if ((i + j) % 2 === 0) {
            s.fill(237, 157, 249); // Pink
          } else {
            s.fill(108, 92, 190); // Purple
          }
          // Draw the rectangle with offset
          s.rect(x + offsetX, y + offsetY, gridSize, gridSize);
        }
      }
    };
  };
  const myP5 = new p5(s);
  myP5.remove;
  return <div id="test"></div>;
};

const spiral = () => {
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
      s.background(61, 53, 100); // Black background
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
            let dx = width / 2 - x;
            let dy = height / 2 - y;
            let dist = s.sqrt(dx * dx + dy * dy);

            // Offset based on elasticity
            let offsetX = s.sin(s.frameCount * 0.01 + dist * 0.05) * elasticity;
            let offsetY = s.cos(s.frameCount * 0.01 + dist * 0.05) * elasticity;

            // Alternate colors
            if ((i + j) % 2 === 0) {
              s.fill(237, 157, 249); // Pink
            } else {
              s.fill(108, 92, 190); // Purple
            }

            // Draw the rectangle with offset
            s.rect(x + offsetX, y + offsetY, gridSize, gridSize);
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

const dials = () => {
  const s = (s: p5) => {
    let width = s.windowWidth;
    let height = s.windowHeight;

    let gridSize = 40; // Size of each grid cell
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
      {
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
      }
    };
  };
  const myP5 = new p5(s);
  myP5.remove;
  return <div id="test"></div>;
};

const takingOff = () => {
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
      s.background(61, 53, 100); // Black background
      let path = s.getURLPath();
      s.text(path.toString(), width / 2, height / 2);
      if (path.toString() == "") {
        // Loop through the grid
        for (let i = 0; i < cols / 2; i++) {
          for (let j = 0; j < rows; j++) {
            // Calculate x, y position
            let x = i * gridSize;
            let y = j * gridSize;

            // Calculate offset based on mouse position
            let dx = width / 2 - x;
            let dy = height / 2 - y;
            let dist = s.sqrt(dx * dx + dy * dy);

            // Offset based on elasticity
            let offsetX = s.tan(s.frameCount * 0.01 + dist) * elasticity;
            let offsetY = s.atan(s.frameCount * 0.01 + dist) * elasticity;

            // Alternate colors
            if ((i + j) % 2 === 0) {
              s.fill(237, 157, 249); // Pink
            } else {
              s.fill(108, 92, 190); // Purple
            }

            // Draw the rectangle with offset
            s.rect(x + offsetX, y + offsetY, gridSize, gridSize);
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
