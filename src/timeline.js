let [width, height] = computeSvgDims("timeline")
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
}

// file global variables
let svg;
let data;
let persons;
let events;
let personsSel;
let x;
let y;
let yearMin = 1000;
let yearMax = 2200;

function parseEventDate(date) {
    return +date.slice(-4)
}

async function importData() {
    let data = await d3.csv(`./data/${FOLDER}/People.csv`, d => {
        d["Date of birth"] = +d["Date of birth"];
        d["Date of death"] = +d["Date of death"];
        return d
    })

    let events = await d3.csv(`./data/${FOLDER}/Events.csv`, d => {
        d["Date"] = parseEventDate(d["Date"])
        return d
    })

    return [data, events];
}

importData().then((datas) => {
    // let [persons, events] = [datas[0], datas[1]];
    persons = datas[0]
    events = datas[1]

    data = persons.filter(d => d["Date of birth"] && d["Date of death"])
    data.sort((a, b) => a["Date of birth"] - b["Date of birth"])

    x = d3.scaleLinear()
        .domain([d3.min(data, d => d["Date of birth"]), d3.max(data, d => d["Date of death"])])
        .range([0, width - margin.left - margin.right])

    y = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([0, height - margin.bottom - margin.top])
        .padding(0.2)

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
    //     .data(data)
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
    //     .data(events)
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

function render() {
    personsSel = svg
        .selectAll('.person')
        .data(data)
        .join((enter) => {
            let g = enter.append("g")
                .classed("person", true)

            g.append("rect")
                .attr("x", d => x(d["Date of birth"]))
                .attr("y", (d, i) => y(i))
                .attr("width", d => x(d["Date of death"]) - x(d["Date of birth"]))
                .attr("height", d => y.bandwidth())
                .attr("fill", "rgb(150,150,150,0.2)")

            g.append("text")
                .attr("x", d => x(d["Date of birth"]) + 5)
                .attr("y", (d, i) => y(i) + y.bandwidth() / 1.2)
                .text(d => d.Name)

            return g
        })

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

export function updateTimeLine(yearMinV, yearMaxV) {
    yearMin = yearMinV
    yearMax = yearMaxV
    render();
}

