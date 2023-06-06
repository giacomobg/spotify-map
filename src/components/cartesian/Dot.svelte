<script>
	import { getContext } from 'svelte';
	const { xGet, yGet, data } = getContext('LayerCake');
	export let r = 5;
	export let fill = '#000';
    export let colors = [];
</script>

<g class="scatter-group">
	{#each $data as d, i}
		<circle
			cx={$xGet(d)}
			cy={$yGet(d)}
			{r}
			fill={colors[i] || fill}
		/>
	{/each}
</g>

