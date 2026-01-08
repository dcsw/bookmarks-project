import { createSignal, onMount, Show } from "solid-js";
import * as d3 from "d3";

export default function CollapsibleTreeIsland() {
  const [hydrated, setHydrated] = createSignal(false);
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLElement, unknown, null, undefined>;

  const width = 928;
  const margin = { top: 10, right: 10, bottom: 10, left: 40 };
  const dx = 10; // vertical separation between nodes
  const dy = 150; // horizontal separation between nodes

  // Sample hierarchical data
  const data = {
    name: "Root",
    children: [
      { name: "Child 1" },
      {
        name: "Child 2",
        children: [
          { name: "Grandchild 1" },
          { name: "Grandchild 2" }
        ]
      },
      {
        name: "Child 3",
        children: [
          { name: "Grandchild 3" },
          {
            name: "Grandchild 4",
            children: [
              { name: "Great-Grandchild 1" },
              { name: "Great-Grandchild 2" }
            ]
          }
        ]
      }
    ]
  };

  // Create hierarchy and tree layout
  const root = d3.hierarchy(data);
  const tree = d3.tree().nodeSize([dx, dy]);
  const diagonal = d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x);

  onMount(() => {
    setHydrated(true);

    // Ensure the container exists
    const container = document.getElementById("tree-svg");
    if (!container) return;

    // Create SVG element if it doesn't exist yet
    let svgElement = container.querySelector("svg");
    if (!svgElement) {
      const svgNS = "http://www.w3.org/2000/svg";
      svgElement = document.createElementNS(svgNS, "svg");
      container.appendChild(svgElement);
    }
    svg = d3.select(svgElement);

    // Set initial SVG attributes
    svg.attr("width", width)
      .style("font", "10px sans-serif")
      .style("user-select", "none");

    // Create tooltip
    tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "lightyellow")
      .style("padding", "6px")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("font", "12px sans-serif")
      .style("opacity", 0);

    // Initialize root position and start update
    root.x0 = margin.top;
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    update(root);
  });

  function update(source: any) {
    const nodes = tree(root)!.descendants();
    const links = tree(root)!.links();

    // Compute required height and update viewBox
    const height = nodes.length * dy + margin.top + margin.bottom;
    svg.attr("height", height)
      .attr("viewBox", `-${margin.left} -${margin.top} ${width} ${height}`);

    // ----- Links -----
    const link = svg.selectAll("path.link")
      .data(links, (d: any) => d.target.id);

    link.enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        const o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    link.transition()
      .duration(750)
      .attr("d", diagonal);

    link.exit().remove();

    // ----- Nodes -----
    const node = svg.selectAll("g.node")
      .data(nodes, (d: any) => d.id || (d.id = ++source.i));

    const nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y0},${d.x0})`)
      .on("click", (event, d: any) => {
        d.children = d.children ? null : d._children;
        update(d);
      })
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(d.data.name)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Circle for each node
    nodeEnter.append("circle")
      .attr("r", 6)
      .style("fill", d => d._children ? "#555" : "#999")
      .style("stroke", "#fff")
      .style("stroke-width", 3);

    // Text label for each node
    nodeEnter.append("text")
      .attr("dy", 4)
      .attr("x", d => d._children ? -6 : 6)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text(d => d.data.name)
      .style("fill", "#555")
      .style("pointer-events", "none");

    // Merge updates with transition
    const nodeUpdate = node.merge(nodeEnter);
    nodeUpdate.transition()
      .duration(750)
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Exit nodes
    const nodeExit = node.exit()
      .transition()
      .duration(750)
      .attr("transform", d => `translate(${source.y},${source.x})`)
      .remove();

    // Save current positions for transition back
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  return (
    <Show when={hydrated()} fallback={<div>Loading…</div>}>
      <div id="tree-svg" />
    </Show>
  );
}
