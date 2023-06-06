<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import { hexbin } from 'd3-hexbin';
	const { data, width, height } = getContext('LayerCake');
	const dispatch = createEventDispatcher();
	export let companyData;

	export let projection;

    export let showRaw;// = ['#368ae2',	'#5ea1e8', '#86b9ee',	'#afd0f3',	'#c2dcf6',	'#d7e8f9'].reverse()
    export let colorScale;// = d => scaleThreshold().domain([2, 4, 6, 8, 10]).range(colors).unknown('white')(d);
	export let isLoading;

    $: projectionFn = projection().fitExtent([[8, 8],[$width - 8, $height - 8]], $data);

    let hexbinData = [];
	$: hexbinFn = hexbin().extent([0, 0], [$width, $height]).radius(4);


	let circles;
	let hexbinDataInit;
	
	$: {
		companyData;

		isLoading = true;

		circles = companyData
				.filter(d => +d.lat !== 0 && +d.lon !== 0)
				.map((d, i) => {
					const point = projectionFn([d.lon,d.lat]);
					point.data = d;
									
					return point;
		}).filter(d => d !== null);
		
		hexbinDataInit = hexbinFn(circles);
		hexbinData = hexbinDataInit.map(d => {
			d.subtotal = d.reduce((prev, curr) => {
				return {
					count: prev.count + curr.data.count,
					total: prev.total + curr.data.total
				};
			}, {
				count: 0,
				total: 0,
			})

			d.subtotal = showRaw ? d.subtotal.count : (d.subtotal.count / d.subtotal.total) * 100;
			
			return d;
		})

		if(hexbinData.length > 0) {
			isLoading = false;
		}
	}
</script>

<path transform="translate(0,10)" d={projectionFn.getCompositionBorders()} stroke="#ccc" fill="none"></path>
<g class="map-group">
	{#each hexbinData as hex}
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<path
			class="feature-path"
            transform="translate({hex.x},{hex.y})"
			d={hexbinFn.hexagon()}
			fill-opacity={0.5}
            fill={colorScale(hex.subtotal)}
			on:click={() => dispatch('message', { hex, latch: true })}
			on:mouseenter={() => dispatch('message', { hex })}
			on:mouseout={() => dispatch('message', 'no-data')}
		/>
	{/each}
</g>

<style>
	.feature-path {
		stroke: #fff;
		stroke-width: 1px;
		transition: fill 0.5s, fill-opacity 0.5s;
		cursor: pointer;
	}
	.feature-path:hover {
		fill-opacity: 0.8;
	}
</style>