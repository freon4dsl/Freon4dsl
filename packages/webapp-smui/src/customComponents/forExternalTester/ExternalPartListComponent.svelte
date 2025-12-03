<script lang="ts">
    import {AST, PartListReplacerBox, type FreNode} from "@freon4dsl/core";
    import {BB} from "@freon4dsl/samples-external-tester";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<PartListReplacerBox> = $props();

    let button: HTMLButtonElement;
    let value: BB[];

    function getValue() {
        let startVal: FreNode[] | undefined = box.getPropertyValue();
        if (!!startVal && box.getPropertyType() === "BB") {
            value = startVal as BB[];
        }
        // You can cast the startVal to the expected type, in this case "BB[]".
        // But you also have access to the native boxes the project the elements in the list,
        // those we will be projecting using the native RenderComponent.
    }
    getValue();

    const addChild = () => {
        // Note that you need to put any changes to the actual model in a 'AST.change or AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.changeNamed("ExternalPartListComponent.addChild", () => {
            let newBB: BB = BB.create({name: "new element", numberProp: 100, booleanProp: true});
            value.push(newBB);
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
    The replacer is showing a list of children, each in their native boxes.
    <ol>
        {#each box.children as childBox}
            <li><RenderComponent box={childBox} editor={editor} /></li>
        {/each}
    </ol>
    <button onclick={addChild} bind:this={button}>Add child</button>
</div>
