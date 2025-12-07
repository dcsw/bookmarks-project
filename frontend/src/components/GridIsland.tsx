import { useStore } from "@nanostores/solid";
import { bookmarks } from "../stores/bookmarks";

export default function GridIsland() {
  const items = useStore(bookmarks);

  // Helper to format cell values based on their type
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "";

    // Boolean values
    if (typeof value === "boolean") return value ? "Yes" : "No";

    // Number values
    if (typeof value === "number") {
      return new Intl.NumberFormat().format(value);
    }

    // String values
    if (typeof value === "string") {
      // Try to parse as a date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(date);
      }

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
                  <td key={key}>{formatValue(item[key])}</td>
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
