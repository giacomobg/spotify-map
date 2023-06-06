<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import { forceSimulation, forceManyBody, forceCollide, forceX, forceY } from 'd3-force';

	const { data, width, height, rGet } = getContext('LayerCake');
	const dispatch = createEventDispatcher();

	export let projection;
	export let fixedSize;

	const forceXStrength = 5;
	const forceYStrength = 5;
	const chargeStrength = 2;
	const nodePadding = 3;
	
	const applySimulation = nodes => {
		if(!fixedSize) {
				const simulation = forceSimulation(nodes)
				.force(
					"cx",
					forceX()
						.x(d => $width / 2)
						.strength(0.02)
				)
				.force(
					"cy",
					forceY()
						.y(d => $height / 2)
						.strength(0.02)
				)
				.force(
					"x",
					forceX()
						.x(d => d.x0)
						.strength(forceXStrength)
				)
				.force(
					"y",
					forceY()
						.y(d => d.y0)
						.strength(forceYStrength)
				)
				.force("charge", forceManyBody().strength(chargeStrength))
				.force(
					"collide",
					forceCollide()
						.radius(d => $rGet(d) + nodePadding)
				)
				.stop();

			while (simulation.alpha() > 0.01) {
				simulation.tick();
			}

			return simulation.nodes();
		}
		return nodes;
		
    }

    $: fitExtentRange = [[8, 8], [$width - 8, $height - 8]];

    $: projectionFn = projection()
    .fitExtent(fitExtentRange, $data);

    $: circles = $data.features ? applySimulation($data.features.map(f => {
		// catch 02-09
        const centroid = projectionFn([f.properties.long,f.properties.lat]);

        let d = {};

		d.x0 = centroid[0];
		d.y0 = centroid[1];
		d.x = centroid[0];
		d.y = centroid[1];


		d.value = f.properties.value ||  5;
		d.fill = "#ccc";
						
		return f ? d : null;
	}).filter(d => d !== null)) : [];
</script>

<g class="map-group">
	{#each circles as circle}
		<circle
			class="feature-path"
            cx={circle.x}
            cy={circle.y}
			r={fixedSize ? fixedSize : $rGet(circle)}
			fill-opacity={fixedSize ? 1 : 0.5}
            fill={circle.fill}
			on:mouseenter="{dispatch('message',circle)}"
			on:mouseout="{dispatch('message', 'no-data')}"
			on:focus="{dispatch('message',circle)}"
			on:blur="{dispatch('message', 'no-data')}"
		/>
	{/each}
</g>

<style>
	.feature-path {
		stroke: #fff;
		stroke-width: 1px;
	}
	circle {
		transition: fill-opacity 0.5s;
	}
	circle:hover {
		fill-opacity: 0.8;
	}
</style>
Footer
