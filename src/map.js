// TODO: compute this auto?
let width = 1000;
let height = 900;
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
}
const countries = ["Uganda", "Tanzania", "Kenya", "Ghana"];
const g = d3.select("#map")
    .append("g")
const path = d3.geoPath()
const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
let mapData;

// TODO: center auto
g.attr("transform", "translate(-450, -160)")

importData().then((data) => {
    mapData = data
    mapData.objects.continent_Africa_subunits.geometries = mapData.objects.continent_Africa_subunits.geometries.filter(g => countries.includes(g.properties.geounit))
    render()
})


function parseEventDate(date) {
    return +date.slice(-4)
}

async function importData() {
    let map = await d3.json("data/africa2@10.json")
    return map;
}


function render() {
    const nations = g
        .append("g")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(topojson.feature(mapData, mapData.objects.continent_Africa_subunits).features)
        // .data(topojson.feature(map, countriesFiltered).features)
        .join("path")
        // .on("click", clicked)
        .attr("d", path)
        // .attr("transform", "scale(6)")
        .attr("transform", "scale(9)")
        // .attr("transform", "scale(20)")
        .attr("stroke", "black")
        .attr("fill", "grey")
        .attr("stroke-width", 0.1);

    nations.append("title").text((d) => d.properties.geounit);
    g.call(zoom);
}

function zoomed(event) {
    const {transform} = event;
    g.attr("stroke-width", 1 / transform.k);
}




