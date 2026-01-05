import { createSignal, onMount, Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import { bookmarks } from "../stores/bookmarks";
import * as d3 from "d3";

export default function CollapsibleTreeIsland() {
  const items = useStore(bookmarks);
  const [hydrated, setHydrated] = createSignal(false);
  const [treeData, setTreeData] = createSignal<any>(null);
  const [i, setI] = createSignal(0);

  onMount(() => {
    setHydrated(true);

    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

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

    const treemap = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const rootHierarchy = d3.hierarchy(root);
    const tree = treemap(rootHierarchy);
    setTreeData(tree);

    const svg = d3.select("#tree-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "lightyellow")
      .style("padding", "6px")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("font", "12px sans-serif")
      .style("opacity", 0);

    function diagonal(s, d) {
      return `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`;
    }

    function click(event, d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      // Simple re‑update; in a full implementation you would recompute the layout here.
      update(d);
    }

    function update(source) {
      const nodes = treeData()?.descendants() ?? [];
      const links = nodes.slice(1);

      nodes.forEach(d => { d.y = d.depth * 180; });

      const node = d3.select("#tree-svg").selectAll("g.node")
        .data(nodes, d => d.id || (d.id = ++i));

      const nodeEnter = node.enter().append("g")
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

      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", d => (d._children ? "lightsteelblue" : "#fff"))
        .style("stroke", "#ccc")
        .style("stroke-width", "3px");

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

      const nodeUpdate = node.enter().merge(node);
      nodeUpdate.transition()
        .duration(750)
        .attr("transform", d => `translate(${d.y},${d.x})`);

      nodeUpdate.select("circle")
        .attr("r", 8)
        .style("fill", d => (d._children ? "lightsteelblue" : "#fff"));

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      const nodeExit = node.exit().transition()
        .duration(750)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select("circle").attr("r", 1e-6);
      nodeExit.select("text").style("fill-opacity", 1e-6);

      const link = d3.select("#tree-svg").selectAll("path.link")
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

      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Initial setup
    const rootNode = treeData()?.descendants()[0];
    if (rootNode) {
      rootNode.x0 = height / 2;
      rootNode.y0 = 0;
      update(rootNode);
    }
  });

  return (
    <Show when={hydrated()} fallback={<div>Loading…</div>}>
      <div id="tree-svg" />
    </Show>
  );
}
