import { createSignal, onMount, Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import { bookmarks } from "../stores/bookmarks";
import * as d3 from "d3";

export default function CollapsibleTreeIsland() {
  const [hydrated, setHydrated] = createSignal(false);
  let svg  = null, tooltip = null;
    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const circleRadius = 15;

    // Hierarchical data
    const root = {
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
                { name: "Great‑Grandchild 1" },
                { name: "Great‑Grandchild 2" }
              ]
            }
          ]
        }
      ]
    };


  onMount(() => {
    setHydrated(true);
    // Create SVG container
    svg = d3.select("#tree-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip
    tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "lightyellow")
      .style("padding", "6px")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("font", "12px sans-serif")
      .style("opacity", 0);

    // Initial setup
    let i = 0;
    root.x0 = height / 2;
    root.y0 = 0;
    update(root);
  })
    // Tree layout
    const treemap = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const rootHierarchy = d3.hierarchy(root);
    const treeData = treemap(rootHierarchy);

    // Helper to create diagonal links
    function diagonal(s, d) {
      return `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`;
    }

    // Click to collapse/expand
    function click(event, d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }

    // Update function
    function update(source) {
      const nodes = treeData.descendants();
      const links = nodes.slice(1);

      // Set depth y positions
      nodes.forEach(d => { d.y = d.depth * 180; });

      // Bind nodes
      const node = svg.selectAll("node")
        .data(nodes, d => d.id || (d.id = ++i));

      const nodeEnter = node.enter().append("node")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on("click", click)
        .on("mouseover", (event, d) => {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html(d.data.name)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

      // Append circle
      nodeEnter.append("circle")
        .attr("r", circleRadius)
        .style("fill", d => (d._children ? "lightsteelblue" : "#fff"))
        .style("stroke", "#ccc")
        .style("stroke-width", "3px");

      // Append text
      const text = nodeEnter.append("text")
        .attr("dy", ".35em")
        .attr("x", d => (d.children || d._children) ? -13 : 13)
        .attr("text-anchor", d => (d.children || d._children) ? "end" : "start")
        .text(d => d.data.name)
        .style("fill-opacity", 1e-6)
        .on("dblclick", (event, d) => {
          const txt = d3.select(event.target);
          txt.style("display", "none");
          const input = d3.select(event.target.parentNode).append("foreignObject")
            .attr("width", 100)
            .attr("height", 30)
            .append("xhtml:input")
            .attr("value", d.data.name)
            .style("width", "90px")
            .style("font", "12px sans-serif")
            .style("padding", "2px")
            .node();
          input.focus();
          input.onblur = () => {
            d.data.name = input.value;
            txt.text(d.data.name).style("display", "block");
            d3.select(input.parentNode).remove();
            update(d);
          };
        });

      // Merge enter and update selections
      const nodeUpdate = nodeEnter.merge(node);
      nodeUpdate.transition()
        .duration(750)
        .attr("transform", d => `translate(${d.y},${d.x})`);

      // Update circle radius and fill
      nodeUpdate.select("circle")
        .attr("r", 8)
        .style("fill", d => (d._children ? "lightsteelblue" : "#fff"));

      // Update text visibility
      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      // Handle exit
      const nodeExit = node.exit().transition()
        .duration(750)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select("circle").attr("r", 1e-6);
      nodeExit.select("text").style("fill-opacity", 1e-6);

      // Links
      const link = svg.selectAll("path.link")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => diagonal({x: source.x0, y: source.y0}, {x: d.target.y0, y: d.target.x0}));

      const linkUpdate = linkEnter.merge(link);
      linkUpdate.transition()
        .duration(750)
        .attr("d", d => diagonal(d, d.parent));

      link.exit().transition()
        .duration(750)
        .attr("d", d => diagonal({x: d.source.x0, y: d.source.y0}, {x: d.source.x0, y: d.source.y0}))
        .remove();

      // Save positions for transition back
      nodes.forEach(d => {
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
