import { createSignal, onMount, Show } from "solid-js";
import * as d3 from "d3";

export default function CollapsibleTreeIsland() {
  const [hydrated, setHydrated] = createSignal(false);
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLElement, unknown, null, undefined>;
  const [circleSize] = createSignal(12); // state var for circle radius

  const width = 928;
  const height = 500;
  const margin = { top: 10, right: 10, bottom: 10, left: 40 };
  const dy = 100; // vertical separation between nodes
  const dx = 150; // horizontal separation between nodes

  // Sample hierarchical data
  const data = {
    name: "Root",
    children: [
      { name: "Child 1"},
      {
        name: "Child 2",
        children: [{ name: "Grandchild 1" }, { name: "Grandchild 2" }],
      },
      {
        name: "Child 3",
        children: [
          { name: "Grandchild 3" },
          {
            name: "Grandchild 4",
            children: [
              { name: "Great-Grandchild 1" },
              { name: "Great-Grandchild 2" },
            ],
          },
        ],
      },
    ],
  };

  // Create hierarchy and tree layout
  const root = d3.hierarchy(data);
  const tree = d3.tree().nodeSize([dx, dy]);
  const diagonal = d3
    .linkHorizontal()
    .x((d: any) => d.y)
    .y((d: any) => d.x);

  // Helper to create a curved diagonal path
  function makeDiagonal(s: any, d: any): string {
    const pathX = (s.x + d.x) / 2;
    const pathY = (s.y + d.y) / 2;
    return `M ${s.y} ${s.x} C ${pathX} ${s.x}, ${pathX} ${d.x}, ${d.y} ${d.x}`;
  }

  onMount(() => {
    setHydrated(true);

    // Wait a tick to ensure the #tree-svg element is added to the DOM
    Promise.resolve().then(() => {
      const container = document.getElementById("tree-svg");
      if (!container) return;

      // Create SVG element if it doesn't exist yet
      let svgElement = container.querySelector("svg");
      svg = d3.select(svgElement);

      // Set initial SVG attributes
      svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("font", "10px sans-serif")
        .style("user-select", "none")
        .style("display", "block")
        .style("margin", "0 auto")
        .style("border", "1px solid #ccc");

      // Create tooltip for hover info
      tooltip = d3
        .select("body")
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
      root.x0 = margin.left;
      const totalContentHeight = height - margin.top - margin.bottom;
      root.y0 = totalContentHeight / 2; // center vertically within the content area
      // root.eachBefore((d: any) => {
      //   d.x0 = d.x;
      //   d.y0 = d.y;
      // });
      update(root);
    });
  });

  // Collapse internal nodes
  function collapse(d: any) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  // Update diagram with new layout
  function update(source: any) {
    // Compute new tree layout
    const rootLayout = d3.hierarchy(data);
    const treeLayout = tree(rootLayout);
    const nodes = treeLayout.descendants();
    const links = treeLayout.links();

    // Normalize depths for fixed vertical spacing
    nodes.forEach((d: any) => (d.y = d.depth * dx + margin.top));

    // ----- Links -----
    const link = svg.selectAll("path.link").data(links, (d: any) => d.target.id);

    link
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .attr("d", (d: any) => makeDiagonal(d.source, d.target));

    link
      .transition()
      .duration(750)
      .attr("d", (d: any) => makeDiagonal(d.source, d.target));

    link.exit().remove();

    // ----- Nodes -----
    const node = svg
      .selectAll("g.node")
      .data(nodes, (d: any) => d.id || (d.id = ++source.i));

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`)
      .on("click", (event, d: any) => {
        click(event, d);
      })
      .on("mouseover", (event, d: any) => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip
          .html(d.data.name)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Circle for each node
    nodeEnter
      .append("circle")
      .attr("r", circleSize())
      .style("fill", (d: any) => (d._children ? "#555" : "#999"))
      .style("stroke", "#fff")
      .style("stroke-width", 3);

    // Text label for each node
    nodeEnter
      .append("text")
      .attr("dx", 4)
      .attr("x", (d: any) => (d._children ? -6 : 6))
      .attr("text-anchor", (d: any) => (d._children ? "end" : "start"))
      .text((d: any) => d.data.name)
      .style("fill", "#555")
      .style("pointer-events", "none");

    // Merge updates with transition
    const nodeUpdate = node.merge(nodeEnter);
    nodeUpdate
      .transition()
      .duration(750)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // Update circle fill/color after transition
    nodeUpdate
      .select("circle")
      .attr("r", circleSize())
      .style("fill", (d: any) => (d._children ? "#555" : "#999"));

    // Update text visibility
    nodeUpdate.select("text").style("fill-opacity", 1);

    // Exit nodes
    const nodeExit = node.exit()
      .transition()
      .duration(750)
      .attr("transform", (d: any) => `translate(${source.y},${source.x})`)
      .remove();

    // Save current positions for transition back
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click
  function click(event: any, d: any) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  return (
    <Show when={hydrated()} fallback={<div>Loading…</div>}>
      <div id="tree-svg">
        <svg></svg>
      </div>
    </Show>
  );
}
