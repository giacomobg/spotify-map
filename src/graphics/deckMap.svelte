<script>
  import { onMount } from "svelte";
  import { GeoJsonLayer } from '@deck.gl/layers';
  import { TileLayer } from '@deck.gl/geo-layers';
  import { feature } from 'topojson-client';

  import SvelteDeckGL from "../components/map/Deckgl.svelte";
  import MapControls from "../components/map/MapControls.svelte";
  
  export let features;
  export let basemap;
  export let showMap;
  export let deckInstance;
  export let deckMap;
  export let map;
  export let deckDefaultViewState = {
            latitude: 53.5,
            longitude: -1.2,
            zoom: 6,
            minZoom: 6,
            pitch: 0,
            bearing: 0,
            transitionDuration: 1500,
    };
  export let mapPropKey;

  let hoveredWardId;

  let zoom;
  let lowResMap = false;

	function filterOsm(tile, map) {
        if(tile) {
            return {type: "FeatureCollection", features: tile.features.filter(map)};
        }
        else {
            return [];
        }
	}

  function getTiles(x, y, z, layer, filterFn) {
      // let baseUrl = "nsmg-data-public.s3.eu-west-2.amazonaws.com/tiles/512/all"; 
      let baseUrl = "d1zkkl2rizp9ve.cloudfront.net";
      const mapSource = `https://${baseUrl}/${z}/${x}/${y}.topojson`;
      
      return new Promise((resolve, reject) => {
          fetch(mapSource)
          .then(response => {
              if (response.status === 200) {
                  return response.arrayBuffer();
              }
              return null;
          })
          .then(buffer => {
              if (buffer) {
                  let json = JSON.parse(new TextDecoder().decode(buffer));
                  resolve(filterOsm(feature(json, json.objects[layer]), filterFn));
              }
          });
      });
  };

  function layers() {
        let layers = [];

        if(basemap) {
            layers.push(new GeoJsonLayer({
                id: "geojson-uk",
                data: basemap,
                opacity: 0.1,
                stroked: true,
                filled: true,
                extruded: false,
                wireframe: false,
                getFillColor: [243, 235, 220],
                getLineColor: [230, 230, 230],
                lineWidthMinPixels: 0,
                lineWidthMaxPixels: 0,
            }))
        }

        layers.push(new GeoJsonLayer({
            id: "geojson",
            data: features,
            opacity: 0.75,
            stroked: true,
            filled: true,
            extruded: false,
            wireframe: false,
            pickable: true,
            getFillColor: [255, 255, 255, 10],
            getLineColor: [255, 255, 255, 255],
            lineWidthScale: 10,
            lineWidthMinPixels: 2,
            lineWidthMaxPixels: 8,
        }))

        if(!lowResMap) {
            layers.push(
                new TileLayer({
                    id: "trains",
                    stroked: true,
                    pickable: false,
    
                    getLineColor: [230, 230, 230, 255],
                    getFillColor: [230, 230, 230, 255],
    
                    minZoom: 8.75,
                    maxZoom: 11,
    
                    getLineWidth: 3,
                    lineWidthMinPixels: 3,
    
                    getTileData: ({index}) => getTiles(index.x, index.y, index.z, "transit", d => (d.properties.kind === "train" || d.properties.kind === "train")),
                    onTileError: (err) => console.log("err"),
                })
            )
            layers.push(
                new TileLayer({
                    id: "roads",
                    stroked: false,
                    pickable: false,
    
                    getLineColor: [255, 255, 255, 255],
                    getFillColor: [255, 255, 255, 255],
    
                    minZoom: 8.75,
                    maxZoom: 11,
    
                    getLineWidth: () => {
                        return 2;
                    },
                    lineWidthMinPixels: 2,
    
                    getTileData: ({index}) => getTiles(index.x, index.y, index.z, "roads", d => d.properties.kind !== "ferry"),
                    onTileError: (err) => console.log("err loading tile", err),
                })
            );
        }

        if(features) {
            let selectedFeature = features.features.find(d => d.properties[mapPropKey] === hoveredWardId);
            
            if(hoveredWardId !== "" && selectedFeature) {
                layers.push(new GeoJsonLayer({
                    id: "geojson-selected",
                    data: { type: "FeatureCollection", features: [selectedFeature] },
                    opacity: 0.75,
                    stroked: true,
                    filled: true,
                    extruded: false,
                    wireframe: false,
                    getFillColor: [230, 230, 230, 0.66 * 255],
                    getLineColor: [0, 0, 0],
                    lineWidthScale: 10,
                    lineWidthMinPixels: 4,
                    lineWidthMaxPixels: 8,
                    pickable: true
                }))
            }
        }

        // TODO: add labels

        return layers;
  }

  function getTooltip(ev) {
      if(ev.x !== -1 && ev.y !== -1) {
          if(ev.object && ev.object.properties) {
              hoveredWardId = ev.object.properties[mapPropKey];
          }
          else {
              hoveredWardId = "";
          }
      }

      return null;
  }

  let clickedWard;

  function onClick({object}) {
  }
  
  onMount(() => {
      layers();
  });

  let debounce;

  function onViewStateChange ({ viewState }) {
      zoom = viewState.zoom;

      deckInstance.setProps({initialViewState: {
              longitude: viewState.longitude,
              latitude: viewState.latitude,
              zoom: viewState.zoom,
              pitch: viewState.pitch,
              bearing: viewState.bearing,
	      minZoom: deckDefaultViewState.minZoom,
	      maxZoom: deckDefaultViewState.maxZoom,
      }});

      if(map) {
        map.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch,
            minZoom: deckDefaultViewState.minZoom,
            maxZoom: deckDefaultViewState.maxZoom,
        });
      }

      deckInstance.tooltip.setTooltip(null);
      hoveredWardId = "";
  
      clearTimeout(debounce);
      debounce = setTimeout(() => {
          layers2 = layers();
      }, 600)
  }

  let layers2 = layers();
  $: hoveredWardId, clickedWard, layers2 = layers();
</script>
<div class="map">
  <SvelteDeckGL 
      layers={layers2} 
      viewState={deckDefaultViewState}
      bind:deckMap={deckMap}
      bind:deck={deckInstance} 
      {getTooltip} 
      {onClick}
      {onViewStateChange}
      bind:lowResMap={lowResMap}
      bind:showMap={showMap} />
    <MapControls
        defaultViewState={deckDefaultViewState}
        {deckInstance}
    />
</div>

<style>
  .map {
      height: 90vh;
      width: 100%;
      position: relative;
  }
</style>
