function computeSvgDims(id) {
    let svg = d3.select(`#${id}`);
    let containerWidth = svg.node().parentNode.getBoundingClientRect().width;
    let containerHeight = svg.node().parentNode.getBoundingClientRect().height;
    return [containerWidth, containerHeight];
}