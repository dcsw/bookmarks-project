import { createSignal, onMount, Show } from "solid-js";
import { bookmarks } from "../stores/bookmarks";
import * as d3 from "d3";

export default function CollapsibleTreeIsland() {
  const [hydrated, setHydrated] = createSignal(false);
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLElement, unknown, null, undefined>;

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

  // Tree layout and update logic
  const treemap = d3.tree().size([
    height - margin.top - margin.bottom,
    width - margin.left - margin.right
  ]);

  function update(source: any) {
    const nodes = treemap(root)!.descendants();
    const links = nodes.slice(1);

    // Set depth y positions
    nodes.forEach((d: any) => {
      d.y = d.depth * 180;
    });

    // Bind nodes
    const node = svg.selectAll("g.node").data(nodes, (d: any) => d.id || (d.id = ++i));

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d: any) => `translate(${source.y0},${source.x0})`
      )
      .on("click", (event, d: any) => click(event, d))
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

    // Append circle
    nodeEnter
      .append("circle")
      .attr("r", circleRadius)
      .style("fill", (d: any) => (d._children ? "lightsteelblue" : "#fff"))
      .style("stroke", "#ccc")
      .style("stroke-width", "3px");

    // Append text
    const text = nodeEnter
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => (d.children || d._children) ? -13 : 13)
      .attr("text-anchor", (d: any) => (d.children || d._children) ? "end" : "start")
      .text((d: any) => d.data.name)
      .style("fill-opacity", 1e-6)
      .on("dblclick", (event, d: any) => {
        const txt = d3.select(event.target);
        txt.style("display", "none");
        const input = d3
          .select(event.target.parentNode)
          .append("foreignObject")
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

    // Merge enter & update selections
    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate
      .transition()
      .duration(750)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // Update circle radius & fill
    nodeUpdate
      .select("circle")
      .attr("r", 8)
      .style("fill", (d: any) => (d._children ? "lightsteelblue" : "#fff"));

    // Update text visibility
    nodeUpdate.select("text").style("fill-opacity", 1);

    // Handle exit
    const nodeExit = node.exit()
      .transition()
      .duration(750)
      .attr("transform", (d: any) => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select("circle").attr("r", 1e-6);
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // Links
    const link = svg.selectAll("path.link").data(links, (d: any) => d.target.id);

    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr(
        "d",
        (d: any) =>
          `M ${source.y0} ${source.x0} C ${(source.y0 + d.target.y0) / 2} ${source.x0}, ${(source.y0 + d.target.y0) / 2} ${d.target.x0}, ${d.target.y0} ${d.target.x0}`
      );

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
      .transition()
      .duration(750)
      .attr("d", (d: any) => `M ${d.y0} ${d.x0} C ${(d.y0 + d.parent.y0) / 2} ${d.x0}, ${(d.y0 + d.parent.y0) / 2} ${d.parent.x0}, ${d.parent.y0} ${d.parent.x0}`);

    link.exit().transition().duration(750).remove();

    // Save positions for transition back
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

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

  onMount(() => {
    setHydrated(true);

    // Ensure the target container exists
    const container = document.getElementById("tree-svg");
    if (!container) return;

    // Bind the SVG element inside #tree-svg directly
    svg = d3.select(container);

    // If the SVG element does not exist, create it
    if (svg.node() == null) {
      const svgNS = "http://www.w3.org/2000/svg";
      const svgElement = document.createElementNS(svgNS, "svg");
      svgElement.setAttribute("width", width + margin.left + margin.right);
      svgElement.setAttribute("height", height + margin.top + margin.bottom);
      container.appendChild(svgElement);
      svg = d3.select(svgElement);
    }

    // Tooltip
    tooltip = d3
      .select("body")
      .append("div")
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
  });

  return (
    <Show when={hydrated()} fallback={<div>Loading…</div>}>
      <div id="tree-svg" />
    </Show>
  );
}
