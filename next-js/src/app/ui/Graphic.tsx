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

const grid2 = () => {
  const s = (s: p5) => {
      let width = s.windowWidth
      let height = s.windowHeight;

      let gridSize = 30; // Size of each grid cell
      let cols = width / gridSize;
      let rows = height / gridSize;
      let elasticity = 35; // Factor for mouse movement influence

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
              let dx = 100 - x;
              let dy = 100 - y;
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
          
        };
  };
  const myP5 = new p5(s);
  myP5.remove;
  return (<div id='test'></div>)
}
const grid3 = () => {
const s = (s: p5) => {
    let width = s.windowWidth
    let height = s.windowHeight;

    let gridSize = 60; // Size of each grid cell
    let cols = width / gridSize;
    let rows = height / gridSize;
    let elasticity = 25; // Factor for mouse movement influence

    s.preload = () => {

    }
    s.setup = () => {
        s.createCanvas(width, height);

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
            let dx = 0.5 * s.mouseX - x;
            let dy = 0.5 * s.mouseY - y;
            let dist = s.sqrt(dx * dx + dy * dy);
      
            // Offset based on elasticity
            let offsetX = s.sin(s.frameCount * 0.05 + dist * 0.01) * elasticity +10;
            let offsetY = s.cos(s.frameCount * 0.01 + dist * 0.05) * elasticity +10;
      
            // Alternate colors
            if ((i + j) % 3 === 0) {
              s.fill(237, 157, 249); // Pink
            } else {
              s.fill(108, 92, 190); // Purple
            }
      
            // Draw the rectangle with offset
            s.rect(x + offsetX, y + offsetY, gridSize*5, gridSize*5);
            
          }
        }
      };
};
const myP5 = new p5(s);
myP5.remove;
return (<div id='test'></div>)
}
const grid4 = () => {
const s = (s: p5) => {
    let width = s.windowWidth
    let height = s.windowHeight;

    let gridSize = 30; // Size of each grid cell
    let cols = width / gridSize;
    let rows = height / gridSize;
    let elasticity = 35; // Factor for mouse movement influence

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
            let dx = s.mouseX - x;
            let dy = s.mouseY - y;
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
        
      };
};
const myP5 = new p5(s);
myP5.remove;
return (<div id='test'></div>)
}

const grid5 = () => {
const s = (s: p5) => {
    let width = s.windowWidth
    let height = s.windowHeight;

    let gridSize = 20; // Size of each grid cell
    let cols = width / gridSize;
    let rows = height / gridSize;
    let elasticity = 20; // Factor for mouse movement influence

    s.preload = () => {

    }
    s.setup = () => {
      let button = s.createButton('clear');
      button.position(0, 100);


      button.mousePressed(s.remove);
        s.createCanvas(width, height);
        s.background(0)
        s.noStroke();
        s.frameRate(120)

    };
    s.windowResized = () =>{
      s.resizeCanvas(s.windowWidth, s.windowHeight);
    }
    /* s.mouseClicked = () => {
      s.remove()
    } */
    s.draw = () => {
        s.background(61,53,100); // Black background
        
        // Loop through the grid
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            // Calculate x, y position
            let x = i * gridSize;
            let y = j * gridSize;
      
            // Calculate offset based on mouse position
            let dx = -0.05*s.mouseX - x ;
            let dy = 0.1 *s.mouseY - y ;
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
        
      };
};


const myP5 = new p5(s);
myP5.remove;
return (<div id='test'></div>)
}

const grid6 = () => {
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

const grid7 = () => {
  const s = (s: p5) => {
      let width = s.windowWidth
      let height = s.windowHeight;

      let gridSize = 30; // Size of each grid cell
      let cols = width / gridSize;
      let rows = height / gridSize;
      let elasticity = 35; // Factor for mouse movement influence

      s.preload = () => {

      }
      s.windowResized = () =>{
        s.resizeCanvas(s.windowWidth, s.windowHeight);
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
              let dx = (width/2) - x;
              let dy = (height/2) - y;
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
          
        };
  };
  const myP5 = new p5(s);
  myP5.remove;
  return (<div id='test'></div>)
}

const Backround = grid7

export default Backround;

