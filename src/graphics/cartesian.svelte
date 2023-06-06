<script>
	import { LayerCake, Svg } from 'layercake';
	import AxisX from '../components/cartesian/AxisX.svelte';
	import AxisY from '../components/cartesian/AxisY.svelte';

    export let data;
    export let config;

    $: rMax = Math.max(...data.flat().map(d => d[config?.rKey]));
    $: rDomain = [0, rMax];
</script>
<LayerCake
    padding={config?.padding || { right: 8, bottom: 32, left: 32, top: 8 }}
    x={config?.xKey || "key"}
    y={config?.yKey || "value"}
    z={config?.zKey}
    r={config?.rKey}
    xScale={config?.xScale}
    zScale={config?.zScale}
    xDomain={config?.xDomain}
    yDomain={config?.yDomain}
    zDomain={config?.zDomain}
    rDomain={rDomain}
    zRange={config?.zRange}
    data={data}
    flatData={data.flat()}
>
    <Svg>
        <!-- <AxisX gridlines={false} formatTick={config?.formatX}/> -->
        <!-- <AxisY formatTick={config?.formatY} /> -->
        <slot></slot>
    </Svg>
</LayerCake>