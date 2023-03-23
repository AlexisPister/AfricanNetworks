<script lang="ts">
    import {onMount} from "svelte";

    import svelteLogo from './static/assets/svelte.svg'
    import Counter from './lib/Counter.svelte'
    import TimeLine from "./lib/TimeLine.svelte";
    import Map from "./lib/Map.svelte";

    import {GraphgraView} from "netpanorama/out-tsc/embedNetwork.js";


    // import bipartiteSpec from "../netpanorama/specs-local/person-institutions-bipartite-cartesian.json"
    // import tripartiteSpec from "../netpanorama/specs-local/person-institutions-publications-tripartite.json"
    // // import forceSpec from "../netpanorama/specs-local/person-institutions-forcegraph.json"
    // import forceSpec from "../netpanorama/specs-local/person-institutions-publications-force.json"
    // // import spec from "../netpanorama/specs-local/person-institutions-bipartite-cartesian.json"

    // import bipartiteSpec from "./static/netpanorama/specs-local/person-institutions-bipartite-cartesian.json"
    // import tripartiteSpec from "./static/netpanorama/specs-local/person-institutions-publications-tripartite.json"
    // import forceSpec from "./static/netpanorama/specs-local/person-institutions-publications-force.json"
    //
    // onMount(async () => {
    //     // Provide a specification (as a JOSN object, rather a string), and an object of options
    //     // This must include the id of the div in which the visualization should be rendered.
    //     const viewerForce = new GraphgraView(forceSpec, {container: "#force"})
    //     // Actually render the specification
    //     viewerForce.render();
    //
    //     const viewerBip = new GraphgraView(bipartiteSpec, {container: "#bipartite"})
    //     viewerBip.render();
    //
    //     const viewerTri = new GraphgraView(tripartiteSpec, {container: "#tripartite"})
    //     viewerTri.render();
    //
    //     // Optionally add the viewer object to the window, so that it can be conveniently access from Developer Tools for debugging.
    //     // The state can be accessed as viewer.state
    //     // window.viewer = viewer;
    // });


</script>

<main>
      <div id="main">
    <div>
        <h1>East African Networks</h1>
        <h3>Social dynamics in East Africa 19xx-19xx</h3>
    </div>
    <div>
        <TimeLine></TimeLine>
    </div>
    <div id="map-div">
        <Map></Map>
    </div>
      </div>

<!--<div id="netpan-grid">-->
<!--    <div>-->
    <h3> Node-Link Layouts</h3>
    <div id="netpan-grid">
        <div class="netpan-vis" id="force"></div>
        <div class="netpan-vis" id="bipartite"></div>
        <div class="netpan-vis" id="tripartite"></div>
    </div>
<!--</div>-->


</main>

<style>
    #main {
        display: grid;
        /*grid-templates-columns: 1fr 1fr 1fr;*/
        grid-template-columns: 1fr 3fr;
        /*grid-templates-rows: 1fr 1fr;*/
    }

    #map-div {
        grid-column: 1 / 3;
    }

    #netpan-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        /*grid-templates-rows: 3fr;*/
    }

    .netpan-vis {
        /*display: flex;*/
        width: 1000px;
        height: 1100px;
        border: 1px solid black;
        background-color: rgba(194, 191, 191, 0.2);
    }

</style>
