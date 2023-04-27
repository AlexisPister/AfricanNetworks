import {parseYear, updateTimeLine, updateTimelineSelection} from "./timeline.js";
import {updateSelection} from "./map.js";
import {updateStory} from "./stories.js";

let yearMinSel = 1000
let yearMaxSel = 3000
let isTripartite = false;
let isStoryMode = false;

let completeNetwork;
export let forceViewer, tripartiteViewer;

const [width, height] = computeSvgDims("force")
const [entitiesData, peopleData, institutionsData, publicationsData, eventsData, personInst, personPub] = await fetchData();
const [yearMin, yearMax] = getTimeInterval(personInst, personPub)
renderGeneralInfo(peopleData, institutionsData, publicationsData);
renderTemplates();
setEvents();
setupSearch();

export async function fetchData() {
    let persons = await fetch(`./data/${FOLDER}/People.csv`)
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))
    let institutions = await fetch(`./data/${FOLDER}/Institutions.csv`)
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))
    let publications = await fetch(`./data/${FOLDER}/Publications.csv`)
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))
    // const entities = institutions.concat(publications).concat(persons)

    let events = await fetch(`./data/${FOLDER}/Events.csv`)
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))
    let entities = institutions.concat(publications).concat(persons).concat(events)

    let personInst = await fetch(`./data/${FOLDER}/Person-Institution.csv`)
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))
    let personPubs = await fetch(`./data/${FOLDER}/Person-Publication.csv`)
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))

    entities = entities.filter(d => d.Name != "" && d.Name != " " && d.Name)
    entities.sort(function (a, b) {
        if (a.Name < b.Name) {
            return -1;
        }
        if (a.Name > b.Name) {
            return 1;
        }
        return 0;
    });
    return [entities, persons, institutions, publications, events, personInst, personPubs];
}

function getTimeInterval(personInst, personPub) {
    let years1 = personInst.map(d => parseInt(d.Year)).filter(d => d)
    let years2 = personPub.map(d => parseInt(d.Year)).filter(d => d)
    let allYears = years1.concat(years2)
    return [Math.min(...allYears), Math.max(...allYears)]
}


async function renderTemplates() {
    d3.select("#force")
        .html("")

    if (isTripartite) {
        tripartiteViewer = await NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-publications-tripartite.json", {
            width: width - 100,
            yearMin: yearMinSel,
            yearMax: yearMaxSel,
            dataFolder: `\"${FOLDER}\"`,
            selColor: `\"${SELECTION_COLOR}\"`,
            personColor: `\"${PERSON_COLOR}\"`,
            institutionColor: `\"${INSTITUTION_COLOR}\"`,
            publicationColor: `\"${PUBLICATION_COLOR}\"`,
            eventColor: `\"${EVENT_COLOR}\"`
        }, "force", {paramCallbacks: {nodeSelection: selectNodeCb}});
    } else {
        forceViewer = await NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-publications-force.json", {
                width: width - 100,
                height: height - 100,
                yearMin: yearMinSel,
                yearMax: yearMaxSel,
                dataFolder: `\"${FOLDER}\"`,
                selColor: `\"${SELECTION_COLOR}\"`,
                personColor: `\"${PERSON_COLOR}\"`,
                institutionColor: `\"${INSTITUTION_COLOR}\"`,
                publicationColor: `\"${PUBLICATION_COLOR}\"`,
                eventColor: `\"${EVENT_COLOR}\"`
            }, "force",
            {paramCallbacks: {nodeSelection: selectNodeCb}});

        completeNetwork = forceViewer.state["PI-net"];
    }
    // NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-bipartite-cartesian.json", {}, "bipartite");
    // NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institProj.json", {}, "person-force-proj");
    // let t = NetPanoramaTemplateViewer.render("./netpanorama/templates/instit-personProj.json", {}, "inst-force-proj");

    // let links = forceViewer.state["PI-net"].links
    // return forceViewer

    // TODO: handle this callback in different scenarios
    setupZoom();
}

// TODO: fix when clicking on timeline
async function selectNodeCb(e) {
    if (e.nodes.length > 0) {
        let node = e.nodes[0];
        let type = node._type
        let nodeData = getPersonInfo(node.id);

        console.log("click ", node, type, nodeData)

        updateSelection(node.id)
        updateTimelineSelection(node.id)
        displayNodeSelection(node, nodeData, type)
        setSearchValue(node.id)
    }
}

function getPersonInfo(personName) {
    // let personData = peopleData.filter(p => p.Name == personName)[0]
    let personData = entitiesData.filter(p => p.Name == personName)[0]
    return personData
}

