<script>
    import { LayerCake, Svg, Html } from 'layercake';

    import { scaleLinear } from 'd3-scale';

    import Pie from '../components/custom/Pie.svelte';
    import Pez from '../components/custom/Pez.html.svelte';
    import Stack from '../components/custom/Stack.html.svelte';

    let config = {};
    
    export let data;

    let pezScale = scaleLinear().domain([0, 60]).range(["#fafafa", "#368ae2", "#254e70"]);
    let catScale = [
        "#368ae2",
        "#f94839",
        "#254e70",
        "#f4d41d",
        "#66ad3e",
        "#ff9821",
        "#0ca4a5",
        "#9c49db",
        "#ff5ba2",
        "#053c21",
    ];
</script>

<pre>Pie</pre>

<div class="chart">
    <LayerCake
        padding={config?.padding || { right: 8, bottom: 32, left: 32, top: 8 }}
        x={config?.xKey || "key"}
        y={config?.yKey || "value"}
        xScale={config?.xScale}
        yDomain={config?.yDomain}
        xDomain={config?.xDomain}
        data={data}
        flatData={data.flat()}
    >
        <Svg>
            <Pie colors={catScale} />
        </Svg>
    </LayerCake>
</div>

<pre>Pez</pre>
<div class="chart sm-1">
    <LayerCake
        padding={config?.padding || { right: 8, bottom: 32, left: 32, top: 8 }}
        x={config?.xKey || "key"}
        y={config?.yKey || "value"}
        xScale={config?.xScale}
        yDomain={config?.yDomain}
        xDomain={config?.xDomain}
        data={data}
        flatData={data.flat()}
    >
        <Html>
            <Pez colorScale={pezScale} />
        </Html>
    </LayerCake>
</div>

<pre>Simple Stack chart</pre>
<div class="chart sm-2">
    <LayerCake
        padding={config?.padding || { right: 8, bottom: 8, left: 32, top: 8 }}
        data={data}
    >
        <Html>
            <Stack colors={catScale} small={false} customHeight={50} />
        </Html>
    </LayerCake>
</div>
<!-- eg. reference year comparison-->
<div class="chart sm-3">
    <LayerCake
        padding={config?.padding || { right: 8, bottom: 32, left: 32, top: 8 }}
        data={data}
    >
        <Html>
            <Stack colors={catScale} small={true} customHeight={10} />
        </Html>
    </LayerCake>
</div>

<pre>Treemap</pre>
<pre>Circle Pack</pre>
<pre>Chord Sankey</pre>

<style>
    .chart {
        width: 50vw;
        height: 300px;
    }

    .chart.sm-1 {
        height: 100px;
    }
    .chart.sm-2 {
        height: 50px;
    }
    .chart.sm-3 {
        padding: 10px 0;
        height: 10px;
    }
</style>