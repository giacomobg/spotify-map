<script>
	import { getContext } from 'svelte';
	import { scaleCanvas } from 'layercake';
	import { scaleLinear } from 'd3-scale';
	import { geoPath } from 'd3-geo';

	const { data, custom, width, height } = getContext('LayerCake');

	const { ctx } = getContext('canvas');

	export let projection;

	$: projectionFn = projection().fitExtent([[8, 8],[$width - 8, $height - 8]], $data);

	// $: postcodeMap = projection([postcodeLocation.lon, postcodeLocation.lat]);

	$: geoPathFn = geoPath(projectionFn);

	// $: layerData = $custom.layerData;
	$: mapData = $custom.outline;

	// $: layerMapped = layerData.map(d => {
	// 		const point = projection([d.lon,d.lat]);

	// 		return {
	// 			data: point,
	// 			fill: d.fill
	// 		};
	// 	});
	
	$: {
		if ($ctx && geoPathFn) {
			scaleCanvas($ctx, $width, $height);
			$ctx.clearRect(0, 0, $width, $height);

			$ctx.beginPath();
			// Set the context here since setting it in `$: geoPathFn` is a circular reference
			geoPathFn.context($ctx);
			geoPathFn(mapData);
			$ctx.fillStyle = '#ffffff';
			$ctx.fill();
			$ctx.lineWidth = 1;
			$ctx.strokeStyle = '#ccc';
			$ctx.stroke();

			/* --------------------------------------------
			 * Draw our scatterplot
			 */
			// layerMapped.forEach(d => {
			// 	$ctx.beginPath();
			// 	$ctx.arc(d.data[0], d.data[1], r, 0, 2 * Math.PI, false);
			// 	// $ctx.globalAlpha = 0.25;
			// 	$ctx.fillStyle = d.fill;
			// 	$ctx.fill();
			// });

			// if(postcodeLocation.lon) {
			// 	$ctx.beginPath();
			// 	$ctx.arc(postcodeMap[0], postcodeMap[1], 10, 0, 2 * Math.PI, false);
			// 	$ctx.strokeStyle = "#222";
			// 	$ctx.lineWidth = 4;
			// 	$ctx.globalAlpha = 0.5;
			// 	$ctx.stroke();
			// }
		}
	}
</script>