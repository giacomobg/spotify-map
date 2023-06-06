<script>
	import { getContext } from 'svelte';

	const { data, custom, width, height } = getContext('LayerCake');

  export let projection;
  export let show = true;
  export let filter = "UK";
  export let filterField = "nuts";

	$: projectionFn = projection().fitExtent([[8, 8],[$width - 8, $height - 8]], $data);

  $: showLabels = show;

	$: labelData = $custom.labels.filter((d, i) => filter === "UK" ? i < 12 : d[filterField] === filter).map(d => {
    const point = projectionFn([d.long,d.lat]);
    return {
      point,
      data: point.map(d => d + "px"),
      label: d["ONS Name"]
    };
  })

  $: isUk = filter === "UK";
</script>

<div class="label-container {showLabels ? "" : "hide"}">
{#each labelData as cir}
  <div class="label {cir.point[0] + 25 > $width || (isUk && (cir.label === "Manchester" || cir.label === "Birmingham")) ? "right-label": ""}" style="transform:translate({cir.point[0] - 25}px, {cir.point[1] + 5}px)">
    <span class="bg">{isUk && cir.label === "Westminster" ? "London" : cir.label}</span>
  </div>
{/each}
</div>

<style>
  .label-container {
    overflow: hidden;
    height: 100%;
    position: relative;
    transition: opacity 0.5s;
  }

  .hide {
    opacity: 0;
    pointer-events: none;
  }

  div.label {
    position: absolute;
    border-radius: 25px;
    text-align: center;
    width: 50px;
    font-size: 12px;
  }

  .label:focus,
  .label:hover {
    z-index: 5;
  }

  .label:focus .bg,
  .label:hover .bg {
    background: #fff;
  }

  span.bg {
    background: rgba(255,255,255,0.75);
    border-radius: 25px;
  }

  .right-label.label:hover {
    background: none;
  }

  .right-label .bg {
    position: relative;
    top: 20px;
    left: -54px;
  }
</style>