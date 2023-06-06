<script>
    export let deckInstance;
    export let defaultViewState;
    export let doAnimation = true;

    let minZoom = defaultViewState.minZoom;
    let maxZoom = defaultViewState.maxZoom;

    function mapZoom(val) {
        if(deckInstance && deckInstance.viewState.zoom + val >= minZoom && deckInstance.viewState.zoom + val <= maxZoom) {
            deckInstance.setProps({initialViewState: {
                    longitude: deckInstance.viewState.longitude,
                    latitude: deckInstance.viewState.latitude,
                    zoom: deckInstance.viewState.zoom + val,
                    minZoom: deckInstance.viewState.minZoom,
                    pitch: 0,
                    bearing: 0,
                    transitionDuration: doAnimation ? 500 : 0,
            }});
        }

    }

    function mapReset() {
        if(deckInstance) {
            deckInstance.setProps({initialViewState: {
                    longitude: defaultViewState.longitude,
                    latitude: defaultViewState.latitude,
                    minZoom: defaultViewState.minZoom,
                    zoom: defaultViewState.zoom,
                    pitch: 0,
                    bearing: 0,
                    transitionDuration: doAnimation ? 500 : 0,
            }});
        }
    }
</script>
<div class="map-controls">
    <button aria-label="Map zoom in" on:click={() => mapZoom(1)}>
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <g>
             <ellipse ry="8" rx="8" id="svg_1" cy="10" cx="20" stroke="#000" fill="none"/>
             <line id="svg_3" y2="15.83333" x2="15" y1="28" x1="2" stroke="#000" fill="none"/>
             <line id="svg_4" y2="15.04796" x2="20.08333" y1="5" x1="20.08333" stroke="#000" fill="none"/>
             <line transform="rotate(90, 20.0833, 10.024)" id="svg_5" y2="15.04796" x2="20.08333" y1="5" x1="20.08333" stroke="#000" fill="none"/>
            </g>
           </svg></button>
    <button aria-label="Map zoom out" on:click={() => mapZoom(-1)}>
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <g>
             <ellipse ry="8" rx="8" id="svg_1" cy="10" cx="20" stroke="#000" fill="none"/>
             <line id="svg_3" y2="15.83333" x2="15" y1="28" x1="2" stroke="#000" fill="none"/>
             <line transform="rotate(90, 20.0833, 10.024)" id="svg_5" y2="15.04796" x2="20.08333" y1="5" x1="20.08333" stroke="#000" fill="none"/>
            </g>
           </svg></button>
    <button aria-label="Reset map" on:click={() => mapReset()}>
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <g>
             <ellipse ry="10" rx="10" id="svg_1" cy="15.125" cx="15" stroke="#000" fill="none"/>
             <rect stroke-width="0" id="svg_6" height="15" width="13.25" y="0" x="0.08334" stroke="#000" fill="#fafafa"/>
             <line id="svg_7" y2="8.48991" x2="16.73991" y1="5.1875" x1="13.4375" stroke="#000" fill="none"/>
             <line transform="rotate(-90, 15, 3.8125)" id="svg_8" y2="5.625" x2="16.8125" y1="2" x1="13.1875" stroke="#000" fill="none"/>
            </g>
        </svg>
    </button>
</div>

<style>
    .map-controls {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 40px;
        height: 120px;
    }

    .map-controls button {
        width: 40px;
        height: 40px;
        padding: 4px 0 0;
        margin: 0;
        background: #fafafa;
    }

    .map-controls button svg {
        stroke-width: 2px;
    }
</style>