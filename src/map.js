import {forceViewer} from "./main.js";

const [width, height] = computeSvgDims("map")
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
}


// setTimeout(() => {
//     console.log(111, forceViewer)
// }, 1000)

// const countries = ["Uganda", "Tanzania", "Kenya", "Ghana"];
const countries = ["Uganda", "Tanzania", "Kenya"];
const svg = d3.select("#map")
const g = svg
    .append("g")

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


let mapData, institutions, publications, events, places, nodes;


importData().then((data) => {
    setCoordinates();
    setForce();
    render();
})


function parseEventDate(date) {
    return +date.slice(-4)
}

async function importData() {
    const mapPath = "../data/ne_10m_admin_0_countries_lakes.json";

    mapData = await d3.json(mapPath);
    mapData.features = mapData.features.filter(d => countries.includes(d.properties.NAME))

    events = await d3.csv(`./data/${FOLDER}/Events.csv`, d => {
        return d
    })

    publications = await d3.csv(`./data/${FOLDER}/Publications.csv`, d => {
        return d
    })

    institutions = await d3.csv(`./data/${FOLDER}/Institutions.csv`, d => {
        return d
    })

    places = await d3.csv(`./data/${FOLDER}/Places.csv`, d => {
        return d
    })

    nodes = publications.concat(institutions);
    nodes = nodes.filter(i => i["Place"] && PLACES_TO_KEEP.includes(i["Place"]))
}

function setCoordinates() {
    nodes.forEach(n => {
        let [lat, long] = getCoordinates(n.Place);
        let coords = projection([long, lat]);
        n["x"] = coords[0]
        n["y"] = coords[1]
    })
}

function setForce() {
    const simulation = d3.forceSimulation(nodes)
        .force("collision", d3.forceCollide().radius(RADIUS))
        .force("x", d3.forceX().x(d => d.x).strength(1))
        .force("y", d3.forceY().y(d => d.y).strength(1))
    simulation.tick(400);
    console.log(nodes)
}


async function render() {
    // console.log("FFFFF ", forceViewer);
    const nations = g
        .append("g")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("stroke", "black")
        .attr("fill", "grey")
        .attr("stroke-width", 1);

    const nodesSelection = g
        .append("g")
        .selectAll(".dot")
        .data(nodes)
        .join("path")
        .attr("d", d => {
            if (getNodeType(d) == nodeTypes.publication) {
                return d3.symbol().type(d3.symbolDiamond).size(180)(d);
            } else if (getNodeType(d) == nodeTypes.institution) {
                return d3.symbol().type(d3.symbolSquare).size(180)(d);
            }
        })
        .attr("stroke", "black")
        .attr("transform", (d, i) => `translate(${d.x}, ${d.y})`)
        .style("fill", function (d) {
            return colorScale(getNodeType(d))
        })
        .classed("dot", true)

    // const pubs = g
    //     .append("g")
    //     .selectAll(".institution")
    //     .data(institutions.filter(i => i["Place"] && PLACES_TO_KEEP.includes(i["Place"])))
    //     .join("rect")
    //     .attr("x", d => {
    //         let [lat, long] = getCoordinates(d.Place);
    //         let coords = projection([long, lat]);
    //         return coords[0]
    //     })
    //     .attr("y", d => {
    //         let [lat, long] = getCoordinates(d.Place);
    //         let coords = projection([long, lat]);
    //         return coords[1]
    //     })
    //     .attr("width", 10)
    //     .attr("height", 10)
    //     .attr("stroke", "black")
    //     .attr("fill", "gray")
    //     .attr("stroke-width", 2)

    nations.append("title").text((d) => d.properties.geounit);
    g.call(zoom);
}

function zoomed(event) {
    const {transform} = event;
    g.attr("stroke-width", 1 / transform.k);
}

function getCoordinates(placeName) {
    placeName = placeName.split(";")[0]
    let place = places.filter(p => p.Place == placeName)[0];
    let lat, long;
    if (place.Type == "Country") {
        let city = COUNTRY_TO_CITY[placeName];
        let placeCity = places.filter(p => p.Place == city)[0];
        lat = placeCity.Latitude;
        long = placeCity.Longitude;
    } else if (place.Type == "City") {
        lat = place.Latitude;
        long = place.Longitude;
    }
    return [lat, long];
}

function getNodeType(node) {
    if (institutions.includes(node)) {
        return nodeTypes.institution;
    } else if (publications.includes(node)) {
        return nodeTypes.publication;
    }
}



