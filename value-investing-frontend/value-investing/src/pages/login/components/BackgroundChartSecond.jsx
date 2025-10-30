import React, { useEffect, useRef } from "react";

function BackgroundChartSecond() {
  const candleContainerRef = useRef(null);

  useEffect(() => {
    const candleContainer = candleContainerRef.current;
    const candleWidth = 50;
    const candleSpacing = 70;
    let x = 60 + candleSpacing;

    for (let i = 1; i < 20; i++) {
      const open = 50 + i * 25 + Math.random() * 50;
      const close = open + 40 + Math.random() * 80;
      const high = close + Math.random() * 60;
      const low = open - Math.random() * 30;

      const candle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      candle.setAttribute("transform", `translate(${x} 0)`);

      const wick = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      wick.setAttribute("x1", "0");
      wick.setAttribute("x2", "0");
      wick.setAttribute("y1", low);
      wick.setAttribute("y2", high);
      candle.appendChild(wick);

      const body = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      body.setAttribute("fill", "rgb(79 70 229)");
      body.setAttribute("height", close - open);
      body.setAttribute("rx", "5");
      body.setAttribute("width", candleWidth);
      body.setAttribute("x", -candleWidth / 2);
      body.setAttribute("y", open);
      candle.appendChild(body);

      candleContainer.appendChild(candle);
      x += candleSpacing;
    }
  }, []);

    return (
      <div className="background-chart">
        <svg
          className="w-full h-full opacity-30"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1440 700"
          xmlns="http://www.w3.org/2000/svg">
          <g
            stroke="rgb(79 70 229)"
            strokeWidth="4"
            transform="translate(0, 700) scale(1, -1)">
            <g transform="translate(60, 0)" ref={candleContainerRef}>
              <line x1="0" x2="0" y1="80" y2="250"></line>
              <rect
                fill="rgb(79 70 229)"
                height="170"
                rx="5"
                width="70"
                x="-35"
                y="80"
                style={{ transform: "scaleY(1.3)", transformOrigin: "bottom" }}
              />
              <foreignObject
                height="280"
                width="70"
                x="-35"
                y="80"
                style={{ transform: "scaleY(1.3)", transformOrigin: "bottom" }}>
                <div className="w-full h-full overflow-hidden relative">
                  <div className="candle-shimmer"></div>
                </div>
              </foreignObject>
            </g>
          </g>
        </svg>
      </div>
    );
}

export default BackgroundChartSecond;
