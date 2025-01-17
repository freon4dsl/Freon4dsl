<script lang="ts">
    import IconButton from "@smui/icon-button";
    import Snackbar, { Actions, Label } from '@smui/snackbar';
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {FreEditor, NumberWrapperBox} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    export let box: NumberWrapperBox;
    export let editor: FreEditor;

    let clicked: number = 0;
    let snackbarWithClose: Snackbar;

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        box.childBox.setFocus();
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
    Phone number: <RenderComponent box={box.childBox} editor="{editor}"/>
    <IconButton class="material-icons" on:click={() => {clicked++; snackbarWithClose.open()}} ripple={false}>phone</IconButton>
</div>

<Snackbar bind:this={snackbarWithClose}>
    <Label>This person has been called on number {box.getPropertyValue()}.</Label>
    <Actions>
        <IconButton class="material-icons" title="Dismiss">close</IconButton>
    </Actions>
</Snackbar>

<style>
    .wrapper {
        display:flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
</style>
