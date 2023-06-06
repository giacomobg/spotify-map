<script>
	import { getContext } from 'svelte';
    import { pie, arc } from 'd3-shape';

    const { data, width, height } = getContext('LayerCake');

    export let colors;
    let selectedArc = 0;

    $: pieFn = pie().value(d => d.value)

    $: arcFn = arc()
        .innerRadius( 0.5 * Math.min($width, $height) / 2 )
        .outerRadius( 0.85 * Math.min($width, $height) / 2 );

    $: labelFn = arc()
        .innerRadius( 0.5 * Math.min($width, $height) / 2 )
        .outerRadius( 0.5 * Math.min($width, $height) / 2 );

    $: pieArcs = pieFn($data.sort((a, b) => b.value - a.value));

    $: $data, pieArcs = pieFn($data.sort((a, b) => b.value - a.value));

    $: total = $data.reduce((prev, curr) => prev += curr.value, 0);
</script>

<g 
    on:blur={() => selectedArc = 0}
    on:mouseout={() => selectedArc = 0} transform="translate({$width / 2}, {$height / 2})">
    {#each pieArcs as arc, i}
        <g 
            on:focus={() => selectedArc = i}
            on:mouseover={() => selectedArc = i} class="arc-{i}">
            <path class={i === selectedArc ? "show" : ""} d={arcFn(arc)} fill={colors?.[i] || "#ccc"}></path>
        </g>
    {/each}
    {#each pieArcs as arc, i}
        <g 
            on:focus={() => selectedArc = i}
            on:mouseover={() => selectedArc = i} class="text-{i}">
            <text
                class={i === selectedArc ? "show" : ""}
                dy="0em" 
                text-anchor={"middle"}
                transform="translate({0, 0})">
            {arc.data.key}
            </text>
            <text 
                transform="translate({0, 0})"
                dy="1.5em"
                class={i === selectedArc ? "show" : ""}
                text-anchor={"middle"}>
                {((arc.data.value / total) * 100).toFixed(1)}%
            </text>
        </g>
    {/each}
</g>

<style>
    text {
        opacity: 0;
        transition: opacity 0.5s;
    }

    path {
        fill-opacity: 0.75;
    }

    path.show,
    g.arc:hover text,
    text.show {
        opacity: 1;
        fill-opacity: 1;
    }

    path.show {
        stroke: #222;
        stroke-width: 2px;
    }
</style>