async function displayNodeSelection(node, nodeData, type) {
    let generalInfo, dob, dod;

    // Wait so that the selection is the current one and not the previous one
    await new Promise(resolve => setTimeout(resolve, 1));
    let neighbors = forceViewer.state.outnodes.nodes;
    let links = forceViewer.state.outnodes.links;
    // console.log(neighbors, links)
    // let neighborsWithData = neighbors.map(neighbor => {
    //     let data = getPersonInfo(neighbor.id)
    //     if (data) {
    //         return data
    //     } else {
    //         return neighbor
    //     }
    // })
    // console.log("DATA ", nodeData, type, neighbors);

    d3.select("#date-tilt")
        .html("-")
    d3.select("#activity")
        .html("")

    if (type == "person") {
        dob = nodeData ? nodeData["Date of birth"] : "";
        dod = nodeData ? nodeData["Date of death"] : "";
        generalInfo = nodeData ? nodeData["General Info/biography"] : "";

        let activity = nodeData ? nodeData["Main Activity"] : ""
        d3.select("#activity")
            .html(`<span class="field">Activity</span>: ${activity}`)

        setOneNeighborPanel(1, neighbors, nodeTypes.institution, null, "Worked with:")
        setOneNeighborPanel(2, neighbors, nodeTypes.publication, null, "Published at:")
        setOneNeighborPanel(3, neighbors, nodeTypes.event, null, "Participated in:")
    } else if (type == "institution") {
        generalInfo = nodeData ? nodeData["General Info (biography, description, etc)"] : ""
        dob = nodeData ? nodeData["Date of Creation"] : ""
        dod = nodeData ? nodeData["Date of closing"] : ""

        // TODO; split when several values
        let typeToPerson = getTypeToEntity(links, INST_LINK_TYPE)

        setOneNeighborPanel(1, neighbors, nodeTypes.person, typeToPerson, "People:")
        setOneNeighborPanel(2, null)
        setOneNeighborPanel(3, null)
    } else if (type == "publication") {
        generalInfo = nodeData ? nodeData["General Info (biography, description, etc)"] : ""
        dob = nodeData ? nodeData["Date of Creation"] : ""
        dod = nodeData ? nodeData["Date of closing"] : ""

        let subject = nodeData ? nodeData["Subject"] : ""
        d3.select("#activity")
            .html(`<span class="field">Subject</span>: ${subject}`)
        
        let typeToPerson = getTypeToEntity(links, PUB_LINK_TYPE)
        setOneNeighborPanel(1, neighbors, nodeTypes.person, typeToPerson, "People:")
        setOneNeighborPanel(2, null);
        setOneNeighborPanel(3, null);
    } else if (type == "event") {
        generalInfo = nodeData ? nodeData["General Info (biography, description, etc)"] : ""
        dob = ""
        dod = ""

        // TODO: put a higher order class
        let typeToPerson = getTypeToEntity(links, EVENT_LINK_TYPE)
        setOneNeighborPanel(1, neighbors, nodeTypes.person, typeToPerson, "People:")
        setOneNeighborPanel(2, null)
        setOneNeighborPanel(3, null)
    }

    if (dob) dob = parseYear(dob);
    if (dod) dod = parseYear(dod);

    if (type == "event" && nodeData) {
        d3.select("#date-tilt")
            .html(nodeData["Date"])
    } else if (!dod) {
        d3.select("#date-tilt")
            .html("")
    }

    let name = nodeData ? nodeData["Name"] : node.id;
    let origin = nodeData ? nodeData["General Info/biography"] : ""

    let imgPath = `data/photos/${name}.jpg`
    let imgExist = linkCheck(imgPath)

    d3.select("#name")
        .html(name)
    d3.select("#bio")
        .html(generalInfo)
    d3.select("#dob")
        .html(dob)
    d3.select("#dod")
        .html(dod)

    d3.select("#img")
        .attr("src", () => {
            if (imgExist) {
                return imgPath
            }
        })
        .style("display", () => {
            return imgExist ? "" : "none"
        })
}

function getTypeToEntity(links, typeKey) {
    let typeToEntities = {};
        links.forEach(l => {
            let linkData = l.data;
            let type = linkData[typeKey]
            if (typeToEntities[type]) {
                typeToEntities[type].push(l);
            } else {
                typeToEntities[type] = [l];
            }
        })
    return typeToEntities
}

function setOneNeighborPanel(number, neighbor, selectedNodeType, typeToEntity, title) {
    let titleSel = d3.select(`#connected-to-${number}-title`)
    let listSel = d3.select(`#connected-to-${number}-list`)

    titleSel.html("")
    listSel.html("")

    if (!neighbor) {
        return;
    }

    titleSel
        .html(title)


    if (typeToEntity) {
        for (let type of Object.keys(typeToEntity)) {
            listSel.append("h4")
                .text(type)

            let entities = typeToEntity[type];
            entities.forEach(entity => {
                listSel.append("div")
                    .text(`${entity.source.id} - ${entity.data.Year}`)
                    .classed("neighbor-element", true)
                    .on("click", () => {
                        updateNodelinkSelection(entity.source.id)
                    })
            })
        }
    } else {
        let entities = neighbor.filter(n => n._type == selectedNodeType)
        entities.forEach(e => {
            renderOneNeighborEntity(listSel, e, selectedNodeType);
        })
    }
}

