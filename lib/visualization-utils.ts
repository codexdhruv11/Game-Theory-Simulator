import * as d3 from 'd3';
import { type ClassValue } from "clsx";

/**
 * Converts a Tailwind CSS HSL variable to a D3-compatible color format
 * @param cssVar - CSS variable name (e.g., '--primary')
 * @returns D3-compatible color string
 */
export function hslToD3Color(cssVar: string): string {
  // Get the CSS variable value from the document
  const computedStyle = getComputedStyle(document.documentElement);
  const hslValue = computedStyle.getPropertyValue(cssVar).trim();
  
  // Parse the HSL values (format: "H S% L%")
  const [h, s, l] = hslValue.split(' ').map(val => parseFloat(val.replace('%', '')));
  
  // Convert to D3 color format
  return d3.hsl(h, s / 100, l / 100).toString();
}

/**
 * Creates a responsive SVG container that adapts to its parent container
 * @param selection - D3 selection of the container element
 * @param width - Width of the SVG
 * @param height - Height of the SVG
 * @returns D3 selection of the created SVG
 */
export function createResponsiveSvg(
  selection: d3.Selection<any, any, any, any>,
  width: number,
  height: number
): d3.Selection<SVGSVGElement, any, any, any> {
  // Remove any existing SVG
  selection.select('svg').remove();
  
  // Create new SVG with responsive attributes
  const svg = selection
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('width', '100%')
    .attr('height', '100%')
    .classed('svg-container', true);
  
  return svg;
}

/**
 * Creates a smooth transition for data changes
 * @param selection - D3 selection to apply transition to
 * @param duration - Duration of the transition in milliseconds
 * @returns D3 transition
 */
export function smoothTransition(
  selection: d3.Selection<any, any, any, any>,
  duration: number = 300
): d3.Transition<any, any, any, any> {
  return selection
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut);
}

/**
 * Graph layout types
 */
export enum GraphLayout {
  ForceDirected,
  Circular,
  Hierarchical,
  Grid
}

/**
 * Creates a force-directed graph layout
 * @param nodes - Array of node data
 * @param links - Array of link data
 * @param width - Width of the container
 * @param height - Height of the container
 * @returns D3 force simulation
 */
export function createForceLayout(
  nodes: any[],
  links: any[],
  width: number,
  height: number
): d3.Simulation<any, any> {
  return d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));
}

/**
 * Creates a circular graph layout
 * @param nodes - Array of node data
 * @param radius - Radius of the circle
 * @param centerX - X coordinate of the center
 * @param centerY - Y coordinate of the center
 */
export function createCircularLayout(
  nodes: any[],
  radius: number,
  centerX: number,
  centerY: number
): void {
  const angleStep = (2 * Math.PI) / nodes.length;
  
  nodes.forEach((node, i) => {
    node.x = centerX + radius * Math.cos(i * angleStep);
    node.y = centerY + radius * Math.sin(i * angleStep);
    node.fx = node.x;
    node.fy = node.y;
  });
}

/**
 * Creates a hierarchical graph layout
 * @param root - Hierarchical data root
 * @param width - Width of the container
 * @param height - Height of the container
 * @returns D3 hierarchical layout
 */
export function createHierarchicalLayout(
  root: any,
  width: number,
  height: number
): d3.HierarchyNode<any> {
  const hierarchy = d3.hierarchy(root);
  
  const treeLayout = d3.tree<any>()
    .size([width, height])
    .nodeSize([50, 100]);
  
  return treeLayout(hierarchy);
}

/**
 * Creates an interactive legend
 * @param selection - D3 selection to append the legend to
 * @param items - Legend items with label and color
 * @param x - X position of the legend
 * @param y - Y position of the legend
 * @param onClick - Optional click handler for legend items
 */
export function createInteractiveLegend(
  selection: d3.Selection<any, any, any, any>,
  items: Array<{ label: string; color: string }>,
  x: number,
  y: number,
  onClick?: (item: { label: string; color: string }, index: number) => void
): void {
  const legend = selection.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${x}, ${y})`);
  
  const legendItems = legend.selectAll('.legend-item')
    .data(items)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (_, i) => `translate(0, ${i * 25})`)
    .style('cursor', onClick ? 'pointer' : 'default')
    .on('click', onClick ? (event, d, i) => onClick(d, i) : null);
  
  legendItems.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('rx', 2)
    .attr('fill', d => d.color);
  
  legendItems.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '0.35em')
    .attr('class', 'text-sm')
    .text(d => d.label);
}

/**
 * Creates axis labels for a chart
 * @param svg - D3 selection of the SVG element
 * @param xLabel - Label for the x-axis
 * @param yLabel - Label for the y-axis
 * @param width - Width of the chart
 * @param height - Height of the chart
 * @param margin - Chart margins
 */
export function createAxisLabels(
  svg: d3.Selection<any, any, any, any>,
  xLabel: string,
  yLabel: string,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  // X-axis label
  svg.append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', margin.left + (width - margin.left - margin.right) / 2)
    .attr('y', height - 5)
    .text(xLabel);
  
  // Y-axis label
  svg.append('text')
    .attr('class', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(margin.top + (height - margin.top - margin.bottom) / 2))
    .attr('y', 15)
    .text(yLabel);
}

/**
 * Handles mouse/touch interactions for SVG elements
 * @param selection - D3 selection to add interactions to
 * @param handlers - Object containing event handlers
 */
export function addInteractions(
  selection: d3.Selection<any, any, any, any>,
  handlers: {
    mouseover?: (event: any, d: any) => void;
    mouseout?: (event: any, d: any) => void;
    click?: (event: any, d: any) => void;
  }
): void {
  if (handlers.mouseover) {
    selection.on('mouseover', handlers.mouseover);
  }
  
  if (handlers.mouseout) {
    selection.on('mouseout', handlers.mouseout);
  }
  
  if (handlers.click) {
    selection.on('click', handlers.click);
  }
}

/**
 * Creates a color scale based on the current theme
 * @param domain - Data domain for the scale
 * @param colorRange - Array of color variables (e.g., ['--primary', '--secondary'])
 * @returns D3 color scale
 */
export function createThemeColorScale(
  domain: [number, number],
  colorRange: string[]
): d3.ScaleLinear<string, string> {
  const colors = colorRange.map(hslToD3Color);
  return d3.scaleLinear<string>()
    .domain(domain)
    .range(colors);
}

/**
 * Generates a unique ID for SVG elements
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function generateSvgId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
} 