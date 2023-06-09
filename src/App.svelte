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
  let startingGenres = ["uk alternative hip hop", "grime", "melodic drill", "electronica", "wonky", "hyperpop", "uk contemporary r&b", "indie soul", "drum and bass","pop", "rap", "indie rock", "ukg revival", "deep dubstep"]
  let genreList = ["electronica", "uk alternative hip hop",
    "art pop", "wonky", "alternative r&b",
    "melodic drill", "hyperpop",
    "indie soul", "drum and bass",
    "lo-fi house", "ukg revival",
    "escape room", "pop", "indie rock", "edm", "azonto", "trip hop", "rap",
    "italian pop", "italian hip hop", "irish hip hop", "tamil pop", "chillhop", "neo-classical", 
    "urbano latino", "uk contemporary r&b", "london rap", "grime", "bass house", "deconstructed club", "classic dubstep", "uk drill"
  ];

  let colors = ["#d88373","#83b5d1","#6a041d","#dbd8b3","#324a5f"].concat(Array(0).fill("#999"));
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
    <br>The UK hip hop galaxy cycles round the margins, its constellations of <span class="highlighted-grey">grime</span> and <span class="highlighted-grey">drill</span> and <span class="highlighted-grey">alternative hip hop</span>.
    <br>The core planetary system is a continuum from <span class="highlighted-grey">UK contemporary R&B</span> to <span class="highlighted-grey">electronica</span>, flowing through Yaeji and FKA Twigs to <span class="highlighted-grey">hyperpop</span> and Sega Bodega,
    through a connecting strip of <span class="highlighted-grey">indie soul</span> and Bloc Party
    to chilled Mount Kimbie and the solar system of <span class="highlighted-grey">wonky</span> beats and its moons of <span class="highlighted-grey">lo-fi house</span> and <span class="highlighted-grey">dubstep</span>.
    <br>There were some surprises, like the <span class="highlighted-grey">UK garage revival</span> asteroid belt. 
    <br>Musicians without genres, or with very random ones, are the distant stars gleaming round the edges.
    <br>Hover over an artist bubble to see <span class="highlighted-yellow">their name</span> (labelled genres they belong to will go <span class="highlighted-yellow">yellow</span> too). They are sized by song plays - I listened to Clavish 263 times.
    </h4>

  <!-- {#if selectedArtist} -->
  {#if false}
    <div class='info-box'>
      <p class='info bold'>
        {selectedArtist.artistName}
      </p>
      <p class='info'>
        {@html selectedArtist.genres.join("<br>")}
      </p>
    </div>
    <div class='info-box info-box-right'>
      <!-- {#if linkedArtists.length > 1} -->
      {#if false}
        <p class='info bold'>Related artists</p>
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

  <h4>On your phone, try switching to landscape so it's all a bit less packed in<br></h4>
  <h4><span class="bold">Some notes on how this was created:</span>
    <br>I used Python to process the Spotify data, counting the number of plays per artist, removing all the ones I listened to 3 times or fewer.
    <br>I used the Spotify web API to search for each artist and get their genre. I searched by the artist's name, there was no ID in this dataset, which is why Dave, CRO and BOP for instance got the wrong genres.
    <br>I exported this data along with a list of all the pairs of artists sharing a genre.
    <br>Using d3-force, I was able to simulate physics, including forces that make any artists of the same genre gravitate together. That's how the bubbles know how to find each other and self-organise into clusters.
  </h4>
  <br>

  {#if genreData}
    <Checklist
      legend={"Click a genre to see where it turns up on the map.<br>There's too many... but there are fun ones like Italian underground hip hop and, err, brostep and Tamil pop? How did that get there..."}
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
    min-height: 440px;
    height: 85vw;
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
  .bold {
    font-family: 'SalmaBold';
  }

  .highlighted-yellow {
    background: #F7DA1A;
  }
  .highlighted-grey {
    background: #e0e0e0;
  }
</style>

