<script lang="ts">

    import { AccordionItem, Accordion } from 'flowbite-svelte';
    import { ExternalPartListBox, notNullOrUndefined } from "@freon4dsl/core"
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<ExternalPartListBox> = $props();

    let panelOpen: boolean[] = $state([]);
    let multipleStr: string | undefined = box.findParam("multi");
    let multiplePar: boolean = $state(notNullOrUndefined(multipleStr) && multipleStr.length > 0);
    let headerContent: string[] = $state([]);
    // <html>Svelte: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'FreNode'.<br/>No index signature with a parameter of type 'string' was found on type 'FreNode'.

    function initialize() {
        let multipleStr: string | undefined = box.findParam("multi");
        multiplePar = notNullOrUndefined(multipleStr) && multipleStr.length > 0;
        let tmpHeaderContent: string[] = []; // to avoid triggering the effect multiple times.
        for (let i = 0; i < box.children.length; i++) {
            // this also sets the length of panelOpen!
            panelOpen[i] = false;
            box.children[i].isVisible = false; // the child boxes are not currently shown
            // We know that node is of type FreNamedNode, because this component is only used to
            // show 'parts: InsurancePart[]', so we ignore the compiler error.
            // This is also the reason that we determine the header content here.
            // Within the html part of this component we cannot use ts-ignore.
            // @ts-ignore
            tmpHeaderContent.push(box.children[i].node["name"]);
        }
        headerContent = tmpHeaderContent;
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

</script>

<Accordion multiple={multiplePar}>
    {#each box.children as childBox, index}
        <!-- the following div is here only to catch the opening/closing of the panel -->
        <!-- it must be in this position to catch the click, but it affects the styling -->
        <!--  todo improve styling: rounded top corners on first element only -->
        <div onclick={() => setHidden(index)} role="presentation">
        <AccordionItem bind:open={panelOpen[index]} >
            <span slot="header" class="w-[85vw] text-black dark:text-white" >
                {childBox.node.freLanguageConcept()} <span class="text-primary-700 dark:text-primary-100">{headerContent[index]}</span>
            </span>
            <RenderComponent box={childBox} editor={editor} />
        </AccordionItem>
        </div>
    {/each}
</Accordion>
