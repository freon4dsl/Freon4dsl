<script lang="ts">
    import "@material/web/switch/switch.js";
    import {MdSwitch} from "@material/web/all.js";
    import {BooleanControlBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {componentId} from "$lib/index.js";
    import {afterUpdate, onMount} from "svelte";
    export let box: BooleanControlBox;
    export let editor: FreEditor;			// the editor

    const LOGGER = new FreLogger("SwitchBoxComponent");

    let id: string = !!box ? componentId(box) : 'switchbox-for-unknown-box';
    let value = box.getBoolean();
    let switchElement: MdSwitch;

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        switchElement.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH BooleanControlBox: " + why);
        value = box.getBoolean();
    };
    onMount(() => {
        value = box.getBoolean();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    const onChange = (event: Event) => {
        // At on:click switchElement.checked is not yet changed, therefore we use a negation.
        // We use on:click instead of on:change because we need to stop propagation.
        value = !switchElement.selected;
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
        console.log("SwitchComponent.onChange for box " + box.role + ", box value: " + box.getBoolean());
    }
</script>

<span class="freon-switch" id="{id}">
    <md-switch id="switch" show-only-selected-icon selected={value} on:click={onChange} bind:this={switchElement} ></md-switch>
</span>

<style>
    .freon-switch {
        --md-sys-color-primary: var(--freon-boolean-switch-color, var(--mdc-theme-primary));
    }
</style>
