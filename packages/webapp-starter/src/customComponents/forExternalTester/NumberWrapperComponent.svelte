StringWrapperComponent.svelte<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {FreEditor, NumberWrapperBox, StringWrapperBox} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    export let box: NumberWrapperBox;
    export let editor: FreEditor;

    let inputElement;

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
    };
    onMount(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="wrapper">
    Number wrapper
    <RenderComponent box={box.childBox} editor="{editor}"/>
</div>

<style>
    .wrapper {
        border: 2px groove #666666;
        border-radius: 8px;
    }
</style>
