<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let groupId;
    export let buttonText;
    export let buttonVals;
    export let centred = false;
    export let width = "100px";
    let selectedVal;

    // send selected value back to parent on change
    function handleChange() {
        dispatch('change', selectedVal);
    }

    // set width of cells after they have been rendered in DOM
    onMount(setCellWidth);

    function setCellWidth() {
        var cells = document.getElementsByClassName('radio-cell');   
        for (let cell of cells) {
            cell.style.width = width;
        }
    }

    function getInputId(i) { 
        return groupId.replace(/\s/g, "") + ("" + buttonVals[i]).replace(/\s/g, "");
    }

</script>

<fieldset>
    <legend class={centred ? "centred" : ""}>This is a legend. Legends are semantic use of HTML which is nice.</legend>
    <div class={(centred ? "centred " : "")+"radio-cell-container"}>
        {#each buttonText as text, i}
            <div class="radio-cell centred">
                <input
                    type="radio"
                    bind:group={selectedVal}
                    id={getInputId(i)}
                    name={groupId}
                    value={buttonVals[i]}
                    on:change={handleChange}
                >
                <label class="toggle" for={getInputId(i)}>{text}              
                </label>
            </div>
        {/each}
    </div>
</fieldset>

<style>
  
  .centred {
      margin-left: auto;
      margin-right: auto;
  }

  legend {
    padding: 1em 0 1em;
    font-weight: bold;
  }

  fieldset {
    border: none;
    padding: 0px;
  }

  .radio-cell-container {
      display: table;
  }

  div.radio-cell {
	position: relative;
	display: inline-block;
	margin-right: 5px;
	height: 40px;
}

div.radio-cell input[type="radio"] {
    opacity: 0.01;
}

div.radio-cell input,
div.radio-cell label {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
}
div.radio-cell label {
    margin: 2px 0;
    height: 24px;
    padding-top: 8px;
    text-align: center;
}

div.radio-cell label:disabled {
	background-color: #ddd;
	color: #888;
}

</style>