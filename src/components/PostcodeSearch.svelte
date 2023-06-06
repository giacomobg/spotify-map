<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  export let api = "https://9ornsrwb3m.execute-api.us-east-2.amazonaws.com/postcode-search"
  export let includeWales = false;

  let postcode = "";
  let errorMsg = "";
  let postcodeResult = null;

  function sendPostcode() {
	dispatch('message', {
		postcode: postcodeResult,
	});
  }

  function processPostcode(postcode) {
    let processedCode = postcode;
    //regex here:
    if(postcode.length > 7) {
      processedCode = processedCode.replace(" ", "");
    }
    if(postcode.length === 6) {
      processedCode = processedCode.slice(0, 3) + " " + processedCode.slice(3);
    }
    if(postcode.length === 5) {
      processedCode = processedCode.slice(0, 2) + "  " + processedCode.slice(2);
    }
    return processedCode.toUpperCase();
  }

  function handleEnter() {
    if (event.key === 'Enter') {
      submitPostcode();
    }
  }

  function submitPostcode() {
    //TODO: sanitise input + format correctly
    if(postcode !== "" && postcode.length > 4) {
      errorMsg = "Loading...";
      postcodeResult = null;
      fetch(api, {
          method: 'POST',
          body: JSON.stringify({"postcode": processPostcode(postcode)})
        })
        .then(response => response.json())
        .then(json => {
          if(json.error) {
            errorMsg = `Please enter a valid postcode in England${includeWales ? " or Wales" : ""}.`;
          }
          else {
            postcodeResult = json;
            errorMsg = "";
            sendPostcode();
          }
        })
    }
    else if(postcode.length > 1) {
      errorMsg = "Please enter a full postcode.";
      postcodeResult = null;
    }
    else {
      errorMsg = `Please enter a valid postcode in England${includeWales ? " or Wales" : ""}.`;
      postcodeResult = null;
    }
  }
</script>

<div class="container">
  <div>
    <label for="postcode-search">Find your postcode:</label>
    <input bind:value={postcode} id="postcode-search" on:keypress={() => handleEnter()} />
    <button on:click={submitPostcode}>Go</button>
  </div>
  <p>{errorMsg}</p>
</div>

<style>
  div.container {
    padding-top: 8px;
    align-items: end;
  }

  input {
    width: 60%;
  }

  p {    
    margin-top: 11px;
  }
</style>
