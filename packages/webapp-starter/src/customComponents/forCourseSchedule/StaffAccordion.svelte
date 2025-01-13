<script lang="ts">
    import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import {ExternalPartListBox, FreEditor} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {afterUpdate, onMount} from "svelte";

    // This component replaces the component for "teachers: Person[];" from model unit "Staff".
    // This property is a parts list, therefore the external box to use is an ExternalPartListBox.
    export let box: ExternalPartListBox;
    export let editor: FreEditor;

    let panelOpen: boolean[] = [];      // List of booleans to indicate which panel is open (true) and closed (false).
    let multiplePar: boolean = false;   // Indicates whether multiple panel may be open at the same time.

    /*
        Sets all panels in the state 'closed',
        and sets the length of 'panelOpen'.
     */
    function initialize() {
        let multipleStr: string = box.findParam("multi");
        multiplePar = !!multipleStr && multipleStr.length > 0;
        for (let i = 0; i < box.children.length; i++) {
            // this also sets the length of panelOpen!
            panelOpen[i] = false;
            box.children[i].isVisible = false; // the child boxes are not currently shown
        }
    }

    /*
        Sets the panel at index to its opposite state: from closed to open and vice versa.
     */
    function setHidden(index) {
        box.children[index].isVisible = !box.children[index].isVisible;
        // console.log("setting " + box.children[index].id + " to " + box.children[index].isVisible )
    }

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
        initialize();
    };
    onMount(() => {
        initialize();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // Run the initialization
    initialize();
</script>

<Accordion multiple="{multiplePar}">
    {#each box.children as childBox, index}
        <Panel bind:open={panelOpen[index]}>
            <Header>
                {childBox.node.freLanguageConcept()} {childBox.node["name"]}
                <IconButton slot="icon" toggle pressed={panelOpen[index]} on:click={() => setHidden(index)}>
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
