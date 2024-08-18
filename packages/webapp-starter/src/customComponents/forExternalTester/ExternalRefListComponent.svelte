<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {Box, ExternalRefListBox, FreEditor, FreNodeReference} from "@freon4dsl/core";
    import {CC} from "@freon4dsl/samples-external-tester";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {runInAction} from "mobx";
    export let box: ExternalRefListBox;
    export let editor: FreEditor;

    let button;
    let value: FreNodeReference<CC>[];

    function getValue() {
        let startVal: FreNodeReference<CC>[] | undefined = box.getPropertyValue();
        if (!!startVal) {
            value = startVal as FreNodeReference<CC>[];
        }
        // You can work directly with list elements,
        // but you also have access to the native boxes the project the elements in the list.
        // We will be projecting the native boxes using the native RenderComponent.
    }
    getValue();

    const addChild = () => {
        console.log("adding reference to [" + value.map(v => v.name) + "]")
        let newRef: FreNodeReference<CC> = FreNodeReference.create<CC>("nameOfReferedNode", "CC");
        // Note that you need to put any changes to the actual model in a 'runInAction',
        // because all elements in the model are reactive using mobx.
        runInAction(() => {
            box.getPropertyValue().push(newRef);
        });
        box.isDirty();
        console.log("box.children.length: " + box.children.length)
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
    The replacer is showing a list of references, each in their native boxes.
    <ol>
        {#each box.children as childBox}
            <li><RenderComponent box={childBox} editor={editor} /></li>
        {/each}
    </ol>
    <ol>
        some tekst {box.children.length}
    </ol>
    <button on:click={addChild} bind:this={button}>Add reference</button>
</div>
