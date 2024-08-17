<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalRefListBox, FreEditor, FreNodeReference} from "@freon4dsl/core";
    import {BB} from "@freon4dsl/samples-external-tester";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    export let box: ExternalRefListBox;
    export let editor: FreEditor;

    let button;
    let value: FreNodeReference<BB>[];

    function getValue() {
        let startVal: FreNodeReference<BB>[] | undefined = box.getPropertyValue();
        if (!!startVal) {
            value = startVal;
        } else {
            value = [];
        }
        // You can work directly with list elements,
        // but you also have access to the native boxes the project the elements in the list.
        // We will be projecting those using the native RenderComponent.
    }
    getValue();

    const addChild = () => {
        // todo
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (!!box.children && box.children.length > 0) {
            box.children[0].setFocus();
        } else {
            button.focus();
        }
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
    The replacer is showing a list of children, each in their native boxes.
    <ol>
        {#each box.children as childBox}
            <li><RenderComponent box={childBox} editor={editor} /></li>
        {/each}
    </ol>
    <button on:click={addChild} bind:this={button}>Add child</button>
</div>
