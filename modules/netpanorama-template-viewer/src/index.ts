import evaluateIvyProgram from "ivy-language";
import {applyPatch, deepClone} from 'fast-json-patch';

import type { TemplateMap, Json } from "ivy-language";

// @ts-ignore
import { GraphgraView } from "netpanorama/out-tsc/embedNetwork.js";

const getTemplateString = async (template: string | Json) => {
  let templateString = "";

  if (typeof template === "string" && !template.trim().startsWith("{")) {
    // We have a string that is probably a URL
    await fetch(template)
      .then((response) => response.text())
      .then((data) => (templateString = data));
  } else if (typeof template === "string") {
    // we have a string that is not a URL
    templateString = template;
  } else {
    // we have an object, so stringify it
    templateString = JSON.stringify(template);
  }
  return templateString;
};

async function update(specObj: Json, containerId: string, options: any) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`No container with id ${containerId}`);
    return;
  }

  const viewer = new GraphgraView(specObj, {
    container: "#" + containerId,
    ...options
  });
  await viewer.render();

  // @ts-ignore
  container.getElementsByTagName("svg")[0].style["max-width"] = "100%";
  // @ts-ignore
  container.getElementsByTagName("svg")[0].style["max-height"] = "100%";

  return viewer;
}

const render = async (
  template: string | Json,
  paramsToSubstitute: TemplateMap,
  containerId: string,
  options: object,
  patch: object
) => {

  console.log("STARTING")
  const templateString: string = await getTemplateString(template);
  console.log({templateString})

  const populatedTemplate = evaluateIvyProgram(
    templateString,
    paramsToSubstitute
  );
  console.log({populatedTemplate});

  let patchedTemplate = populatedTemplate;
  if (patch && Array.isArray(patch) && patch.length > 0){
    applyPatch(populatedTemplate, deepClone(patch)).newDocument;
  }

  console.log({patchedTemplate});


  const viewer = await update(patchedTemplate, containerId, options);
  return viewer;
};

export { render };
