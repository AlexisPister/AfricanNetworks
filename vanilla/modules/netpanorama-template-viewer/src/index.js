"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const ivy_language_1 = __importDefault(require("ivy-language"));
const fast_json_patch_1 = require("fast-json-patch");
// @ts-ignore
const embedNetwork_js_1 = require("netpanorama/out-tsc/embedNetwork.js");
const getTemplateString = (template) => __awaiter(void 0, void 0, void 0, function* () {
    let templateString = "";
    if (typeof template === "string" && !template.trim().startsWith("{")) {
        // We have a string that is probably a URL
        yield fetch(template)
            .then((response) => response.text())
            .then((data) => (templateString = data));
    }
    else if (typeof template === "string") {
        // we have a string that is not a URL
        templateString = template;
    }
    else {
        // we have an object, so stringify it
        templateString = JSON.stringify(template);
    }
    return templateString;
});
function update(specObj, containerId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`No container with id ${containerId}`);
            return;
        }
        const viewer = new embedNetwork_js_1.GraphgraView(specObj, Object.assign({ container: "#" + containerId }, options));
        yield viewer.render();
        // @ts-ignore
        container.getElementsByTagName("svg")[0].style["max-width"] = "100%";
        // @ts-ignore
        container.getElementsByTagName("svg")[0].style["max-height"] = "100%";
        return viewer;
    });
}
const render = (template, paramsToSubstitute, containerId, options, patch) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("STARTING");
    const templateString = yield getTemplateString(template);
    console.log({ templateString });
    const populatedTemplate = (0, ivy_language_1.default)(templateString, paramsToSubstitute);
    console.log({ populatedTemplate });
    let patchedTemplate = populatedTemplate;
    if (patch && Array.isArray(patch) && patch.length > 0) {
        (0, fast_json_patch_1.applyPatch)(populatedTemplate, (0, fast_json_patch_1.deepClone)(patch)).newDocument;
    }
    console.log({ patchedTemplate });
    const viewer = yield update(patchedTemplate, containerId, options);
    return viewer;
});
exports.render = render;
