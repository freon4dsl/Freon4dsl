<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalStringBox, FreEditor, StringWrapperBox} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    export let box: ExternalStringBox;
    export let editor: FreEditor;

    let inputElement;
    let value: string;

    function getValue() {
        let startVal: string | undefined = box.getPropertyValue();
        if (typeof startVal === "string") {
            value = startVal;
        } else {
            value = ""; // the default
        }
    }
    getValue();

    const onChange = () => {
        if (!!value && value.length > 0) {
            box.setPropertyValue(value);
        }
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getValue();
    };
    onMount(() => {
        getValue();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        getValue();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer">
    StringReplacer
    <input bind:value={value} bind:this={inputElement} on:change={onChange}/>
</div>
