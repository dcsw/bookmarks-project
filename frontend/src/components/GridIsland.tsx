// GridIsland.tsx
import { useStore } from "@nanostores/solid";
import { bookmarks } from "../stores/bookmarks";

export default function GridIsland() {
  const items = useStore(bookmarks);

  return (
    <>
      {items().length > 0 && items()[0] ? (  // ✅ Guard both length AND first item
        <table className="grid-table">
          <thead>
            <tr>
              {Object.keys(items()[0]).map((key) => (
                <th key={key}>{key}</th>  // ✅ Add key
              ))}
            </tr>
          </thead>
          <tbody>
            {items().map((item: any, index: number) => (
              <tr key={index}>  {/* ✅ Add key */}
                {Object.keys(item).map((key) => (
                  <td key={key}>{item[key]}</td>  // ✅ Add key
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No bookmarks yet</div>  // ✅ Better empty state
      )}
    </>
  );
}
