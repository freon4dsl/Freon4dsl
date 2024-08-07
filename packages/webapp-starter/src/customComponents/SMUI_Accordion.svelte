<script lang="ts">
    import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import {ExternalBox, FreEditor} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {onMount} from "svelte";
    export let box: ExternalBox;
    export let editor: FreEditor;

    let panelOpen: boolean[] = [];

    onMount(() => {
        for( let i=0; i < box.children.length; i++) {
            panelOpen[i] = false;
        }
    })


    let multipleStr: string = box.findParam("multi");
    let multiplePar: boolean = !!multipleStr && multipleStr.length > 0;

    // todo setFocus etc
</script>

<Accordion multiple="{multiplePar}">
    {#each box.children as childBox, index}
        <Panel bind:open={panelOpen[index]}>
            <Header>
                {childBox.element.freLanguageConcept()} {index+1} {panelOpen[index]}
                <IconButton slot="icon" toggle pressed={panelOpen[index]}>
                    <Icon class="material-icons" on>expand_less</Icon>
                    <Icon class="material-icons">expand_more</Icon>
                </IconButton>
            </Header>
            <Content><RenderComponent box={childBox} editor={editor} /></Content>
        </Panel>
    {/each}
</Accordion>
