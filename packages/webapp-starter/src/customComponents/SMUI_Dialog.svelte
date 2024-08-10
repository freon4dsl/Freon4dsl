<script lang="ts">
    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {ExternalBox, FreEditor} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    export let box: ExternalBox;
    export let editor: FreEditor;

    let open = false;
    let buttonLabel: string = 'OpenDialog';

    function initialize() {
        let tmpLabel: string | undefined = box.findParam('buttonLabel');
        buttonLabel = (!!tmpLabel && tmpLabel.length > 0) ? tmpLabel : 'Open Dialog';
        box.children[0].isVisible = false;
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (open) {
            console.log("OPEN: setting focus to child")
            box.children[0].setFocus();
        } else {
            console.log("CLOSED: setting focus to parent")
            box.parent.firstEditableChild.setFocus();
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        initialize();
    };
    onMount(() => {
        initialize();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        initialize();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<Dialog bind:open sheet aria-describedby="sheet-content">
    <Title id="simple-title">{buttonLabel}</Title>
    <Content id="simple-content">
        {#each box.children as childBox}
            <RenderComponent box={childBox} editor={editor}/>
        {/each}
    </Content>
    <Actions>
        <Button>
            <Label>Close</Label>
        </Button>
    </Actions>
</Dialog>

<Button on:click={() => (open = true)}>
    <Label>{buttonLabel}</Label>
</Button>
