function computeSvgDims(id) {
    let svg = d3.select(`#${id}`);
    let containerWidth = svg.node().parentNode.getBoundingClientRect().width;
    let containerHeight = svg.node().parentNode.getBoundingClientRect().height;
    return [containerWidth, containerHeight];
}

function linkCheck(url) {
    try {
        let http = new XMLHttpRequest();
        // http.open('HEAD', url, false);
        http.open('GET', url, false);
        http.send();
        return http.status != 404;
    } catch (e) {
        //
        return false
    }
}