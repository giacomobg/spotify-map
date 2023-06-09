<script>
    export let legend;
    export let entries;
    $: console.log(entries)

</script>

<legend for=checklist>{@html legend}</legend>
<fieldset id=checklist>
    {#each entries as entry}
        <label class:checked={entry.checked}>
            <input type=checkbox bind:checked={entry.checked}>
            {entry.name}
        </label>
    {/each}
</fieldset>

<style>

    input {
        position: fixed;
        right: 10;
        bottom: 10;
        opacity: 0.01;
    }

    legend {
        font-size: 0.888rem;
        line-height: 1.333rem;
        padding-bottom: 0.667rem;

    }

    label {
        font-family: 'SalmaBold';
        float: left;
        white-space: nowrap;
        width: 120px;
        overflow: hidden;              /* "overflow" value must be different from  visible"*/ 
        -o-text-overflow: ellipsis;    /* Opera < 11*/
        text-overflow:    ellipsis;    /* IE, Safari (WebKit), Opera >= 11, FF > 6 */   
    
        margin: 5px 5px;
        height: 24px;
        padding: 8px 4px 0px 4px;
        text-align: center;
    	/* outline: 1px solid #666; */
        background-color: #83b5d1;
    }

    label.checked {
        background-color: #324a5f;
        color: white;
    }

    label:not(:disabled):hover {
        opacity: 75%;
    }

    label:not(:disabled):active {
        opacity: 50%;
    }


    fieldset {
        border: none;
        padding: 0px;
    }


</style>