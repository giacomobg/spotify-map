<script>
	import { getContext } from 'svelte';
    import { timeFormat } from 'd3-time-format';
	const { padding, width, flatData, xGet, yGet } = getContext('LayerCake');
	
    export let mouseCoordinates;
    export let colors = ["#777", "#f77"];

    const dateFormat = timeFormat("%b %Y");

	let datums;
    
	/* 
		'$flatData.filter(datum => datum.key === Ykey)' will not work if Ykey is a date. We need to convert Dates to Int.
    	Two identical dates are not equal because they are two different objects (even if they have the same value).
	*/
	const dateTypeParser = (value) => Object.prototype.toString.call(value) === '[object Date]' ? Number(value) : value;
	function findKey(xCoordinate){
		let yKey;
		let minDistance = Infinity;
		$flatData.forEach(d => {
			const distance = Math.abs($xGet(d) - xCoordinate);
			if(distance < minDistance){
				yKey = dateTypeParser(d.key);
				minDistance = distance;
			}
		});

		return yKey;
	}
	function findDatums(mouseCoordinates){
        if(mouseCoordinates) {
            let key = findKey(mouseCoordinates[0]);
            let datum = $flatData.filter(datum => dateTypeParser(datum.key) === key);
            return datum;
        }
        return [];
	}

	function getTextX(x) {
		return x > $width * 0.75 ? x - 100 : x;
	}
	$: datums = findDatums(mouseCoordinates);
	$: mouseCoordinates, datums = findDatums(mouseCoordinates);
</script>

<div class='line-tooltip'> 
	{#if datums && datums.length > 0}
		<div style='left:{$xGet(datums[0])}px; width:{$width - $xGet(datums[0]) + $padding.right}px;' class='rect' />
		<div style='left:{$xGet(datums[0])}px;' class='line' />
		<div style='left:{getTextX($xGet(datums[0])) + 4}px;background-color: white; opacity: 0.8;' class='yKey' > {dateFormat(datums[0].key)} </div>
		{#each datums as datum, i}
            <div class="dot-container" style='left:{$xGet(datum)}px; top:{$yGet(datum)}px;' >
                <div style='background-color:{colors[i]};' class='dot' />
                <div style='top:{(Math.abs(i > 0 && datum.value - datums[i - 1].value < 0.2 ? i * 24 : 0))}px; width:{$width - $xGet(datums[0]) + $padding.left - $padding.right}px; color:{colors[i]}' class='text'>{(datum.value).toFixed(1)}%</div>
            </div>
		{/each}
	{/if}

</div>

<style>
	.line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		border-left: 2px dashed #ccc;
		transform: translate(-1px);
		pointer-events: none;
	}
	.yKey {
		position: absolute;
		bottom: 0;
		color: #666;
		transform: translate(0.5em);
		pointer-events: none;
	}
	.rect {
		position: absolute;
		top: 0;
		bottom: 0;
		pointer-events: none;
		background-color: white;
		opacity: 0.75;
	}
    .dot-container {
        position: absolute;
        pointer-events: none;
    }
	.dot {
		width: 0.75em;
	    height: 0.75em;
	    transform: translate(-0.375em, -0.375em);
	    border: 2px solid white;
	    border-radius: 100%;
	}
	.text {
		transform: translate(0.5em, -0.7em);
        position: relative;
	}
	.line, .yKey, .rect, .dot, .text, .dot-container {
		transition: left 250ms ease-out, top 250ms ease-out, width 250ms ease-out;
	}
</style>