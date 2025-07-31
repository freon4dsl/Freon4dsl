<script lang="ts">
    import { AccordionItem, Accordion, Button } from 'flowbite-svelte';
    import { AST, ExternalPartListBox } from "@freon4dsl/core";
    import { type FreComponentProps, RenderComponent } from "@freon4dsl/core-svelte";
    import { Person } from "@freon4dsl/samples-course-schedule";
    import { untrack } from "svelte"
    import { UserAddOutline, UserRemoveOutline } from 'flowbite-svelte-icons';
    // This component replaces the component for "teachers: Person[];" from model unit "Staff".
    // This property is a parts list, therefore the external box to use is an ExternalPartListBox.
    // Props
    let { editor, box }: FreComponentProps<ExternalPartListBox> = $props();

    let panelOpen: boolean[] = $state([]);      // List of booleans to indicate which panel is open (true) and closed (false).
    let multiplePar: boolean = $state(false);   // Indicates whether multiple panels may be open at the same time.

    let ch = $state([...box.children])
    /*
        Sets all panels in the state 'closed',
        and sets the length of 'panelOpen'.
     */
    function initialize() {
        let param: string | undefined = box.findParam("multi");
        if (param === "multiple") {
            multiplePar = true;
        }
        panelOpen = []
        for (let i = 0; i < box.children.length; i++) {
            // this also sets the length of panelOpen!
            panelOpen[i] = false;
            box.children[i].isVisible = false; // the child boxes are not currently shown
        }
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        for( let i=0; i < box.children.length; i++) {
            if (panelOpen[i]) {
                box.children[i].setFocus();
            }
        }
    }
    const refresh = (why?: string): void => {
        console.log("REFRESH ACCORDION")
        // do whatever needs to be done to refresh the elements that show information from the model
        untrack( () => initialize() );
    };
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

    $effect(() => {
        // $inspect.trace(`accordion for $effect ${box.children.length} id ${box.id}`)
        // console.log(`========== $effect ${box.children.length} id ${box.id}` )
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Needed to get an effect
        ch = [...box.children]
        // untrack becauise initialize causes a too many  effects error
        untrack( () => {
            initialize()
        })        
    });

    const colorCls: string = 'text-light-base-50 dark:text-dark-base-900 ';
    const buttonCls: string =
      'bg-light-base-600 					dark:bg-dark-base-200 ' +
      'hover:bg-light-base-900 		dark:hover:bg-dark-base-50 ' +
      'border-light-base-100 			dark:border-dark-base-800 ';
    const iconCls: string = 'ms-0 inline h-6 w-6';
</script>

<div style="display: flex; align-items: flex-end;">
    <Accordion multiple={multiplePar}>
        {#each ch as childBox, index}
            <AccordionItem bind:open={panelOpen[index]}>
                {#snippet header()}
                    {childBox.node.freLanguageConcept()} {childBox.node.freId()}
                {/snippet}

                    <div style="display: flex; align-items: flex-end;">
                        <RenderComponent box={childBox} editor={editor} />
<!--                        <IconButton class="material-icons" onclick={() => removePerson(index)}>remove</IconButton>-->
                        <Button tabindex={-1} id="add-button" class="{buttonCls} {colorCls} " name="removePerson" onclick={() => removePerson(index)}>
                            <UserRemoveOutline class="{iconCls}" />
                        </Button>
                    </div>
            </AccordionItem>
        {/each}
    </Accordion>

<!--    <IconButton class="material-icons" onclick={() => addPerson()}>add</IconButton>-->
    <Button tabindex={-1} id="add-button" class="{buttonCls} {colorCls} " name="addPerson" onclick={() => addPerson()}>
        <UserAddOutline class="{iconCls}" />
    </Button>
</div>
