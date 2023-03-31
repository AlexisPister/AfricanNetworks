async function fetchData() {
    return await fetch("./data/march-19/People.csv")
        .then((data) => data.text())
        .then(v => {
            let data = Papa.parse(v, {header: true})
            return data.data
        })
        .catch(err => console.log(err))
}

function getPersonInfo(personName) {
    let personData = peopleData.filter(p => p.Name == personName)[0]
    return personData
}

function displayNodeSelection(nodeData) {
    let generalInfo = nodeData["General Info/biography"];
    let activity = nodeData["Main Activity"];
    let origin = nodeData["General Info/biography"];
    let dob = nodeData["Date of birth"];
    let dod = nodeData["Date of death"];

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

function renderTemplates() {
    const selectNodeCb = (e) => {
        console.log(111, e.nodes[0])
        let nodeData = getPersonInfo(e.nodes[0].id);
        displayNodeSelection(nodeData)
    }

    NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-publications-force.json", {}, "force",
        {paramCallbacks: {nodeSelection: selectNodeCb}});
    NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-bipartite-cartesian.json", {}, "bipartite");
    NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institutions-publications-tripartite.json", {}, "tripartite");
    NetPanoramaTemplateViewer.render("./netpanorama/templates/person-institProj.json", {}, "person-force-proj");
    NetPanoramaTemplateViewer.render("./netpanorama/templates/instit-personProj.json", {}, "inst-force-proj");

    //   NetPanoramaTemplateViewer.render("./demo/template.json", {
    //     fileUrl: "\"./demo/example.pajek\"",
    //     nodeColor: "\"red\""
    //   }, "tripartite");
    // }
}

const peopleData = await fetchData();
console.log(peopleData)
renderTemplates();