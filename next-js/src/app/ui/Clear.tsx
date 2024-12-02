"use client"
import * as React from 'react'
import p5 from 'p5';
import Backround from './Backround';

const clearcomp = () => {
  const s = (s: p5) => {
      let width = s.windowWidth
      let height = s.windowHeight;

      let gridSize = 100; // Size of each grid cell
      let cols = width / gridSize;
      let rows = height / gridSize;
      let elasticity = 10; // Factor for mouse movement influence

      s.preload = () => {

      }
      s.setup = () => {
          s.createCanvas(width, height);
          s.background(0)
          s.noStroke();

      };

      s.draw = () => {
          s.background(61,53,100); // Black background
         
          // Loop through the grid
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              // Calculate x, y position
              let x = i * gridSize;
              let y = j * gridSize;
        
              // Calculate offset based on mouse position
              let dx = 0.1*s.mouseX - x - 1000;
              let dy = 0.1*s.mouseY - y - 1000;
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
  return (<div id='test'></div>)
}

const clear2 = () => {
  
  const clearFunc = () => {
    alert("test?")
  }
  return(<div><button onClick={() => clearFunc()}> Button</button></div>)
}

const Clear = clear2
export default Clear;

