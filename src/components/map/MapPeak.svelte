<script>
	import { getContext } from 'svelte';
	import { scaleLinear } from 'd3-scale';
    import { format } from "d3-format";

	const { data, width, height } = getContext('LayerCake');

    export let projection;
    export let mapPropKey; //nuts118nm
	
	export let range = [0, 5];
	export let domain = [0, 100];
	
	$: fitExtentRange = [[8, 8], [$width - 8, $height - 8]];

	$: projectionFn = projection()
	  .fitExtent(fitExtentRange, $data);

	$: peakScale = scaleLinear()
		.range(range)
		.domain(domain)

	$: path = (d) => {
		return 'M' + d
		.map(d => {
			return d.x + ',' + d.y;
		})
		.join('L');
	}

	$: layerFiltered = $data.features.map(d => {
		let value = d.properties.value;

		const peakWidth = 5; //$width * 0.01; // 5

		const point = projectionFn([d.properties.long,d.properties.lat]);
		const peak = [
			{x: point[0] - peakWidth, y: point[1] },
			{x: point[0], y: point[1] - peakScale(value) },
			{x: point[0] + peakWidth, y: point[1] }
		];

		return {
			data: peak,
			key: d.properties[mapPropKey],
			value,
		};
	}).filter(d => d.ignore !== true);

	$: legend = [1, 2, 4, 8].map((d, i) => {
		const scaleDomain = domain;
		const point = [$width - 50 - (i * 40), $height - 20];
		const value = scaleDomain[1] / d;
		const peakWidth = $width * 0.01; // 5

		return {
			x: point[0],
			y: point[1],
			data: [
				{x: point[0] - peakWidth, y: point[1] },
				{x: point[0], y: point[1] - peakScale(value) },
				{x: point[0] + peakWidth, y: point[1] }
			],
			value,
		}
	})
</script>

<g class="vis-group">
	{#each layerFiltered as peak}
		<path
			class="peak"
			fill="#fff"
			d="{path(peak.data)}"
		>
		<title>{peak.key} - {peak.value}</title>
		</path>
	{/each}
</g>
<g class="vis-legend">
	{#each legend as item}
		<path
			class="peak"
			fill="#fff"
			d="{path(item.data)}"
		>
		</path>
		<text x={item.x} y={item.y + 12}>{format(",")(item.value)}</text>
	{/each}
</g>

<style>
	path.peak {
		stroke: #222;
		fill-opacity: 0.01;
	}

	text {
		font-size: 0.75em;
		text-anchor: middle;
	}
</style>