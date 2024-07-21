<script lang="ts">
    let myEnum = ["red", "yellow", "green"]
    export let id;

    let currentValue = 2;
    const onChange = (event: MouseEvent) => {
        console.log("RadioComponent.onChange, value: " + event.target["value"]);
        currentValue = event.target["value"];
        // box.setBoolean(value);
        // if (box.selectable) {
        //     editor.selectElementForBox(box);
        // }
        event.stopPropagation();
        console.log("currentValue set to: " + currentValue);
    }
</script>


<span role="radiogroup" aria-labelledby="group-title" id={id} class="radiogroup">
	{#each myEnum as nn, i}
  <span>
    <md-radio
            id="{i}"
            name="group"
            value={i}
            checked={currentValue === i}
            aria-label="radio-control-{nn}"
            on:change={onChange}
    ></md-radio>
    <label for="{i.toString()}">{nn}</label>
  </span>
	{/each}
</span>

<style>
    .radiogroup {
        --md-sys-color-primary: #006A6A;
        --md-sys-color-on-surface-variant: red;
    }
</style>
