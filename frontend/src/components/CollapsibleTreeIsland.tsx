import { onMount } from "solid-js";

export default function CollapsibleTreeIsland({
  name: 'CollapsibleTreeIsland',
  setup() {
    onMount(() => {
      const width = 960;
      const height = 500;
      const margin = { top: 20, right: 90, bottom: 30, left: 90 };

      // Create SVG element
      const svg = d3.select('#tree-svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Tooltip div
      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('background', 'lightyellow')
        .style('padding', '6px')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('font', '12px sans-serif')
        .style('opacity', 0);

      // Dummy hierarchical data
      const root = {
        name: 'Root',
        children: [
          { name: 'Child 1' },
          {
            name: 'Child 2',
            children: [
              { name: 'Grandchild 1' },
              { name: 'Grandchild 2' }
            ]
          },
          {
            name: 'Child 3',
            children: [
              { name: 'Grandchild 3' },
              {
                name: 'Grandchild 4',
                children: [
                  { name: 'Great‑Grandchild 1' },
                  { name: 'Great‑Grandchild 2' }
                ]
              }
            ]
          }
        ]
      };

      // Tree layout
      const treemap = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
      const rootHierarchy = d3.hierarchy(root);
      const treeData = treemap(rootHierarchy);

      // Append links (edges)
      const link = svg.selectAll('.link')
        .data(treeData.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d => {
          const o = d.source;
          return `M ${o.y} ${o.x} C ${(o.y + d.target.y) / 2} ${o.x}, ${(o.y + d.target.y) / 2} ${d.target.x}, ${d.target.y} ${d.target.x}`;
        });

      // Append nodes
      const node = svg.selectAll('.node')
        .data(treeData.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .on('click', click)
        .on('mouseover', (event, d) => {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
          tooltip.html(d.data.name)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });

      // Node circles
      node.append('circle')
        .attr('r', 1e-6)
        .style('fill', d => (d._children ? 'lightsteelblue' : '#fff'))
        .style('stroke', '#ccc')
        .style('stroke-width', '3px');

      // Node text labels
      const text = node.append('text')
        .attr('dy', '.35em')
        .attr('x', d => (d.children || d._children) ? -13 : 13)
        .attr('text-anchor', d => (d.children || d._children) ? 'end' : 'start')
        .text(d => d.data.name)
        .style('fill-opacity', 1e-6);

      // Zoom behavior (optional)
      const zoom = d3.zoom().scaleExtent([1, 2]).on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });
      svg.call(zoom);

      // Resize handler
      window.addEventListener('resize', () => {
        const newWidth = window.innerWidth - margin.left - margin.right;
        const newHeight = window.innerHeight - margin.top - margin.bottom;
        svg.attr('width', newWidth).attr('height', newHeight);
        // Re‑compute tree on resize if needed (simplified)
      });

      // Collapse/expand handler
      function click(event, d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        // Re‑calculate tree layout
        const newData = treemap(rootHierarchy);
        // Update positions
        node.transition()
          .duration(750)
          .attr('transform', d => `translate(${d.y},${d.x})`);
        link.transition()
          .duration(750)
          .attr('d', d => {
            const o = d.source;
            return `M ${o.y} ${o.x} C ${(o.y + d.target.y) / 2} ${o.x}, ${(o.y + d.target.y) / 2} ${d.target.x}, ${d.target.y} ${d.target.x}`;
          });
      }

      // Initial update
      node.transition()
        .duration(750)
        .attr('transform', d => `translate(${d.y},${d.x})`);
      link.transition()
        .duration(750)
        .attr('d', d => {
          const o = d.source;
          return `M ${o.y} ${o.x} C ${(o.y + d.target.y) / 2} ${o.x}, ${(o.y + d.target.y) / 2} ${d.target.x}, ${d.target.y} ${d.target.x}`;
        });
      node.select('circle')
        .transition()
        .duration(750)
        .attr('r', 8);
      text.transition()
        .duration(750)
        .style('fill-opacity', 1);
    });
  }
});
