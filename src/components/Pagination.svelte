<script>
    export let pageSize = 3;
    export let pageOffset = 0;
    export let dataSize = 10;

    $: pageCount = Math.ceil(dataSize / pageSize);

    function prevPage() {
        if(pageOffset - pageSize >= 0) {
            pageOffset = pageOffset - pageSize;
        }
    }

    function nextPage() {
        if(pageOffset + pageSize < dataSize) {
            pageOffset = pageOffset + pageSize;
        }
    }

    $: firstPage = pageOffset <= 0;
    $: lastPage = pageOffset >= (dataSize - pageSize)
</script>

<div>
    <button on:click={prevPage} disabled={firstPage}>&lt;</button>
    <span>{Math.floor(pageOffset / pageSize) + 1} / {pageCount}</span>
    <button on:click={nextPage} disabled={lastPage}>&gt;</button>
</div>

<style>
    div {
        width: 80%;
        min-width: 120px;
        max-width: 300px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }

    span {
        padding: 1em 0.5em;
        text-align: center;
        min-width: 40px;
    }

</style>