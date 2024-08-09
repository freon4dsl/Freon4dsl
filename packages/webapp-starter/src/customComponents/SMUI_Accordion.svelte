<script lang="ts">
    import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import {ExternalBox, FreEditor} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {afterUpdate, onMount} from "svelte";

    export let box: ExternalBox;
    export let editor: FreEditor;

    let panelOpen: boolean[] = [];
    let multipleStr: string = box.findParam("multi");
    let multiplePar: boolean = !!multipleStr && multipleStr.length > 0;

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        for( let i=0; i < panelOpen.length; i++) {
            if (panelOpen[i]) {
                box.children[i].setFocus();
            }
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        let multipleStr: string = box.findParam("multi");
        multiplePar = !!multipleStr && multipleStr.length > 0;
    };
    onMount(() => {
        for( let i=0; i < box.children.length; i++) {
            // this also sets the length of panelOpen!
            panelOpen[i] = false;
        }
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<Accordion multiple="{multiplePar}">
    {#each box.children as childBox, index}
        <Panel bind:open={panelOpen[index]}>
            <Header>
                {childBox.element.freLanguageConcept()} {childBox.element["name"]}
                <IconButton slot="icon" toggle pressed={panelOpen[index]}>
                    <Icon class="material-icons" on>expand_less</Icon>
                    <Icon class="material-icons">expand_more</Icon>
                </IconButton>
            </Header>
            <Content>
                <RenderComponent box={childBox} editor={editor} />
            </Content>
        </Panel>
    {/each}
</Accordion>
