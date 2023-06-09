<script>
  import { onMount } from 'svelte';

  import { csvParse } from 'd3-dsv';
  import { format } from 'd3-format';
  import { scaleBand, scaleOrdinal, scalePoint } from 'd3-scale';

  // CARTESIAN_INCL
  import Cartesian from './graphics/cartesian.svelte';
  import ForceLayout from './components/cartesian/CirclePackForce.svelte';
  // CARTESIAN_INCL_END

  import Checklist from './components/Checklist.svelte';

  let isLoaded = false;

  onMount(() => {
      window.pymChild.sendHeight();
      setTimeout(() => isLoaded = true, 250);
  });

  let genres;
  let genresFlat = [];
  let genresUnique;
  let genreData;
  let counts = {};
  let genreUseList = false;
  let genreSelectedThreshold = 9;
  let genreThreshold = 3;
  let artistThreshold = 3;
  let startingGenres = ["uk alternative hip hop", "grime", "melodic drill", "electronica", "wonky", "hyperpop", "art pop", "uk contemporary r&b", "indie soul", "drum and bass","pop", "rap", "indie rock", "lo-fi house", "ukg revival"]
  let genreList = ["electronica", "uk alternative hip hop",
    "art pop", "wonky", "alternative r&b",
    "melodic drill", "hyperpop",
    "indie soul", "drum and bass",
    "lo-fi house", "ukg revival",
    "escape room", "pop", "indie rock", "edm", "azonto", "trip hop", "rap",
    "italian pop", "italian hip hop", "irish hip hop", "tamil pop", "chillhop", "neo-classical", 
    "urbano latino", "uk contemporary r&b", "london rap", "grime", "bass house", "deconstructed club", "classic dubstep", "uk drill"
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
      .sort((a,b) => counts[b] - counts[a])
      .filter((genre) => {
        if (genreUseList) {
          return genreList.includes(genre)
        } else { 
          return counts[genre] > genreThreshold
        }
      })
      .filter((genre, index, arr) => arr.indexOf(genre) === index);
    console.log(genresUnique);
    genreData = genresUnique.map((genre, i) => (
      {
          name: genre,
          checked: startingGenres.includes(genre)
      }
    ));

  });
  // CARTESIAN_INCL_END



</script>


<div class="embed-container">
  <h3>My Spotify universe</h3>
  <h4>
    <br>My listening data for the last year, as a set of moving celestial bodies in gravitation towards an orbit.
    <br>The UK hip hop galaxy cycles round the margins, its constellations of grime and drill and 'alternative' hip hop.
    <br>The core planetary system is a continuum from Joy Crookes and UK contemporary R&B to electronic music, passing through FKA Twigs, escape room (one of those genres completely made up by Spotify),
    hyperpop, through Charli XCX's art pop, Bloc Party's indie rock, uncategorisable Jamie XX and Mount Kimbie to the solar system of wonky beats and its moons of lo-fi house and 'classic' dubstep.
    <br>There were some surprises, like the UK garage revival asteroid belt. 
    <br>Musicians without genres, or with very random ones, are the distant stars that sit around the edges.
    <br>Hover over an artist bubble to see <span class="highlighted">their name</span> (genres they belong to will go <span class="highlighted">yellow</span> too). They are sized by song plays; I only included ones I listened to at least 3 times.
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
      {#if chartData && genreData}
        <Cartesian data={chartData} {config}>
          <!-- {#if links} -->
            <ForceLayout
              bind:selectedArtist={selectedArtist}
              genres={genreData}
              nodeStroke={"#fff"} 
            />                        
          <!-- {/if} -->
        </Cartesian>
      {/if}
    </div>
    
    <!-- CARTESIAN_INCL_END -->

  </div>

  <h4>On your phone, try switching to landscape so it's all a bit less packed in<br><br></h4>

  {#if genreData}
    <Checklist
      legend={"You can pick a genre to see where it turns up on the map.<br>There's a lot... but there are fun clusters like Italian underground hip hop, and, err, brostep and Tamil pop? How did that get there..."}
      bind:entries={genreData}
    ></Checklist>
  {/if}

  <!-- <div class="source-text">Source: XXX</div> -->
</div>

<style>
  /* CARTESIAN_INCL */
  .area-container,
  .col-container {
    position: relative; /* 100% turns into 100vh if you don't */
    min-height: 450px;
    height: 70vw;
    /* max-height: 80vh; */
    width: 100vw;
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

