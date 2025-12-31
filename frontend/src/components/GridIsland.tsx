import { createSignal, onMount, Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import { bookmarks } from "../stores/bookmarks";

export default function GridIsland() {
  const items = useStore(bookmarks);
  const [hydrated, setHydrated] = createSignal(false);

  onMount(() => {
    setHydrated(true);
  });

  const safeItems = () => (Array.isArray(items()) ? items() : []);

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return "";

    if (
      key.toLowerCase().includes("icon_base64") &&
      typeof value === "string"
    ) {
      return (
        <img
          src={value}
          alt="icon"
          style={{ maxWidth: "32px", maxHeight: "32px" }}
        />
      );
    }

    if (key.toLowerCase().includes("date")) {
      const date = new Date(value * 1000);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(date);
      }
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (typeof value === "number") {
      return new Intl.NumberFormat().format(value);
    }

    if (typeof value === "string") {
      if (/^https?:\/\//i.test(value)) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      }

      return value;
    }

    return String(value);
  };

  return (
    <Show when={hydrated()} fallback={<div>No bookmarks yet</div>}>
      {safeItems().length > 0 && safeItems()[0] ? (
        <table className="grid-table">
          <thead>
            <tr>
              {Object.keys(safeItems()[0]).map((key, index) => (
                <th key={key + index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeItems().map((item, index) => (
              <tr key={index}>
                {Object.keys(item).map((key2) => (
                  <td key={key2}>{formatValue(key2, item[key2])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No bookmarks yet</div>
      )}
    </Show>
  );
}
