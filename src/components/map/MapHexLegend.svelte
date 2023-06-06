
<script>
	import { getContext } from 'svelte';
	import { hexbin } from 'd3-hexbin';
    import { format } from 'd3-format';

	const { width, height } = getContext('LayerCake');
	export let colors;
    export let colorDomain;
    export let showRaw;
	
    const formatCount = format(",.0f");

	$: hexSize = $width > 600 ? 16 : 8;
	$: hexbinFn = hexbin().extent([0, 0], [$width, $height]).radius(hexSize);
	$: position = $width > 600 ? {
		y: (hexSize * 5),
		x: (hexSize * 18),
		hexY: (hexSize * 2),
        hexX: (hexSize * 0.5),
		textY: (hexSize * 5),
		textX: (hexSize * 4.5),
		textX2: (hexSize * 9)
	} : {
		y: (hexSize * 6),
		x: (hexSize * 22),
		hexY: (hexSize * 2),
        hexX: (hexSize * 2),
		textY: (hexSize * 8),
		textX: (hexSize * 5),
		textX2: (hexSize * 10)
	}

	$: legendData = colorDomain;

    $: isPerc = !showRaw;
	$: isMobile = $width < 600;
</script>

<g class="map-group" transform="translate({10},{10})">
	{#if isMobile}
	<rect
	x={-position.x * 0.15} y={-position.y * 0.4}
	width={position.x * 1.25} height={80} fill="#fff" />
	{/if}
	<text text-anchor="start" x={4}>{isPerc ? "%" : "No."} of companies in area matching SIC code</text>
	{#each legendData as legendItem, i}
		<path
			class="feature-path"
            transform="translate({5 + i * hexSize * 2 + (i * position.hexX)}, {position.hexY})"
			d={hexbinFn.hexagon()}
			fill-opacity={0.5}
            fill={colors(legendItem) || "#ccc"}
		/>
        <text y={5 + position.hexY + (hexSize * 2)} x={5 + i * hexSize * 2 + (i * position.hexX)} text-anchor="middle">{i === 0 ? ">" : ""}{isPerc ? legendItem : formatCount(legendItem)}{i === legendData.length - 1? `${isPerc ? "%" : ""}+` : ""}</text>
	{/each}
</g>

<style>
	.feature-path {
		stroke: none;
		stroke-width: 1px;
		transition: fill-opacity 0.5s, fill 0.5s;
	}
    .feature-path:hover {
        fill-opacity: 0.8;
    }
	text {
		font-size: 0.9em;
	}
	@media (max-height: 400px) {
		.feature-path {
			stroke-width: 0px;
		}
	}
</style>