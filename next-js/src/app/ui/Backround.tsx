"use client";
import * as React from "react";
import { useEffect, useRef } from "react";
import p5 from "p5";

const Backround = () => {
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    const s = (s: p5) => {
      let width = s.windowWidth;
      let height = s.windowHeight;

      let gridSize = 30; // Size of each grid cell
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
        s.background(26, 27, 35); // Black background
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
            s.rect(x + offsetX, y + offsetY, gridSize * dial, gridSize);
          }
        }
      };
    };

    p5InstanceRef.current = new p5(s);

    // Cleanup function to remove p5 instance when component unmounts
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return <div id="test"></div>;
};

export default Backround;
