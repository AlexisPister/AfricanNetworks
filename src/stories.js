import {forceViewer, updateNodelinkSelection} from "./main.js";

function loadstory() {
    let data = d3.csv("./data/stories/EAISCA.csv")
    return data
}

let STORY = await loadstory();
console.log(222, STORY)

// Toy Example
// let STORY = [
//     `Tom Mboya, labour leader and nationalist politician, is first in contact with Robert Gabor, a Hungarian exile in the United States with ties to the CIA. Gabor runs the International Feature Service (IFS), an anti-communist wire service for newspapers across the globe. Mboya publishes two articles with the IFS, which were reproduced in 25 newspapers around the world.`,
//     `International Feature Service becomes Peace with Freedom, a non-profit organization that apparently acted as a CIA front organization. Peace with Freedom made monthly donations to the Kenya Federation of Labour, the trade union umbrella body run by Mboya, until June 1964. With Heinz Putzrath of the Friedrich Ebert Foundation, Peace with Freedom funds the printing and publishing of the KFL’s newspaper, Mfanyi Kazi.`,
//     `Gabor, Putzrath, George Githii, at this time a close ally of Mboya, and Tony Hughes, press secretary for KANU, agree to found the East African Institute of Social and Cultural Affairs. Githii was the inaugural general secretary. A governing board – including Bibi Titi Mohamed, Wilbert Chagula and Okot p’Btek – was formed but never meets.`
// ]

let storyIndex = 0;

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


function storyForward() {
    storyIndex += 1;
    if (storyIndex > STORY.length - 1) storyIndex = STORY.length - 1;
}

function storyBackward() {
    storyIndex -= 1;
    if (storyIndex < 0) storyIndex = 0;
}

export function updateStory() {

    d3.select("#story-time")
        .html(STORY[storyIndex].Date)
    d3.select("#story-text")
        .html(STORY[storyIndex].Text)
    d3.select("#story-page")
        .html(`${storyIndex + 1} / ${STORY.length}` )

    let entities = STORY[storyIndex].Entities.split(";")

    entities.forEach(entity => {
        entity = entity.trim();
        updateNodelinkSelection(entity)
    })
}




