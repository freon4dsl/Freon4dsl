<script lang="ts">
    import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
    import IconButton from '@smui/icon-button';
    import {AST, ExternalPartListBox, FreEditor, FreNodeReference} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {afterUpdate, onMount} from "svelte";
    import {Person} from "@freon4dsl/samples-course-schedule";

    // This component replaces the component for "teachers: Person[];" from model unit "Staff".
    // This property is a parts list, therefore the external box to use is an ExternalPartListBox.
    export let box: ExternalPartListBox;
    export let editor: FreEditor;

    let panelOpen: boolean[] = [];      // List of booleans to indicate which panel is open (true) and closed (false).
    let multiplePar: boolean = false;   // Indicates whether multiple panels may be open at the same time.

    /*
        Sets all panels in the state 'closed',
        and sets the length of 'panelOpen'.
     */
    function initialize() {
        let param: string = box.findParam("multi");
        if (param === "multiple") {
            multiplePar = true;
        }
        panelOpen = [];
        for (let i = 0; i < box.children.length; i++) {
            // this also sets the length of panelOpen!
            panelOpen[i] = false;
            box.children[i].isVisible = false; // the child boxes are not currently shown
        }
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        for( let i=0; i < box.children.length; i++) {
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

    const addPerson = () => {
        // Note that you need to put any changes to the actual model in a 'AST.change or AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.change(() => {
            let newPerson: Person = Person.create({});
            box.getPropertyValue().push(newPerson);
        });
    }

    const removePerson = (index: number) => {
        // Note that you need to put any changes to the actual model in a 'AST.change' or
        // 'AST.changeNamed', because all elements in the AST model are reactive using mobx.
        AST.change(() => {
            box.getPropertyValue().splice(index, 1);
        });
    }

    // Run the initialization
    initialize();
</script>

<div style="display: flex; align-items: flex-end;">
    <Accordion multiple="{multiplePar}">
        {#each box.children as childBox, index}
            <Panel bind:open={panelOpen[index]}>
                <Header>
                    {childBox.node.freLanguageConcept()} {childBox.node["name"]}
                </Header>
                <Content>
                    <div style="display: flex; align-items: flex-end;">
                        <RenderComponent box={childBox} editor={editor} />
                        <IconButton class="material-icons" on:click={() => removePerson(index)}>remove</IconButton>
                    </div>
                </Content>
            </Panel>
        {/each}
    </Accordion>

    <IconButton class="material-icons" on:click={() => addPerson()}>add</IconButton>
</div>
