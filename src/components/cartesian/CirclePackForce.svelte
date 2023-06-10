<!--
  @component
  Generates an SVG force simulation using [d3-force](https://github.com/d3/d3-force). The values here are defaults which you will likely have to customize because every force simulation is different. This technique comes from @plmrry.
 -->
 <script>
    import { getContext } from 'svelte';
    import {
      forceSimulation,
      forceX,
      forceY,
      forceManyBody,
      forceCollide,
      forceCenter,
      forceLink
    } from 'd3-force';
  
    const { data, width, height, rScale, xScale, zScale, xGet, rGet, zGet } = getContext('LayerCake');
  
    /** @type {Number} [manyBodyStrength=5] - The value passed into the `.strength` method on `forceManyBody`, which is used as the `'charge'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#manyBody_strength) for more. */
    export let manyBodyStrength = -1;
  
    /** @type {Number} [xStrength=0.1] - The value passed into the `.strength` method on `forceX`, which is used as the `'x'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#x_strength) for more. */
    export let xStrength = 0.1;
  
    /** @type {String} [nodeColor] Set a color manually otherwise it will default to the `zScale`. */
    export let nodeColor = undefined;
  
    /** @type {String} [nodeStroke='#fff'] - The circle's stroke color. */
    export let nodeStroke = '#fff';
  
    /** @type {Number} [nodeStrokeWidth=1] - The circle's stroke width, in pixels. */
    export let nodeStrokeWidth = 1;
  
    /** @type {Boolean} [groupBy=true] - Group the nodes by the return value of the x-scale. If `false`, align all the nodes to the canvas center. */
    export let groupBy = true;

    export let selectedArtist = undefined;
    let selectedArtistX;
    let selectedArtistY;
    export let genres;
    let genresXY = {};
    genres.map((genre) => genresXY[genre.name] = {x:0, y:0});
    let genreNodes;
    let genreX;
    let genreY;

    let clickedArtist;
    let linkedArtistsIndices;
    let selectedLinkedArtistsIndices;

    let artistListensThreshold = 5;

    let selectedArtistLabelWidth = 0;
    let labelLRMargin = 5;

    let restart = 0;

    let mean = (array) => array.reduce((a, b) => a + b) / array.length;

    // export let links;
  
    /* --------------------------------------------
     * Make a copy because the simulation will alter the objects
     */
    const initialNodes = $data
      // .filter((d) => d.count >= artistListensThreshold)
      .map((d) => ({ ...d }));
    const simulation = forceSimulation(initialNodes)
    let nodes = [];
    simulation.on("tick", () => {

        nodes = simulation.nodes();

        // TODO: bit hacky - check on every simulation that the genre labels are set right
        genres = genres;

        // every simulation the genre and artist labels need to move
        setGenreXY(nodes);
        if (selectedArtist != undefined) {
          setSelectedArtistXY();
        };
    })
    console.log(initialNodes);

    // TODO: make a version that is both visually clean and fits into Svelte well?
    let intervalID;
    $: { 
      if (selectedArtist) {
        intervalID = setInterval(() => {
            if (document.getElementById('selected-artist')) {
              clearInterval(intervalID)
              selectedArtistLabelWidth = document.getElementById('selected-artist').getBBox().width;
            }
          },
        10);
      }
    }

    let links = null;
    fetch('./data/links.json')
        .then(response => response.json())
        .then(json => {
            links = json;
            console.log(links);
            // count up number of times each artist appears and set as their numlinks
            initialNodes.forEach((artist, i) => {
                artist.numLinks = links.filter(link => link.source == i || link.target == i).length;
            });
        });
  
    // let links = [];
    // initialNodes.forEach((source, i) => {
    //     for (let j = i+1; j < initialNodes.length; j++) {
    //         if (source.cluster === initialNodes[j].cluster) {
    //             links.push({source: i, target: j});
    //             source.numLinks += 1;
    //             initialNodes[j].numLinks += 1;
    //         }
    //     }
    // });

 

    /* ----------------------------------------------
     * When variables change, set forces and restart the simulation
     */

    let xyStrength;
    let rFactor;
    // changing the power changes the rate at which the bubbles scale with window size. Larger --> strength scales down faster at higher widths
    $: xyStrength = 8/($width**(10/10));
    $: rFactor = (0.4+$width/2500), restart++;

    $: restart, simulation
        .force('center', forceCenter($width / 2 + 30, $height / 2 + 50))
        .force('x', forceX().strength(xyStrength))
        .force('y', forceY().strength(xyStrength))
        .force('charge', forceManyBody().strength(-1.2))
        .force('link', forceLink(links)
            .distance(link => $rGet(link.source)*rFactor + $rGet(link.target)*rFactor)
            .strength(link => {
              return 0.5 / Math.min(link.source.numLinks, link.target.numLinks)**(3/2)
            })
        )
        .force('collision', forceCollide()
            .radius((d) => {
              return $rScale(d.collideR)*rFactor; // Divide this by two because an svg stroke is drawn halfway out
            })
            .strength(1)
            // .strength(0.9)
        )
        .alpha(1)
        .alphaDecay(0.0001)
        // .alphaDecay(0.0001)
        .alphaTarget(0.02)
        .velocityDecay(0.1)
        // .velocityDecay(0.5)
        .restart()

    function setGenreXY(nodes) {
      // loop through genresXY
      for (const genre in genresXY) {
        genreNodes = nodes.filter(node => node.genres.includes(genre));
        if (genreNodes.length == 0) {
          genreX = 0;
          genreY = 0;
        } else {
          genreX = mean(genreNodes.map(node => node.x));
          genreY = mean(genreNodes.map(node => node.y));
        }
        genresXY[genre] = {x: genreX, y: genreY};
      }
    }

    function setSelectedArtistXY() {
      selectedArtistX = selectedArtist.x;
      selectedArtistY = selectedArtist.y;
    }


    function onMouseover(e) {
        // let hoverBump = 400

        // return old selectedArtist to normal
        // if (selectedArtist) {
        //     nodes.map(node => node.index == selectedArtist.index ? node.collideR = node.collideR - hoverBump : null);
        //     restart++;
        // }

        // set new selectedArtist
        selectedArtist = e;

        // highlight new selectedArtist
        // nodes.map(node => node.index == selectedArtist.index ? node.collideR = node.collideR + hoverBump : null);
        // restart++;

        // linkedArtists = nodes.filter(node => node.genres.some(r=> selectedArtist.genres.includes(r)));
        // selectedLinkedArtistsIndices = linkedArtists.map(node => node.index);
    }

    function onMousedown(e) {
      // if (clickedArtist) {
      //   nodes.map(node => {
      //     if (node.index == clickedArtist.index) {
      //       node.fx = null;
      //       node.fy = null;
      //     };
      //   })
      //   restart++;
      // }

      // clickedArtist = e;
      // console.log(e);
      // nodes.map(node => {
      //   if (node.index == clickedArtist.index) {
      //     node.fx = $width/2;
      //     node.fy = $height/2;
      //   };
      // })
      // restart++;
    }

    let removeSpaces = (str) => str.replace(/ /g,'');
    let getLabelText = (genre) => {
      return document.getElementById("label-text-" + removeSpaces(genre));
    }
    // bboxes = {};
    // let textFunc = (genre) => {; return genre}

    // function drag(simulation) {    
    //   function dragstarted(event) {
    //     if (!event.active) simulation.alphaTarget(0.3).restart();
    //     event.subject.fx = event.subject.x;
    //     event.subject.fy = event.subject.y;
    //   }
      
    //   function dragged(event) {
    //     event.subject.fx = event.x;
    //     event.subject.fy = event.y;
    //   }
      
    //   function dragended(event) {
    //     if (!event.active) simulation.alphaTarget(0);
    //     event.subject.fx = null;
    //     event.subject.fy = null;
    //   }
      
    //   return d3.drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended);
    // }
  
  </script>

    <g id="circle-group">
      {#each nodes as point}
        <circle
          id={"circle"+point.index}
          class='node'
          r={$rGet(point)*(rFactor)}
          fill={nodeColor || (
            // selectedArtist != null && selectedArtist.index == point.index) ? "#222" : (
            // selectedArtist != null && selectedLinkedArtistsIndices.includes(point.index) ? "#83b5d1":
            $zGet(point)
            )}
          stroke={(selectedArtist != undefined && selectedArtist.index == point.index) ? "#F7DA1A" : nodeStroke}
          stroke-width={(selectedArtist != undefined && selectedArtist.index == point.index) ? "3px" :nodeStrokeWidth}
          cx='{point.x}'
          cy='{point.y}'
          on:mouseover={() => onMouseover(point)}
          on:focus={() => onMouseover(point)}
          on:mousedown={() => onMousedown(point)}
        >
          <!-- <title>{point[$custom.title]}</title> -->
        </circle>
      {/each}
    </g>

    {#each genres as genre}
      {#if genre.checked}
        <g
          transform={"translate(" + genresXY[genre.name].x + "," + genresXY[genre.name].y + ")"}
        >
          {#if getLabelText(genre.name) != undefined}
            <rect
              id={"label-background-" + removeSpaces(genre.name)}
              class="no-hover label-background"
              x={-getLabelText(genre.name).getBBox().width/2}
              y=-0.7em
              width={getLabelText(genre.name).getBBox().width + labelLRMargin*2}
              height=1.4em
              fill={((selectedArtist != undefined) && selectedArtist.genres.includes(genre.name)) ? "#F7DA1A" : "#ccc"}
            />
          {/if}
          <text
            id={"label-text-" + removeSpaces(genre.name)}
            class="no-hover label-text"
            x={labelLRMargin}
            y=0.3em
          >
            {genre.name}
          </text>

        </g>
        {/if}
    {/each}

    {#if selectedArtistY}
      <rect
        id="selected-artist-background"
        class="no-hover"
        x={selectedArtistX - selectedArtistLabelWidth/2 - labelLRMargin}
        y={selectedArtistY - 50}
        width={selectedArtistLabelWidth + labelLRMargin*2}
        height=2.2em
        fill="#F7DA1A"
        opacity=0.8
      />
      <text
        id="selected-artist"
        class="no-hover"
        x={selectedArtistX - selectedArtistLabelWidth/2}
        y={selectedArtistY - 30}
      >
        {selectedArtist.artistName}
      </text>
    {/if}

  <style>
    .label-background {
      opacity: 0.8;
    }
    .label-text {
      font-family: 'SalmaBold';
      text-anchor: middle;
    }
    #selected-artist {
      font-family: 'SalmaBold';
      font-size: 20px;
    }
    .no-hover {
      pointer-events: none;
    }
  </style>