function renderOneNeighborEntity(div, entity, nodeType) {
    if (nodeType == nodeTypes.person) {
        div
            .append("div")
            .classed("neighbor-element", true)
            .html(entity.id)
    } else if (nodeType == nodeTypes.institution) {
        div
            .append("div")
            .classed("neighbor-element", true)
            .html(entity.id)
    } else if (nodeType == nodeTypes.publication) {
        div
            .append("div")
            .classed("neighbor-element", true)
            .html(entity.id)
    } else if (nodeType == nodeTypes.event) {
        div
            .append("div")
            .classed("neighbor-element", true)
            .html(entity.id)
    }
}

function renderGeneralInfo(peopleData, institutionData, pubData) {
    d3.select("#n-people")
        .html(peopleData.length)
    d3.select("#n-institutions")
        .html(institutionData.length)
    d3.select("#n-publications")
        .html(pubData.length)
    d3.select("#n-events")
        .html(eventsData.length)
}

function update() {
    if (forceViewer) {
        forceViewer.setParam("selectedYears", [yearMinSel, yearMaxSel])
    }
    if (tripartiteViewer) {
        tripartiteViewer.setParam("selectedYears", [yearMinSel, yearMaxSel])
    }
}

// TODO: some nodes of the timeline are not in the node-links (not in any link?)
export function updateNodelinkSelection(nodeId) {
    // Not sure if really needed
    let netpanNode = completeNetwork.nodes.filter(n => n.id == nodeId)[0];
    if (forceViewer) {
        forceViewer.setParam("nodeSelection", {nodes: [netpanNode], links: []})
    }
    if (tripartiteViewer) {
        tripartiteViewer.setParam("nodeSelection", {nodes: nodeId, links: []})
    }
}

export function updateNodeslinksSelection(nodeIds) {
    let netpanNodes = completeNetwork.nodes.filter(n => nodeIds.includes(n.id));
    // console.log("netpannode", netpanNode)
    if (forceViewer) {
        forceViewer.setParam("nodeSelection", {nodes: netpanNodes, links: []})
    }
    if (tripartiteViewer) {
        tripartiteViewer.setParam("nodeSelection", {nodes: netpanNodes, links: []})
    }
}


function setEvents() {
    // console.log(yearMin, yearMax)
    let slider = document.getElementById('time-slider');
    noUiSlider.create(slider, {
        start: [yearMin, yearMax],
        connect: true,
        range: {
            'min': Math.round(yearMin),
            'max': yearMax
        },
        step: 1,
        format: {
            from: function (value) {
                return parseInt(value);
            },
            to: function (value) {
                return parseInt(value);
            }
        },
        behaviour: 'tap-drag',
        tooltips: true,
    });

    slider.noUiSlider.on("update", (e) => {
        [yearMinSel, yearMaxSel] = [e[0], e[1]];
        update();
    })

    d3.select("#force-radio")
        .on("click", (e) => {
            isTripartite = false;
            d3.select("#force")
                .style("height", "730px")
            renderTemplates()
        })

    d3.select("#tripartite-radio")
        .on("click", (e) => {
            isTripartite = true;
            d3.select("#force")
                .style("height", "1100px")
            renderTemplates()
        })


    d3.select("#exploration")
        .on("click", (e) => {
            isStoryMode = false;
            d3.select("#scenario-div")
                .style("display", "none")
            d3.select("#exploration-div")
                .style("display", "")
            // renderTemplates()
        })

    d3.select("#stories")
        .on("click", (e) => {
            isStoryMode = true;
            d3.select("#scenario-div")
                .style("display", "")
            d3.select("#exploration-div")
                .style("display", "none")
            updateStory();
            // renderTemplates()
        })
}

function setupZoom() {
    let svg = d3.select("#force")
        .select("svg")

    let g = svg
        .select("g")
        .select("g")

    svg
        .call(d3.zoom()
            // .extent([[0, 0], [width, height]])
            // .scaleExtent([1, 8])
            .on("zoom", zoomed))
    // .on("wheel.zoom", (e) => {
    //     console.log(222, e)
    //     // e.preventDefault();
    // });

    // let tooltip = svg.select("div[style='absolute']")
        // .attr("transform", "translate")
    // console.log("tt ", tooltip)


    function zoomed({transform}) {
        g.attr("transform", transform);
    }
}

function setupSearch() {
    d3.select("#entity-select")
        .on("change", (e, d) => {
            let entityName = e.target.value;
            updateNodelinkSelection(entityName)
        })
        .selectAll("option")
        .data(entitiesData)
        .join("option")
        .text(d => {
            return d.Name
        })
        .attr("value", d => d.Name)
}

function setSearchValue(entityId) {
    d3.select("#entity-select")
        .select(`option[value="${entityId}"]`)
        .attr("selected", true)
}


