<script>
	import { getContext } from 'svelte';
	const { data, height } = getContext('LayerCake');

    export let small = false;
  
    export let customOrder;
    export let customHeight;
    export let colors;

    $: chartHeight = customHeight || $height;
    $: order = customOrder || $data.map(d => d.key);
  
    $: total = $data.reduce((p, c) => p += c.value, 0);
    $: stackData = order.map(d => {
        if($data.find(e => e.key === d.toLowerCase())) {
            let value = $data.find(e => e.key === d.toLowerCase())?.value;
            return {
                key: d,
                value,
                pct: value / total
            }
        }
        return null;
    }).filter(d => (d !== null && !isNaN(d.pct)));

    $: console.log(customHeight);

  </script>
  
  <div class="stack {small ? "sm" : ""} {chartHeight < 20 ? "fade" : ""}" style="height: {chartHeight}px;">
    {#each stackData as d, i}
          <span class="hover-label {d.key}" style="width:{d.pct * 100}%;  background-color: {colors[i] || "#ccc"}">
          {#if !small}
              <span class="label">{d.key} - {(d.pct * 100).toFixed(1)}%</span>
          {/if}
          </span>
    {/each}
  </div>
  <style>
    .top-label {
      position: absolute;
      top: 4px;
      left: 8px;
      font-size: 1.25rem;
      color: #fff;
    }
    .top-label.right {
      left: auto;
      right: 8px;
    }
    .top-num {
      font-family: 'Reg. Modn Bold', sans-serif;
    }
  
    .stack {
        margin-bottom: 2px;
        display: flex;
        position: relative;
    }
  
    .stack.sm {
        height: 5px;
        opacity: 0.75;
    }
  
    .stack.fade {
        opacity: 0.5;
    }
  
    span {
        display: inline-block;
        height: 100%;
        transition: width 0.5s;
    }
  
    .hover-label .label {
        opacity: 0;
        transition: opacity 0.5s;
        white-space: nowrap;
        position: absolute;
        bottom: 4px;
        height: auto;
        padding-left: 4px;
    }
  
    .hover-label:hover .label {
        opacity: 1;
    }
  
    .label {
        position: absolute;
        bottom: -10px;
    }
  
    .hover-label.lab .label {
        float: right;
    }
  
  </style>