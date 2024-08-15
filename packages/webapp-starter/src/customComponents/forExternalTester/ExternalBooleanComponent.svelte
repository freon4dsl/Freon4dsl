<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalBooleanBox, FreEditor, StringWrapperBox} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    export let box: ExternalBooleanBox;
    export let editor: FreEditor;

    let inputElement;
    let value: string;

    function getValue() {
        let startVal: boolean | undefined = box.getPropertyValue();
        if (typeof startVal === "boolean") {
            value = startVal.toString();
        } else {
            value = "true"; // the default
        }
    }

    const onChange = () => {
        if (value === "true") {
            box.setPropertyValue(true);
        } else if (value === "false") {
            box.setPropertyValue(false);
        }
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getValue()
    };
    onMount(() => {
        getValue()
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        getValue()
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer">
    Boolean Replacer
    <input bind:value={value} bind:this={inputElement} on:change={onChange}/>
</div>

<style>
    .replacer {
        border: 2px groove #666666;
        border-radius: 8px;
    }
</style>
