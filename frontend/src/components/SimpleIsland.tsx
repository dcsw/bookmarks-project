import { createSignal, onMount } from "solid-js";

export default function SimpleIsland() {
  const [color, setColor] = createSignal('#4CAF50');

  onMount(() => {
    const interval = setInterval(() => {
      setColor(prev => {
        const colors = ['#4CAF50', '#FFBF00', '#F44336', '#4CAF50'];
        const idx = (colors.indexOf(prev) + 1) % colors.length;
        return colors[idx];
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <svg
      width="200"
      height="200"
      style="border:1px solid #ccc; display:block; margin:0 auto;"
    >
      <circle cx="100" cy="100" r="80" fill={color()} />
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
