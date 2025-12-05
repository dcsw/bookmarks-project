import { JSX } from 'solid-js';

export interface Props {
  items?: any[];
}

export default function GridIsland({ items }: Props): JSX.Element {
  return (
    <>
      {items && items.length > 0 ? (
        <table class="grid-table">
          <thead>
            <tr>
              {Object.keys(items[0]).map((key) => (
                <th>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr>
                {Object.keys(item).map((key) => (
                  <td>{item[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <slot />
      )}
    </>
  );
}
