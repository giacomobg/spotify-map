<script>
  import { onMount } from 'svelte';
  import { format } from 'd3-format';
  
  // MAP_INCL
  import { feature } from 'topojson-client';
  import { geoAlbersUk } from 'd3-composite-projections';
  import Map from './graphics/deckMap.svelte';
  // MAP_INCL_END

  let isLoaded = false;

  onMount(() => {
      window.pymChild.sendHeight();
      setTimeout(() => isLoaded = true, 250);
  });

  ///////////////////////////////////////////////////
  // Map Config                                    //
  ///////////////////////////////////////////////////
  let features;
  let config;
  let data;

  fetch('./data/map/uk-topo.json', {mode: 'cors', cache: 'no-store' })
  .then(response => { return response.json() })
  .then(topojson => {
    config = {
      keyParse: d => d,
      valueParse: d => +d,
      formatTickX: d => d,
      formatTickY: format(',.0f'),
      projection: geoAlbersUk,
    }

    features = feature(topojson, topojson.objects.uk);
  });
  // MAP_INCL_END

</script>


<div class="embed-container">
  <h3>Chart title</h3>
  <h4>Chart subtitle</h4>

  <!-- MAP_INCL -->
  <div class='map-container {isLoaded ? "" : "isLoading"}'>
    {#if isLoaded}
    <Map {data} basemap={features} {config} mapPropKey={"nuts118nm"} />
    {/if}
  </div>
  <!-- MAP_INCL_END -->
  <!-- CARTESIAN_INCL_END -->

  <div class="source-text">Source: XXX</div>
</div>

<style>
  /* MAP_INCL */
  .map-container {
    position: relative; /* 100% turns into 100vh if you don't */
    min-height: 30em;
    grid-column: span 2;
    grid-row: span 2;
  }
  /* MAP_INCL_END */

</style>

