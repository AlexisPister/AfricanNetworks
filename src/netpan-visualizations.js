// import * as NN from "../node_modules/netpanorama-templates-viewer/dist/bundle.js"

function renderTemplates() {
  NetPanoramaTemplateViewer.render("./src/assets/demo/templates.json", {
    fileUrl: "\"./src/assets/demo/example.pajek\"",
    nodeColor: "\"red\""
  }, "vis1");

  // NetPanoramaTemplateViewer.render("../netpanorama/templates/demo/person-institutions-forcegraph.json", {
  //   fileUrl: "\"../data/march-19/example.pajek\"",
  //   nodeColor: "\"red\""
  // }, "vis2");

}

renderTemplates()