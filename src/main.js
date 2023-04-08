import {updateTimeLine} from "./timeline.js";

// const FOLDER = "march-19";
const FOLDER = "april-02";


const nodeTypes = {
    person: 1,
    institution: 2,
    publication: 3
}

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
    const entities = institutions.concat(publications).concat(persons)

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


    return [entities, persons, institutions, publications, personInst, personPubs];
}

function getPersonInfo(personName) {
    // let personData = peopleData.filter(p => p.Name == personName)[0]
    let personData = entitiesData.filter(p => p.Name == personName)[0]
    return personData
}

function displayNodeSelection(nodeData, type) {
    let generalInfo, dob, dod
    if (type == "person") {
        dob = nodeData["Date of birth"];
        dod = nodeData["Date of death"];
        generalInfo = nodeData["General Info/biography"];
    } else if (type == "institution") {
        generalInfo = nodeData["General Info (biography, description, etc)"]
        dob = nodeData["Date of Creation"]
        dod = nodeData["Date of closing"]
    } else if (type == "publication") {
        generalInfo = nodeData["General Info (biography, description, etc)"]
        dob = nodeData["Date of Creation"]
        dod = nodeData["Date of closing"]
    }

    let activity = nodeData["Main Activity"];
    let origin = nodeData["General Info/biography"];

    d3.select("#name")
        .html(nodeData["Name"])
    d3.select("#bio")
        .html(generalInfo)
    d3.select("#dob")
        .html(dob)
    d3.select("#dof")
        .html(dod)
    d3.select("#activity")
        .html(activity)
}

function renderGeneralInfo(peopleData, institutionData, pubData) {
    d3.select("#n-people")
        .html(peopleData.length)
    d3.select("#n-institutions")
        .html(institutionData.length)
    d3.select("#n-publications")
        .html(pubData.length)
}

function getTimeInterval(personInst, personPub) {
    let years1 = personInst.map(d => parseInt(d.Year)).filter(d => d)
    let years2 = personPub.map(d => parseInt(d.Year)).filter(d => d)
    let allYears = years1.concat(years2)
    return [Math.min(...allYears), Math.max(...allYears)]
}

// function whatIsNodetype(datum) {
//     if (datum.)
// }

let yearMinSel = 1000
let yearMaxSel = 3000
let isTripartite = false;


let forceViewer, tripartiteViewer;

async function renderTemplates(tripartite = false) {
// async function renderTemplates(tripartite=false, yearMin=1000, yearMax=2000) {
    const selectNodeCb = (e) => {
        let node = e.nodes[0];
        let type = node._type
        let nodeData = getPersonInfo(e.nodes[0].id);
        displayNodeSelection(nodeData, type)
    }

    if (tripartite) {
        tripartiteViewer = NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-publications-tripartite.json", {
            yearMin: yearMinSel,
            yearMax: yearMaxSel,
            dataFolder: `\"${FOLDER}\"`,
            selColor: `\"${SELECTION_COLOR}\"`
        }, "force");
    } else {
        forceViewer = await NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-publications-force.json", {
                // layoutAlg: "\"webcola\"",
                layoutAlg: "\"d3-force\"",
                yearMin: yearMinSel,
                yearMax: yearMaxSel,
                dataFolder: `\"${FOLDER}\"`,
                selColor: `\"${SELECTION_COLOR}\"`
            }, "force",
            {paramCallbacks: {nodeSelection: selectNodeCb}});
    }
    // NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-bipartite-cartesian.json", {}, "bipartite");
    // NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institProj.json", {}, "person-force-proj");
    // let t = NetPanoramaTemplateViewer.render("./netpanorama/templates/instit-personProj.json", {}, "inst-force-proj");

    // let links = forceViewer.state["PI-net"].links
    // console.log("LL ", links)

    // return forceViewer
}

function update() {
    if (forceViewer) {
        forceViewer.setParam("selectedYears", [yearMinSel, yearMaxSel])
    }
}

function yearSelectionCb(yearMin, yearMax) {
    // TODO: update the selection without rerendering
    renderTemplates(false, yearMin, yearMax);
}

const [entitiesData, peopleData, institutionsData, publicationsData, personInst, personPub] = await fetchData();
const [yearMin, yearMax] = getTimeInterval(personInst, personPub)
// console.log("DATA", entitiesData);
renderGeneralInfo(peopleData, institutionsData, publicationsData);
renderTemplates();


let slider = document.getElementById('time-slider');
let timeSlider = noUiSlider.create(slider, {
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
        update()
    })

d3.select("#tripartite-radio")
    .on("click", (e) => {
        isTripartite = true;
        update()
    })

