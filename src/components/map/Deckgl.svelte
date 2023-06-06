<script>
    import { Deck } from "@deck.gl/core";
    import { onMount } from "svelte";

    export let deck = null;
    export let showMap;
    export let layers = [];
    export let viewState;
    export let onViewStateChange;
    export let getTooltip;
    export let onClick;
    export let deckMap = null;
    export let lowResMap = false;

    let deckCanvas = null;

    let startTime;

    onMount(() => {
        startTime = new Date().getTime();
        render();
        deck.setProps({ layers: [layers] });
    });

    let deckHasIdled = false;
    let debounce;
    let showPrompt = false;

    // creating the deck.gl instance
    function render() {
        deck = new Deck({
            canvas: deckCanvas,
            width: "100%",
            height: "100%",
            initialViewState: viewState,
            controller: true,
            useDevicePixels: 2,
            layers: [],
            onViewStateChange,
            getTooltip,
            onAfterRender: () => {
                showMap = true;
                
                if(!deckHasIdled) {
                    let endTime = new Date().getTime();
                    deckHasIdled = true;

                    if(endTime - startTime > 1200) {
                        lowResMap = true;
                    }
                }
            },
            onClick,
        });
        //
    }

    $: {
        layers;
        if(deck) deck.setProps({ layers })
        // : null;
    }
</script>

<div class="deck-container">
    <div id="map-container" bind:this={deckMap} />
    <canvas class="deck-canvas" bind:this={deckCanvas} />
</div>

<style>
    .deck-container {
        width: 100%;
        height: 100%;
        position: relative;
    }

    #map-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        opacity: 0.25;
    }

    .deck-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
