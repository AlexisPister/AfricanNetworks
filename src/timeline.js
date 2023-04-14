let [width, height] = computeSvgDims("timeline")
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
}

// file global variables
let svg;
let persons;
let events;
let entities;
let publications;
let institutions;
let personsSel;
let x;
let y;
let yearMin = 1000;
let yearMax = 2200;

function parseEventDate(date) {
    return +date.slice(-4)
}

function parseYear(timeValue) {
    let year
    timeValue = timeValue.toString();
    if (timeValue[timeValue.length - 1] == "s") {
        year = timeValue.slice(-5, -1)
    }
    else {
        year = timeValue.slice(-4)
    }

    if (year == "" || isNaN(year) || year.length != 4) {
        return null
    }

    year = +year;
    // console.log(timeValue, year)
    return year;
}

async function importData() {
    persons = await d3.csv(`./data/${FOLDER}/People.csv`, d => {
        d["Date of birth"] = +d["Date of birth"];
        d["Date of death"] = +d["Date of death"];
        return d
    })

    events = await d3.csv(`./data/${FOLDER}/Events.csv`, d => {
        d["Date"] = parseEventDate(d["Date"])
        return d
    })

    publications = await d3.csv(`./data/${FOLDER}/Publications.csv`, d => {
        d["Date of closing"] = parseYear(d["Date of closing"])
        d["Date of Creation"] = parseYear(d["Date of Creation"])
        return d
    })

    institutions = await d3.csv(`./data/${FOLDER}/Institutions.csv`, d => {
        d["Date of closing"] = parseYear(d["Date of closing"])
        d["Date of Creation"] = parseYear(d["Date of Creation"])
        return d
    })

    return [persons];
}

importData().then(() => {
    entities = persons.concat(institutions).concat(publications);

    // persons = persons.filter(d => d["Date of birth"] && d["Date of death"])
    // persons.sort((a, b) => a["Date of birth"] - b["Date of birth"])

    // Filter and sort
    // entities = entities.filter(d => getBeginYear(d) && getEndYear(d))
    entities = entities.filter(d => getBeginYear(d))
    entities.sort((a, b) => getBeginYear(a) - getBeginYear(b))

    x = d3.scaleLinear()
        .domain([d3.min(entities, d => getBeginYear(d)), d3.max(entities, d => getEndYear(d))])
        .range([margin.left, width - margin.left - margin.right])
    y = d3.scaleBand()
        .domain(d3.range(entities.length))
        .range([margin.top, height - margin.bottom - margin.top])
        .padding(0.2)

    // x = d3.scaleLinear()
    //     .domain([d3.min(persons, d => d["Date of birth"]), d3.max(persons, d => d["Date of death"])])
    //     .range([0, width - margin.left - margin.right])
    // y = d3.scaleBand()
    //     .domain(d3.range(persons.length))
    //     .range([0, height - margin.bottom - margin.top])
    //     .padding(0.2)

    // TODO: check date format
    let axisBottom = d3.axisBottom(x)
        .tickPadding(2)
    // .tickFormat(d3.timeFormat("%y"))

    svg = d3.select("#timeline")
        .append("g")

    svg
        .append("g")
        // .attr("transform", (d,i)=>`translate(${margin.left} ${margin.top-10})`)
        .call(axisBottom)

    // personsSel = g
    //     .selectAll('.person')
    //     .persons(persons)
    //     .join((enter) => {
    //         let g = enter.append("g")
    //             .classed("person", true)
    //
    //         g.append("rect")
    //             .attr("x", d => x(d["Date of birth"]))
    //             .attr("y", (d, i) => y(i))
    //             .attr("width", d => x(d["Date of death"]) - x(d["Date of birth"]))
    //             .attr("height", d => y.bandwidth())
    //             .attr("fill", "rgb(150,150,150,0.2)")
    //
    //         g.append("text")
    //             .attr("x", d => x(d["Date of birth"]) + 5)
    //             .attr("y", (d, i) => y(i) + y.bandwidth() / 1.2)
    //             .text(d => d.Name)
    //
    //         return g
    //     })
    //
    // g
    //     .selectAll('.event')
    //     .persons(events)
    //     .join(enter => {
    //         let g = enter.append("g")
    //             .classed("event", true)
    //
    //         // g.append("line")
    //         //     .attr("x1", d => x(d.Date))
    //         //     .attr("x2", d => x(d.Date))
    //         //     .attr("y1", d => 0)
    //         //     .attr("y2", d => height)
    //         //     .attr("stroke", "red")
    //         //
    //         // g.append("text")
    //         //     .attr("x", d => x(d.Date) + 2)
    //         //     .attr("y", (d, i) => height - i * 100)
    //         //     .text(d => d.Name)
    //         //     .style("fill", "red")
    //
    //         return g
    //     })

    render()
})

