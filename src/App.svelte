<script>
  import { onMount } from 'svelte';

  import { csvParse } from 'd3-dsv';
  import { format } from 'd3-format';
  import { scaleBand, scaleOrdinal, scalePoint } from 'd3-scale';

  // CARTESIAN_INCL
  import Cartesian from './graphics/cartesian.svelte';
  import ForceLayout from './components/cartesian/CirclePackForce.svelte';
  // CARTESIAN_INCL_END

  import RadioButtonToggle from './components/RadioButtonToggle.svelte';

  let isLoaded = false;

  onMount(() => {
      window.pymChild.sendHeight();
      setTimeout(() => isLoaded = true, 250);
  });

  let genres;
  let genresFlat = [];
  let genresUnique;
  let counts = {};
  let genreUseList = true;
  let genreThreshold = 10;
  let genreList = ["electronica", "uk alternative hip hop", "grime",
    "art pop", "wonky", "alternative r&b",
    "melodic drill", "hyperpop",
    "indie soul", "drum and bass",
    "lo-fi house", "ukg revival"
  ];

  let colors = ["#83b5d1","#6a041d","#dbd8b3","#324a5f","#d88373"].concat(Array(0).fill("#999"));
  // let colors = ["#dbd8b3","#d88373","#6a041d"];
  let config = {
    rKey: "count",
    zKey: "index",
    zRange: colors,
    zScale: scaleOrdinal()
  };
  let data;

  let selectedArtist = undefined;
  let linkedArtists;

  ///////////////////////////////////////////////////
  // Chart Configuration                           //
  ///////////////////////////////////////////////////
  let chartData;
  let customData; // pie chart sorts, which messes up the line chart.

  // CARTESIAN_INCL
  fetch('./data/data.csv', {mode: 'cors', cache: 'no-store' })
  .then(response => { return response.text() })
  .then(csv => {
    chartData = csvParse(csv);

    chartData = chartData.map(d => {
      genres = JSON.parse(d.genres[1] == "'" ? d.genres.replace(/'/g, '"') : d.genres);
      genresFlat.push(...genres)
      return {
        ...d,
        genres,
        count: +d.count,
        collideR: +d.count,
        popularity: +d.popularity,
        numLinks: 0
      }
    })

    // count number of genres
    for (const num of genresFlat) {
      counts[num] = counts[num] ? counts[num]+1 : 1;
    }

    genresUnique = genresFlat
      .filter((genre) => {
        if (genreUseList) {
          return genreList.includes(genre)
        } else { 
          return counts[genre] > genreThreshold
        }
      })
      .filter((genre, index, arr) => arr.indexOf(genre) === index);
    console.log(genresUnique);

  });
  // CARTESIAN_INCL_END

</script>


<div class="embed-container">
  <h3>A visual map of my Spotify listens</h3>
  <h4>
    <br>Hover over an artist to see their <span class="highlighted">name</span>. Any labelled genre it belongs to will go <span class="highlighted">yellow</span>.
    <br>Each circle is an artist, sized by the number of times I listened to their songs.
    <br>These are all the artists I listened to at least 10 times in one year and I downloaded the data in March 2023. 
    <br>I picked some of the most frequent and most distinct genres to label and they are centred amongst their artist bubbles.
    <!-- Any genre associated with at least {genreThreshold} artists has a label -->
    <br>Some artists have lots of genres assigned. Some have none or they don't make sense - those generally end up on the outer edges. 
    </h4>

  <!-- {#if selectedArtist} -->
  {#if false}
    <div class='info-box'>
      <p class='info info-head'>
        {selectedArtist.artistName}
      </p>
      <p class='info'>
        {@html selectedArtist.genres.join("<br>")}
      </p>
    </div>
    <div class='info-box info-box-right'>
      <!-- {#if linkedArtists.length > 1} -->
      {#if false}
        <p class='info info-head'>Related artists</p>
        <p class='info'>
          {
            @html linkedArtists
              .map(artist => artist.artistName)
              .filter(name => name !== selectedArtist.artistName)
              .join("<br>")
          }
        </p>
      {/if}
    </div>
  {/if}
  <div class="grid">
    
    <!-- CARTESIAN_INCL -->
    <div class='area-container {chartData ? "" : "isLoading"}'>
      {#if chartData}
        <Cartesian data={chartData} {config}>
          <!-- {#if links} -->
            <ForceLayout
              bind:selectedArtist={selectedArtist}
              bind:linkedArtists={linkedArtists}
              genres={genresUnique}
              nodeStroke={"#fff"} 
            />                        
          <!-- {/if} -->
        </Cartesian>
      {/if}
    </div>
    
    <!-- CARTESIAN_INCL_END -->

  </div>

  <!-- <div class="source-text">Source: XXX</div> -->
</div>

<style>
  /* CARTESIAN_INCL */
  .area-container,
  .col-container {
    position: relative; /* 100% turns into 100vh if you don't */
    height: 120vw;
    max-height: 80vh;
    max-width: 100vw;
  }
  /* CARTESIAN_INCL_END */
  
  button {
    z-index: 100;
    /* position: absolute; */
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    position: relative;
    grid-gap: 1em;
  }
  
  .info-box {
    position: absolute;
  }
  .info-box-right {
    right: 0px;
  }
  .info {
    font-family: 'Salma';
    font-size: 24px;
    line-height: 1.1em;
  }
  .info-head {
    font-family: 'SalmaBold';
  }

  .highlighted {
    background: #F7DA1A;
  }
</style>

