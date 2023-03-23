// import * as NN from "../node_modules/netpanorama-template-viewer/dist/bundle.js"

function renderTemplates() {
  NetPanoramaTemplateViewer.render("./src/assets/demo/template.json", {
    fileUrl: "\"./src/assets/demo/example.pajek\"",
    nodeColor: "\"red\""
  }, "vis1");

  // NetPanoramaTemplateViewer.render("../netpanorama/template/demo/person-institutions-forcegraph.json", {
  //   fileUrl: "\"../data/march-19/example.pajek\"",
  //   nodeColor: "\"red\""
  // }, "vis2");

}

renderTemplates()