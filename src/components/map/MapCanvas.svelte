<script>
	import * as geo from 'd3-geo';
	import { getContext } from 'svelte';
	import { scaleCanvas } from 'layercake';

	const { data, width, height } = getContext('LayerCake');

	const { ctx } = getContext('canvas');

	export let projectionName = 'geoAlbersUsa';

	$: projection = geo[projectionName]().fitExtent([[8, 8],[$width - 8, $height - 8]], $data);

	$: geoPath = geo.geoPath(projection);

	$: {
		if ($ctx && geoPath) {
			scaleCanvas($ctx, $width, $height);
			$ctx.clearRect(0, 0, $width, $height);

			$ctx.beginPath();
			// Set the context here since setting it in `$: geoPath` is a circular reference
			geoPath.context($ctx);
			geoPath($data);
			$ctx.fillStyle = '#fff';
			$ctx.fill();
			$ctx.lineWidth = 1;
			$ctx.strokeStyle = '#e2e2e2';
			$ctx.stroke();
		}
	}
</script>
