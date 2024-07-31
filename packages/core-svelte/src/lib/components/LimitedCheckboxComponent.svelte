<script lang="ts">
    import {LimitedControlBox, FreEditor, FreLogger, SHIFT, CONTROL, ALT, SPACEBAR} from "@freon4dsl/core";

    export let box: LimitedControlBox;
    export let editor: FreEditor;			// the editor

    const LOGGER = new FreLogger("LimitedCheckBoxComponent");

    let id: string = box.id;
    let myEnum = ['darkblue', 'indigo', 'deeppink', 'salmon','gold' ];
    let isChecked = [ false, false , true, true, false ];
    let ariaLabel = "toBeDone";

    const onClick = (event) => {
        // prevent bubbling up
        event.stopPropagation();
    }

    function changed(i) {
        isChecked[i] = !isChecked[i];
        console.log("Checkbox " + i + " has been changed, new values: " + isChecked)
    }

    const onKeyDown = (event) => {
        // space key should toggle the checkbox
        if (event.key !== SHIFT && event.key !== CONTROL && event.key !== ALT) { // ignore meta keys
            switch (event.key) { // only react to space key, other keys are handled by other components
                case SPACEBAR: {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }
    }

</script>

<span role="group" aria-labelledby={ariaLabel} id={id} class="checkboxgroup">
	{#each myEnum as nn, i}
  <span>
    <md-checkbox
            id="{id}"
            value={nn}
            checked={isChecked[i]}
            aria-label="checkbox-{nn}"
            role="checkbox"
            aria-checked={isChecked[i]}
            tabindex={0}
            on:change={() => changed(i)}
            on:click={onClick}
            on:keydown={onKeyDown}
    ></md-checkbox>
    <label for="{i.toString()}">{nn}</label>
  </span>
	{/each}
</span>

<style>
    .checkboxgroup {
        /* System tokens */
        --md-sys-color-primary: #006a6a;
        --md-sys-color-on-primary: #ffffff;
        --md-sys-color-on-surface-variant: #3f4948;

        /* Component tokens */
        --md-checkbox-container-shape: 0px;
    }
</style>
