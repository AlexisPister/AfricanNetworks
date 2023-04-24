import {updateTimeLine, updateTimelineSelection} from "./timeline.js";
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

async function fetchData() {
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
    const entities = institutions.concat(publications).concat(persons).concat(events)

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


    return [entities, persons, institutions, publications, events, personInst, personPubs];
}

function getTimeInterval(personInst, personPub) {
    let years1 = personInst.map(d => parseInt(d.Year)).filter(d => d)
    let years2 = personPub.map(d => parseInt(d.Year)).filter(d => d)
    let allYears = years1.concat(years2)
    return [Math.min(...allYears), Math.max(...allYears)]
}


async function renderTemplates() {
// async function renderTemplates(tripartite=false, yearMin=1000, yearMax=2000) {
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
}

async function selectNodeCb(e) {
    let node = e.nodes[0];
    let type = node._type
    let nodeData = getPersonInfo(node.id);
    // console.log("node: ", e, node, nodeData)

    updateSelection(node.id)
    updateTimelineSelection(node.id)
    displayNodeSelection(node, nodeData, type)
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
    // let neighborsWithData = neighbors.map(neighbor => {
    //     let data = getPersonInfo(neighbor.id)
    //     if (data) {
    //         return data
    //     } else {
    //         return neighbor
    //     }
    // })
    // console.log("DATA ", nodeData, type, neighbors);

    if (type == "person") {
        dob = nodeData ? nodeData["Date of birth"] : "";
        dod = nodeData ? nodeData["Date of death"] : "";
        generalInfo = nodeData ? nodeData["General Info/biography"] : "";

        setOneNeighborPanel(1, neighbors, nodeTypes.institution, "Worked with:")
        setOneNeighborPanel(2, neighbors, nodeTypes.publication, "Published at:")
        setOneNeighborPanel(3, neighbors, nodeTypes.event, "Participated in:")
    } else if (type == "institution") {
        generalInfo = nodeData ? nodeData["General Info (biography, description, etc)"] : ""
        dob = nodeData ? nodeData["Date of Creation"] : ""
        dod = nodeData ? nodeData["Date of closing"] : ""

        setOneNeighborPanel(1, neighbors, nodeTypes.person, "People:")
        setOneNeighborPanel(2, null)
        setOneNeighborPanel(3, null)
    } else if (type == "publication") {
        generalInfo = nodeData ? nodeData["General Info (biography, description, etc)"] : ""
        dob = nodeData ? nodeData["Date of Creation"] : ""
        dod = nodeData ? nodeData["Date of closing"] : ""

        setOneNeighborPanel(1, neighbors, nodeTypes.person, "People:")
        setOneNeighborPanel(2, null)
        setOneNeighborPanel(3, null)
    } else if (type == "event") {
        generalInfo = nodeData ? nodeData["General Info (biography, description, etc)"] : ""
        dob = nodeData ? nodeData["Date of Creation"] : ""
        dod = nodeData ? nodeData["Date of closing"] : ""

        setOneNeighborPanel(1, neighbors, nodeTypes.person, "People:")
        setOneNeighborPanel(2, null)
        setOneNeighborPanel(3, null)
    }

    let name = nodeData ? nodeData["Name"] : node.id;
    let activity = nodeData ? nodeData["Main Activity"] : ""
    let origin = nodeData ? nodeData["General Info/biography"] : ""

    let imgPath = `data/photos/${name}.jpg`
    console.log(imgPath)

    d3.select("#name")
        .html(name)
    d3.select("#bio")
        .html(generalInfo)
    d3.select("#dob")
        .html(dob)
    d3.select("#dof")
        .html(dod)
    d3.select("#activity")
        .html(activity)
    d3.select("#img")
        .attr("src", imgPath)
}

function setOneNeighborPanel(number, neighbor, selectedNodeType, title) {
    let titleSel = d3.select(`#connected-to-${number}-title`)
    let listSel = d3.select(`#connected-to-${number}-list`)

    titleSel.html("")
    listSel.html("")

    if (!neighbor) {
        return;
    }

    titleSel
        .html(title)

    let entities = neighbor.filter(n => n._type == selectedNodeType)
    entities.forEach(e => {
        renderOneNeighborEntity(listSel, e, selectedNodeType);
    })
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
    console.log("netpannode", netpanNode)
    if (forceViewer) {
        forceViewer.setParam("nodeSelection", {nodes: [netpanNode], links: []})
    }
    if (tripartiteViewer) {
        tripartiteViewer.setParam("nodeSelection", {nodes: nodeId, links: []})
    }
}

export function updateNodeslinksSelection(nodeIds) {
    let netpanNodes = completeNetwork.nodes.filter(n => nodeIds.includes(n.id));
    console.log("netpannode", netpanNode)
    if (forceViewer) {
        forceViewer.setParam("nodeSelection", {nodes: netpanNodes, links: []})
    }
    if (tripartiteViewer) {
        tripartiteViewer.setParam("nodeSelection", {nodes: netpanNodes, links: []})
    }
}


function setEvents() {
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


