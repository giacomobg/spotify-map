<script>
    export let urlText;
    export let url;
    export let copyText;
    
    let textArea;
    let showClip = false;
    $: url = `https://twitter.com/intent/tweet?text=${urlText}&url=${url}`;
  </script>
  
  <a class="mock-button" href={url} target="_blank">Share on Twitter</a>
  <button on:click={() => showClip = !showClip}>Copy this result</button>
  {#if showClip}
  <textarea bind:this={textArea} readonly on:click={() => { textArea.select() }}>{copyText}</textarea>
  {/if}
  
  <style>
    textarea, button {
        display: block;
    }
    button {
        margin: 4px 0;
        background-color: #f4f4f4;
    }
    .mock-button {
        padding: 0.4em;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 2px;  
        margin-top: 4px;
        color: #333;
        background-color: #f4f4f4;
        outline: none;
        display: inline-block;
    }
  </style>