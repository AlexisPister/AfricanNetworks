<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import TimeLine from "./lib/TimeLine.svelte";
</script>

<main id="main">
<!--  <div id="main">-->
    <div>
        <h1>East African Networks</h1>
        <h3>Social dynamics in East Africa 1950-1960</h3>
    </div>
    <div>
        <TimeLine></TimeLine>
    </div>
<!--    <div>dziedjzied</div>-->
<!--    <div>dziedjzied</div>-->
<!--  </div>-->


</main>

<style>
  #main {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

</style>
