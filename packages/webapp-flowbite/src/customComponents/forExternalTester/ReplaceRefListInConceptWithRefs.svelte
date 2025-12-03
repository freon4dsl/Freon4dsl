<script lang="ts">
    import {AST, RefListReplacerBox, FreNodeReference} from "@freon4dsl/core";
    import {CC} from "@freon4dsl/samples-external-tester";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<RefListReplacerBox> = $props();

    let button: HTMLButtonElement;
    let value: FreNodeReference<CC>[];
    let count: number = $state(5);

    function getValue() {
        let startVal: FreNodeReference<any>[] | undefined = box.getPropertyValue();
        if (!!startVal && box.getPropertyType() === "CC") {
            value = startVal as FreNodeReference<CC>[];
        }
        // You can work directly with the list elements,
        // but you also have access to the native boxes that project the elements in the list.
        // We will be projecting the native boxes using the native RenderComponent.
    }

    const addChild = () => {
        // Note that you need to put any changes to the actual model in a 'AST.change' or 'AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.changeNamed("ExternalRefListComponent.addChild", () => {
            let newRef: FreNodeReference<CC> = FreNodeReference.create<CC>("nameOfReferedNode" + count++, "CC");
            value.push(newRef);
            // or use: box.getPropertyValue().push(newRef);
        });
    }

    // The following three functions need to be included for the editor to function properly.
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
    $effect(() => {
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
    <button onclick={addChild} bind:this={button}>Add reference</button>
</div>
