<script lang="ts">
    import * as d3 from "d3";
    import * as topojson from "topojson-client";

    // TODO: compute this auto?
    let width = 1000;
    let height = 900;
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
        let map = await d3.json("data/africa2@10.json")
        return map;
    }


    importData().then((data) => {
        let map = data
        // console.log(map)

        let g = d3.select("#map")
            .append("g")

        const path = d3.geoPath()
        const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

        function zoomed(event) {
            const {transform} = event;
            g.attr("stroke-width", 1 / transform.k);
        }

        const nations = g
            .append("g")
            .attr("cursor", "pointer")
            .selectAll("path")
            .data(topojson.feature(map, map.objects.continent_Africa_subunits).features)
            .join("path")
            // .on("click", clicked)
            .attr("d", path)
            .attr("transform", "scale(7)")
            .attr("stroke", "black")
            .attr("fill", "grey")
            .attr("stroke-width", 0.1);

        // g.append("text")
        //     .attr("transform", "translate(10,30)")
        //     .attr("font-size", "20")
        //     //.attr("font-family", "Verdana")
        //     .attr("font-weight", "bold")
        //     .text("Endangered and Active Languages in Africa");

        // if (active) {
        //     svg.append("g")
        //         .attr("transform", "translate(400,60), scale(0.5)")
        //         .append(() => Legend(d3.scaleSequentialSqrt([0, 290], colorsAct), {title: "Active Languages"}));
        //     nations.attr("fill", (d) => actColor(d.properties.Active_num))
        //     g.append("text")
        //         .attr("transform", "translate(20,50)")
        //         .attr("font-size", "12")
        //         //   .attr("font-family", "Verdana")
        //         .attr("font-weight", "bold")
        //         .text("Currently showing: Active");
        // } else {
        //     svg.append("g")
        //         .attr("transform", "translate(400,60), scale(0.5)")
        //         .append(() => Legend(d3.scaleSequentialSqrt([0, 170], colorsEnd), {title: "Endangered Languages"}));
        //     nations.attr("fill", (d) => endColor(d.properties.Endangered_num))
        //     g.append("text")
        //         .attr("transform", "translate(20,50)")
        //         .attr("font-size", "12")
        //         // .attr("font-family", "Verdana")
        //         .attr("font-weight", "bold")
        //         .text("Currently showing: Endangered");
        // }

        nations.append("title").text((d) => d.properties.geounit);
        g.call(zoom);
    })
</script>


<svg id="map" width="{width}" height="{height}">

</svg>
<!--<button on:click={increment}>-->
<!--  count is {count}-->
<!--</button>-->