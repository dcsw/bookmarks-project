import { onMount } from "solid-js";
import * as d3 from "d3";

export default function SimpleIsland() {
  const colors = ['#4CAF50', '#FFBF00', '#F44336', '#4CAF50'];
  let index = 0;

  onMount(() => {
    const timer = d3.interval(() => {
      index = (index + 1) % colors.length;
      const svg = document.querySelector('svg');
      if (svg) {
        const circle = svg.querySelector('circle');
        if (circle) {
          circle.setAttribute('fill', colors[index]);
        }
      }
    }, 1000); // 1000 ms interval
    return () => timer.stop();
  });

  return (
    <svg
      width="200"
      height="200"
      style="border:1px solid #ccc; display:block; margin:0 auto;"
    >
      <circle cx="100" cy="100" r="80" fill="#4CAF50" />
      <text
        x="100"
        y="115"
        text-anchor="middle"
        font-size="14"
        fill="#fff"
        font-family="system-ui, sans-serif"
      >
        Hello!
      </text>
    </svg>
  );
}
