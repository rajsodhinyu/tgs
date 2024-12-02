"use client"
import * as React from 'react'
import p5 from 'p5';

export const MyComp = () => {
    if (typeof window !== null) 
        {const s = (s: p5) => {
            let width = 1000
            let height = 1000 * 0.86;
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
                s.createCanvas(width,height);
                s.background(0);
                s.frameRate(1);


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
        myP5.remove;}
        return(<div></div>)
}