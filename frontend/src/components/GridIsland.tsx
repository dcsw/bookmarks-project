import { useStore } from "@nanostores/solid";
import { bookmarks } from "../stores/bookmarks";

export default function GridIsland() {
  const items = useStore(bookmarks);

  // Helper to format cell values based on their type and column name
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return "";

    // If the column name contains "date", try to format as a date
    if (key.toLowerCase().includes("date")) {
      const date = new Date(value * 1000); // secs to msecs
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(date);
      }
    }

    // Boolean values
    if (typeof value === "boolean") return value ? "Yes" : "No";

    // Number values
    if (typeof value === "number") {
      return new Intl.NumberFormat().format(value);
    }

    // String values
    if (typeof value === "string") {
      // Try to render URLs as links
      if (/^https?:\/\//i.test(value)) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      }

      return value;
    }

    // Fallback for other types
    return String(value);
  };

  return (
    <>
      {items().length > 0 && items()[0] ? (
        <table className="grid-table">
          <thead>
            <tr>
              {Object.keys(items()[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items().map((item: any, index: number) => (
              <tr key={index}>
                {Object.keys(item).map((key) => (
                  <td key={key}>{formatValue(key, item[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No bookmarks yet</div>
      )}
    </>
  );
}
