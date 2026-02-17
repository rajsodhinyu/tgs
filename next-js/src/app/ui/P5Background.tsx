"use client";
import { useEffect, useRef } from "react";
import p5 from "p5";

type Sketch = (s: p5) => void;

const P5Background = ({ sketch }: { sketch: Sketch }) => {
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketch]);

  return <div id="p5-background"></div>;
};

export default P5Background;
