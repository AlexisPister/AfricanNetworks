const UGANDA_YELLOW = "#FCDC04"
const UGANDA_RED = '#DA0000'
const KENYA_GREEN = "#006600"
const TANZANIA_BLUE = "#00A3DD"
const TANZANIA_GREEN = "#1EB53A"

// const PERSON_COLOR = "#1f77b4"
// const INSTITUTION_COLOR = "#2ca02c"
// const PUBLICATION_COLOR = "#8c564b"
// const EVENT_COLOR = "#509a9a"
const PERSON_COLOR = TANZANIA_BLUE
const INSTITUTION_COLOR = TANZANIA_GREEN
const PUBLICATION_COLOR = UGANDA_RED
const EVENT_COLOR = KENYA_GREEN

// const SELECTION_COLOR = "gold"
const SELECTION_COLOR = UGANDA_YELLOW

// const FOLDER = "march-19";
// const FOLDER = "april-02";
// const FOLDER = "april-26";
// const FOLDER = "april-27";
// const FOLDER = "may-02";
const FOLDER = "may-05";


const nodeTypes = {
    person: "person",
    institution: "institution",
    publication: "publication",
    event: "event"
}

const colorScale = d3.scaleOrdinal().domain(Object.values(nodeTypes)).range([PERSON_COLOR, INSTITUTION_COLOR, PUBLICATION_COLOR, EVENT_COLOR])

//  TODO: change capital of Tanzania
const COUNTRY_TO_CITY = {
    Kenya: "Nairobi",
    Uganda: "Kampala",
    // Tanzania: "Dodoma"
    Tanzania: "Dar es Salaam"
}

const PLACES_TO_KEEP = ["Kenya", "Nairobi", "Uganda", "Kampala", "Tanzania", "Dodoma"]

const RADIUS = 8;
const RADIUS_MAP = 4;
// Not needed if global import script tag
// export {PERSON_COLOR, INSTITUTION_COLOR, PUBLICATION_COLOR, EVENT_COLOR, SELECTION_COLOR}


const INST_LINK_TYPE = "Type of relationship (general)";
const PUB_LINK_TYPE = "Type of relationship (writer, reader, etc)";
const EVENT_LINK_TYPE = "Type of relationship (participated, created, against)"