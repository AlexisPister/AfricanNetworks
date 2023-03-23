// TODO: compute this auto?
let width = 1000;
let height = 1000;
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
}

function parseEventDate(date) {
    return +date.slice(-4)
}

async function importData() {
    // let data = await d3.csv("../data/march-19/People.csv", d => {
    let data = await d3.csv("./src/static/assets/data/march-19/People.csv", d => {
    // let data = await d3.csv("src/static/assets/data/march-19/People.csv", d => {
    // let data = await d3.csv("src/static/assets/data/march-19/People.csv", d => {
    // let data = await d3.csv("./src/static/assets/data/march-19/People.csv", d => {
        // d["Date of Birth"] = Number(d["Date of Birth"]);
        // d["Date of Birth"] = parseInt(d["Date of Birth"]);
        d["Date of birth"] = +d["Date of birth"];
        d["Date of death"] = +d["Date of death"];
        return d
    })

    let events = await d3.csv("../data/march-19/Events.csv", d => {
    // let events = await d3.csv(".static/assets/data/march-19/Events.csv", d => {
    // let events = await d3.csv("src/static/assets/data/march-19/Events.csv", d => {
    // let events = await d3.csv("../static/assets/data/march-19/Events.csv", d => {
        d["Date"] = parseEventDate(d["Date"])
        return d
    })

    return [data, events];
}

importData().then((datas) => {
    let [persons, events] = [datas[0], datas[1]];

    let data = persons.filter(d => d["Date of birth"] && d["Date of death"])
    data.sort((a, b) => a["Date of birth"] - b["Date of birth"])

    let x = d3.scaleLinear()
        .domain([d3.min(data, d => d["Date of birth"]), d3.max(data, d => d["Date of death"])])
        .range([0, width - margin.left - margin.right])

    let y = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([0, height - margin.bottom - margin.top])
        .padding(0.2)

    // TODO: check date format
    let axisBottom = d3.axisBottom(x)
        .tickPadding(2)
    // .tickFormat(d3.timeFormat("%y"))

    let g = d3.select("#timeline")
        .append("g")

    g
        .append("g")
        // .attr("transform", (d,i)=>`translate(${margin.left} ${margin.top-10})`)
        .call(axisBottom)

    g
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

            // return enter
            return g
        })

    g
        .selectAll('.event')
        .data(events)
        .join(enter => {
            let g = enter.append("g")
                .classed("event", true)

            g.append("line")
                .attr("x1", d => x(d.Date))
                .attr("x2", d => x(d.Date))
                .attr("y1", d => 0)
                .attr("y2", d => height)
                .attr("stroke", "red")

            g.append("text")
                .attr("x", d => x(d.Date) + 2)
                .attr("y", (d, i) => height - i * 100)
                .text(d => d.Name)
                .style("fill", "red")

            return g
        })

})

