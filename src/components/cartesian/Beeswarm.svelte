<script>
	import { getContext } from 'svelte';
    import { ascending, range, max } from 'd3-array';
	const { xGet, yGet, data, width, height } = getContext('LayerCake');
	export let r = 5;
	export let fill = '#000';
    export let colors = [];

    // SRC: https://observablehq.com/@yurivish/building-a-better-beeswarm
    const swarm = (data, x, r, symmetric = true) => {
        let priority = d => -d.value;
        let circles = data
            .map((d, index) => ({
            datum: d,
            x: x(d),
            y: Infinity,
            r: r(d),
            priority: priority(d),
            index
            }))
            .sort((a, b) => ascending(a.x, b.x));

        console.log(circles);

        let indices = range(0, circles.length)
            .sort((a, b) => ascending(circles[a].priority, circles[b].priority));
        indices.forEach((index, order) => (circles[index].order = order));

        for (let d of circles) {
            if (d.x == undefined)
            throw new Error('x is undefined for datum at index ' + d.index);
            if (d.r == undefined)
            throw new Error('r is undefined for datum at index ' + d.index);
            if (d.priority == undefined)
            throw new Error('priority is undefined for datum at index ' + d.index);
        }
        let { sqrt, abs, min } = Math;
        let maxRadius = max(circles, d => d.r);
        for (let index of indices) {
            let intervals = [];
            let circle = circles[index];
            // scan adjacent circles to the left and right
            for (let step of [-1, 1])
            for (let i = index + step; i > -1 && i < circles.length; i += step) {
                let other = circles[i];
                let dist = abs(circle.x - other.x);
                let radiusSum = circle.r + other.r;
                // stop once it becomes clear that no circle can overlap us
                if (dist > circle.r + maxRadius) break;
                // don't pay attention to this specific circle if
                // it hasn't been placed yet or doesn't overlap us
                if (other.y === Infinity || dist > radiusSum) continue;
                // compute the distance by which one would need to offset the circle
                // so that it just touches the other circle
                let offset = sqrt(radiusSum * radiusSum - dist * dist);
                // use that offset to create an interval in which this circle is forbidden
                intervals.push([other.y - offset, other.y + offset]);
            }
            // We're going to find a y coordinate for this circle by finding
            // the lowest point at the edge of any interval where it can fit.
            // This is quadratic in the number of intervals, but runs fast in practice due to
            // fact that we stop once the first acceptable candidate is found.
            let y = 0;
            if (intervals.length) {
            let candidates = intervals
                .flat()
                .sort((a, b) => ascending(abs(a), abs(b)));
            for (let candidate of candidates) {
                if (!symmetric && candidate > 0) continue;
                if (intervals.every(([lo, hi]) => candidate <= lo || candidate >= hi)) {
                y = candidate;
                break;
                }
            }
            }
            circles[index].y = y;
        }
        return circles;
    }

    $: circles = swarm(
        $data,
        // map each data point to an x position (in pixels)
        d => $xGet(d),
        // map each data point to a radius (in pixels)
        d => r,
    )
</script>

<g class="scatter-group">
	{#each circles as d, i}
		<circle
			cx={d.x}
			cy={d.y + ($height / 2)}
			{r}
			fill={colors[i] || fill}
		/>
	{/each}
</g>

