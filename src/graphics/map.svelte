<script>
    import { LayerCake, Svg, Html } from 'layercake';
    import { feature } from 'topojson-client';

    import MapSvg from '../components/map/MapSvg.svelte';
    
    export let data;
    export let features;
    export let config;
    export let mapPropKey;

    let bg;

    fetch('./data/map/bg-topo.json', {mode: 'cors', cache: 'no-store' })
    .then(response => { return response.json() })
    .then(topojson => {
      bg = feature(topojson, topojson.objects.bg);
    });

    $: flatData = features.features.map(d => d.properties);
</script>

<div class="chart-container">
    <LayerCake
      data={features}
      {flatData}
      custom={{bg}}
      r={d => d.value}
    >
      <Svg>
        <MapSvg
          projection={config.projection}
          fill={d => data.find(e => d.properties[mapPropKey] === e.key)?.fill || "#fafafa"}
        />
        <slot />
      </Svg>
    </LayerCake>
  </div>

  <style>
    :global(.chart-container .layercake-container) {
      position: absolute !important;
      top: 0;
    }
  </style>