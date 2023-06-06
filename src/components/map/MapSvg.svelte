
<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import { geoPath } from 'd3-geo';
	import { raise } from 'layercake';
  
	const { data, width, height, custom } = getContext('LayerCake');
  
	/** @type {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`. */
	export let projection;
  
	/** @type {String} [fill] - The shape's fill color. By default, the fill will be determined by the z-scale, unless this prop is set. */
	export let fill = () => "#FAFAFA";
  
	/** @type {String} [stroke='#333'] - The shape's stroke color. */
	export let stroke = '#333';
  
	/** @type {Number} [strokeWidth=0.5] - The shape's stroke width. */
	export let strokeWidth = 0.5;
  
	/** @type {Array} [features] - A list of GeoJSON features. Use this if you want to draw a subset of the features in `$data` while keeping the zoom on the whole GeoJSON feature set. By default, it plots everything in `$data.features` if left unset. */
	export let features = undefined;
  
	/* --------------------------------------------
	 * Here's how you would do cross-component hovers
	 */
	const dispatch = createEventDispatcher();
  
	$: fitExtentRange = [[8, 8], [$width - 8, $height - 8]];
  
	$: projectionFn = projection()
	  .fitExtent(fitExtentRange, $data);

	$: geoPathFn = geoPath(projectionFn);
  
	function handleMousemove(feature) {
	  return function handleMousemoveFn(e) {
		raise(this);
		// When the element gets raised, it flashes 0,0 for a second so skip that
		if (e.layerX !== 0 && e.layerY !== 0) {
		  dispatch('mousemove', { e, props: feature.properties });
		}
	  }
	}

	// TODO: what is the most performant way to update the colour
	// accounting for value (numerical) and categorical?
  </script>
  
  {#if projectionFn.getCompositionBorders}
  <path transform="translate(0,10)" d={projectionFn.getCompositionBorders()} stroke="#ccc" fill="none"></path>
  {/if}
  <g 
  	class="bg-group">
  	{#if $custom.bg}
	  {#each $custom.bg.features as feature}
		<path
			fill="none"
			stroke={stroke}
			stroke-width={strokeWidth / 2}
			d="{geoPathFn(feature)}"
		></path>
	  {/each}
	{/if}
	</g>
  <g
	class="map-group"
	on:mouseout={(e) => dispatch('mouseout')}
	on:blur={(e) => dispatch('mouseout')}
  >
	{#each (features || $data.features) as feature}
	  <path
		class="feature-path"
		fill="{fill(feature)}"
		stroke={stroke}
		stroke-width={strokeWidth}
		d="{geoPathFn(feature)}"
		on:mouseover={(e) => dispatch('mousemove', { e, props: feature.properties })}
		on:focus={(e) => dispatch('mousemove', { e, props: feature.properties })}
		on:mousemove={handleMousemove(feature)}
	  ></path>
	{/each}
  </g>
  
  <style>
	.feature-path { 
		transition: fill 0.5s, fill-opacity 0.5s;
	} 
	.feature-path:hover {
	  stroke: #000;
	  stroke-width: 2px;
	}
	/**
	 * Disable the outline on feature click.
	 * Depending on map funtionality and accessiblity issues,
	 * you may not want this rule. Read more:
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/:focus
	 * https://github.com/mhkeller/layercake/issues/63
	 */
	.feature-path:focus {
	  outline: none;
	}
  </style>