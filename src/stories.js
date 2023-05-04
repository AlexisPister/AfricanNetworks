import {forceViewer, updateNodelinkSelection, updateNodeslinksSelection, fetchData} from "./main.js";

const STORIES = ["EAISCA", "EAISCA", "African Writer Conference", "EALB", "East African Community", "The University of East Africa"]
let [entitiesData, peopleData, institutionsData, publicationsData, eventsData, personInst, personPub] = await fetchData();
let STORY;
// await loadstory("EAISCA");
let storyIndex = 0;

renderStoryChoice();

d3.select("#other-story")
    .on("click", (e) => {
        d3.select("#scenario-choice-div")
        .style("display", "")
        d3.select("#scenario-div")
        .style("display", "none")
    })
    .attr("cursor", "pointer")


d3.select("#story-arrow-right")
    .on("click", (e) => {
        storyForward();
        updateStory()
    })
d3.select("#story-arrow-left")
    .on("click", (e) => {
        storyBackward();
        updateStory()
    })

// OLD
d3.select("#story-selection")
    .on("change", async (e, d) => {
        let storyName = e.target.value;
        await loadstory(storyName)
        storyIndex = 0;
        updateStory();
    })

function renderStoryChoice() {
    d3.select("#story-buttons")
    .selectAll(".storyButton")
    .data(STORIES)
    .join("div")
    .text(d => d)
    .on("click", (e, d) => {
        loadstory(d).then(() => {
            updateStory()
        })
    })
    .classed("storyButton", true)
    .attr("cursor", "pointer")
}

async function loadstory(storyName) {
    d3.select("#scenario-choice-div")
        .style("display", "none")
    d3.select("#scenario-div")
        .style("display", "")

    storyIndex = 0
    STORY = await d3.csv(`./data/stories/${storyName}.csv`)
    d3.select("#story-title")
        .html(storyName)
}

function storyForward() {
    storyIndex += 1;
    if (storyIndex > STORY.length - 1) storyIndex = STORY.length - 1;
}

function storyBackward() {
    storyIndex -= 1;
    if (storyIndex < 0) storyIndex = 0;
}

export function updateStory() {
    let [text, entities] = findStoryEntities(STORY[storyIndex].Text);

    d3.select("#story-time")
        .html(STORY[storyIndex].Date)
    d3.select("#story-text")
        .html(text)

    d3.select("#story-page")
        .html(`${storyIndex + 1} / ${STORY.length}`)

    updateNodeslinksSelection(entities.map(e => e.Name))
    // let entities = STORY[storyIndex].Entities.split(";")
    // entities.forEach(entity => {
    //     entity = entity.trim();
    //     updateNodelinkSelection(entity)
    // })
}

function findStoryEntities(text) {
    Array.prototype.insert = function (index, ...items) {
        this.splice(index, 0, ...items);
    };

    let textHTML = text;
    let foundEntities = [];
    entitiesData.forEach(entity => {
        let name = entity.Name;

        let alias = entity.Alias;

        let index = textHTML.indexOf(name);
        if (index != -1) {
            foundEntities.push(entity)
            let split = textHTML.split(name)
            let type = getEntityType(entity);
            let span = `<span class=span-${type}>${name}</span>`
            split.insert(1, span)
            textHTML = split.join("")
        } else if (alias) {
            let index = textHTML.indexOf(alias);
            if (index != -1) {
                foundEntities.push(entity)
                let split = textHTML.split(alias)
                let type = getEntityType(entity);
                let span = `<span class=span-${type}>${alias}</span>`
                split.insert(1, span)
                textHTML = split.join("")
            }
        }
    })
    return [textHTML, foundEntities];
}

function getEntityType(entity) {
    if (peopleData.includes(entity)) {
        return nodeTypes.person
    } else if (institutionsData.includes(entity)) {
        return nodeTypes.institution
    } else if (publicationsData.includes(entity)) {
        return nodeTypes.publication
    } else if (eventsData.includes(entity)) {
        return nodeTypes.event
    }
}




