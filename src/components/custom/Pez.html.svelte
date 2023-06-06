<script>
	import { getContext } from 'svelte';

	const { data, width, height } = getContext('LayerCake');

	/* --------------------------------------------
	 * Default parameters
	 */

	export let colorScale = 'grey';
	export let internalPadding = 2;

	$: color = d => typeof(colorScale) === 'function' ? colorScale(d) : colorScale;
	

	$: console.log(color(10))
</script>

<div class='pez-container'>
{#each $data as d}
	<div style='width: {$width/$data.length - internalPadding}px;
				height: {$height}px;
				margin: 0 {internalPadding/2}px 0 {internalPadding/2}px;
				background-color: {color(d.value)}' />
{/each}
</div>

<style>
	.pez-container{
		display: inline-flex;
	}
</style>