"use client"
import * as React from 'react'
import p5 from 'p5';

const dots = () => {
    const s = (s: p5) => {
        let width = s.windowWidth
        let height = s.windowHeight * 0.86;
        let trueHeight = s.windowHeight;

        let flower = {
            x: 200,
            y: 100,
            emoji: '🌸'
        };
        let myFlower = createFlower();
        let x = 0
        let y = 0
        function createFlower() {
            // Define a flower object.
            let flower = {
                x: s.random(0, width),
                y: s.random(0, height),
                size: s.random(20, 75),
                lifespan: s.random(255, 300),
                color: s.color(s.random(255), s.random(255), s.random(255)),
            };
            // Return the flower object.
            return flower;
        }

        s.preload = () => {

        }
        s.setup = () => {
            s.createCanvas(width, height);
            s.background(255);
            s.frameRate(4)

        };

        s.draw = () => {
            let flowers = ["Rose", "Daisy", "Tulip"];
            s.text(flower.emoji, flower.x, flower.y);

            s.ellipse(myFlower.x, myFlower.y, myFlower.size);
            s.text(flower.emoji, flower.x, flower.y);
            for (let i = 0; i < 3; i += 1) {
                let myFlower = createFlower();
                s.ellipse(myFlower.x, myFlower.y, myFlower.size);
                s.fill(myFlower.color);
                s.text(flower.emoji, flower.x, flower.y);
                s.remove
            }

        };
    };
    const myP5 = new p5(s);
    myP5.remove;
    return (<div id='test'></div>)
}
const grid = () => {
    const s = (s: p5) => {
        let width = s.windowWidth
        let height = s.windowHeight * 0.86;
        let trueHeight = s.windowHeight;


        s.preload = () => {

        }
        s.setup = () => {
            s.createCanvas(width, height);
            s.background(0)
            s.noStroke();

        };

        s.draw = () => {
            s.background(0); // Black background
  
  let pixelSize = 10; // Size of each "pixel"
  let offset = s.int((s.mouseX / width) * pixelSize); // Offset based on mouseX
  
  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      // Calculate new position with a wrap-around effect
      let newX = (x + offset) % width;
      
      // Alternate between pink and purple colors
      if ((x + y) % 20 === 0) {
        s.fill(255, 20, 147); // Pink
      } else {
        s.fill(128, 0, 128); // Purple
      }
      
      s.rect(newX, y, pixelSize, pixelSize); // Draw the "pixel"
    }
  }
        };
    };
    const myP5 = new p5(s);
    myP5.remove;
    return (<div id='test'></div>)
}


const Backround = grid
export default Backround;

