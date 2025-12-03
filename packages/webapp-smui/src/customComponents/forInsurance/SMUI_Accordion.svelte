<script lang="ts">
    import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';
    import {PartListReplacerBox} from "@freon4dsl/core";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<PartListReplacerBox> = $props();

    let panelOpen: boolean[] = $state([]);
    let multipleStr: string | undefined = box.findParam("multi");
    let multiplePar: boolean = $state(!!multipleStr && multipleStr.length > 0);
    let key: string = "name";
    // <html>Svelte: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'FreNode'.<br/>No index signature with a parameter of type 'string' was found on type 'FreNode'.

    function initialize() {
        let multipleStr: string | undefined = box.findParam("multi");
        multiplePar = !!multipleStr && multipleStr.length > 0;
        for (let i = 0; i < box.children.length; i++) {
            // this also sets the length of panelOpen!
            panelOpen[i] = false;
            box.children[i].isVisible = false; // the child boxes are not currently shown
        }
    }

    function setHidden(index: number) {
        box.children[index].isVisible = !box.children[index].isVisible;
        console.log("setting " + box.children[index].id + " to " + box.children[index].isVisible )
    }

    // The following three functions need to be included for the editor to function properly.
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
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // execute initialize()
    initialize()
    // todo restore {childBox.node["name"]} on Header

    // <html>Svelte: Element implicitly has an 'any' type because expression of type '&quot;icon&quot;' can't be used to index type '{}'.<br/>Property 'icon' does not exist on type '{}'.
</script>

<Accordion multiple={multiplePar}>
    {#each box.children as childBox, index}
        <Panel bind:open={panelOpen[index]}>
            <Header>
                {childBox.node.freLanguageConcept()}
                <IconButton toggle pressed={panelOpen[index]} onclick={() => setHidden(index)}>
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
