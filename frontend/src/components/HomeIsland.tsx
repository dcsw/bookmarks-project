import { createSignal } from "solid-js";

export default function HomeIsland() {
  const [count, setCount] = createSignal(0);
  return (
    <div>
      <h2>Welcome to the Home Page!</h2>
      <p>Click the button to increment the counter.</p>
      <button onClick={() => setCount(count() + 1)}>Clicked {count()} times</button>
    </div>
  );
}