function getBeginYear(d) {
    if (d["Date of birth"]) {
        return d["Date of birth"]
    } else if (d["Date of Creation"]) {
        return d["Date of Creation"]
    } else {
        return null
    }
}

function getEndYear(d) {
    if (d["Date of death"]) {
        return d["Date of death"]
    } else if (d["Date of closing"]) {
        return d["Date of closing"]
    } else {
        return null
    }
}

function render() {
    let entitiesSel = svg
        .selectAll('.entity')
        .data(entities)
        .join((enter) => {
            let g = enter.append("g")
                .classed("entity", true)

            g.append("rect")
                .attr("x", d => {
                    return x(getBeginYear(d))
                })
                .attr("y", (d, i) => y(i))
                .attr("width", d => {
                    if (getEndYear(d)) return x(getEndYear(d)) - x(getBeginYear(d))
                    return width - margin.left - margin.right - x(getBeginYear(d))
                })
                .attr("height", d => y.bandwidth())
                // .attr("fill", "rgb(150,150,150,0.2)")
                .attr("fill", d => {
                    let type = getEntityType(d)
                    if (type == nodeTypes.person) {
                        return PERSON_COLOR
                    } else if (type == nodeTypes.institution) {
                        return INSTITUTION_COLOR
                    } else if (type == nodeTypes.publication) {
                        return PUBLICATION_COLOR
                    }
                })
                .style("opacity", d => {
                    return 0.8
                })

            g.append("text")
                .attr("x", d => x(getBeginYear(d)) + 5)
                .attr("y", (d, i) => y(i) + y.bandwidth() / 1.1)
                .text(d => d.Name)
                .attr("font-size", "12pt")

            return g
        })

    // personsSel = svg
    //     .selectAll('.person')
    //     .data(persons)
    //     .join((enter) => {
    //         let g = enter.append("g")
    //             .classed("person", true)
    //
    //         g.append("rect")
    //             .attr("x", d => x(d["Date of birth"]))
    //             .attr("y", (d, i) => y(i))
    //             .attr("width", d => x(d["Date of death"]) - x(d["Date of birth"]))
    //             .attr("height", d => y.bandwidth())
    //             .attr("fill", "rgb(150,150,150,0.2)")
    //
    //         g.append("text")
    //             .attr("x", d => x(d["Date of birth"]) + 5)
    //             .attr("y", (d, i) => y(i) + y.bandwidth() / 1.2)
    //             .text(d => d.Name)
    //
    //         return g
    //     })

    svg
        .selectAll('.event')
        .data(events)
        .join(enter => {
            let g = enter.append("g")
                .classed("event", true)

            // g.append("line")
            //     .attr("x1", d => x(d.Date))
            //     .attr("x2", d => x(d.Date))
            //     .attr("y1", d => 0)
            //     .attr("y2", d => height)
            //     .attr("stroke", "red")
            //
            // g.append("text")
            //     .attr("x", d => x(d.Date) + 2)
            //     .attr("y", (d, i) => height - i * 100)
            //     .text(d => d.Name)
            //     .style("fill", "red")

            return g
        })
}

function getEntityType(entity) {
    if (persons.includes(entity)) {
        return nodeTypes.person
    } else if (institutions.includes(entity)) {
        return nodeTypes.institution
    } else if (publications.includes(entity)) {
        return nodeTypes.publication
    }
}

export function updateTimeLine(yearMinV, yearMaxV) {
    yearMin = yearMinV
    yearMax = yearMaxV
    render();
}

