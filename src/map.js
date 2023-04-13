import {forceViewer} from "./main.js";

const [width, height] = computeSvgDims("map")
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
}


setTimeout(() => {
    console.log(111, forceViewer)
}, 1000)
console.log("FFFFF ", forceViewer);

// const countries = ["Uganda", "Tanzania", "Kenya", "Ghana"];
const countries = ["Uganda", "Tanzania", "Kenya"];
const svg = d3.select("#map")
const g = svg
    .append("g")

// TODO: center auto
// g.attr("transform", "translate(-450, -160)")


console.log("WW ", svg.attr("width"), width, height)

const path = d3.geoPath()
const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

// Map and projection
// let projection = d3.geoMercator()
let projection = d3.geoNaturalEarth1()
    // .center([-6.3728253, 34.8924826]) // GPS of location to zoom on
    // .center([-0.976635, 33.937761]) // GPS of location to zoom on
    .center([33.937761, -0.976635]) // GPS of location to zoom on
    // .center([2, 34.8924826]) // GPS of location to zoom on
    .scale(1600) // This is like the zoom
    .translate([width / 2, height / 2])

let mapData;

importData().then((data) => {
    mapData = data
    // mapData.objects.continent_Africa_subunits.geometries = mapData.objects.continent_Africa_subunits.geometries.filter(g => countries.includes(g.properties.geounit))
    // console.log(mapData.features.map(d => d.properties.NAME))
    mapData.features = mapData.features.filter(d => countries.includes(d.properties.NAME))
    // console.log(mapData.features)
    render()
})


function parseEventDate(date) {
    return +date.slice(-4)
}

async function importData() {
    // const path = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    const path = "../data/ne_10m_admin_0_countries_lakes.json"
    // const path = "data/africa2@10.json"

    let map = await d3.json(path)
    console.log(map)
    return map;
}


function render() {
    const nations = g
        .append("g")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(mapData.features)
        // .data(topojson.feature(mapData, mapData.objects.continent_Africa_subunits).features)
        .join("path")
        // .on("click", clicked)
        // .attr("d", path)
        .attr("d", d3.geoPath().projection(projection))
        // .attr("transform", "scale(6)")
        // .attr("transform", "scale(9)")
        // .attr("transform", "scale(20)")
        .attr("stroke", "black")
        .attr("fill", "grey")
        .attr("stroke-width", 1);

    nations.append("title").text((d) => d.properties.geounit);
    g.call(zoom);
}

function zoomed(event) {
    const {transform} = event;
    g.attr("stroke-width", 1 / transform.k);
}




