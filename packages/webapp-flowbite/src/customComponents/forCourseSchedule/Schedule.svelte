<script lang="ts">
    import {
        Box,
        ExternalPartListBox,
        type FreNode,
        FreNodeReference,
        AST, isNullOrUndefined, LabelBox, notNullOrUndefined
    } from "@freon4dsl/core"
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";
    import {Slot, TimeStamp} from "@freon4dsl/samples-course-schedule";
    import { UserAddOutline } from 'flowbite-svelte-icons';
    import { Button } from 'flowbite-svelte';

    // This component replaces the component for "timeSlots: Slot[];" from model unit "Schedule".
    // This property is a parts list, therefore the external box to use is an ExternalPartListBox.
    // Props
    let { editor, box }: FreComponentProps<ExternalPartListBox> = $props();

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        initialize();
    };
    $effect(() => {
        initialize();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // --------------------------- //
    let slotToBoxMap: Map<Slot, Box> = new Map<Slot, Box>();
    // an array of 10 positions, making use of the 10 different timeSlots that are available
    let sortedSlots: Slot[][] = $state(initSortedSlots());

    function initSortedSlots(): Slot[][] {
        let slots = [];
        for (let i = 0; i < 10; i++) {
            slots[i] = [];
        }
        return slots;
    }

    let dayTitle: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ];

    // variables for creating a new slot
    let timeStamps: TimeStamp[] = [
        TimeStamp.MondayMorning,
        TimeStamp.TuesdayMorning,
        TimeStamp.WednesdayMorning,
        TimeStamp.ThursdayMorning,
        TimeStamp.FridayMorning,
        TimeStamp.MondayAfternoon,
        TimeStamp.TuesdayAfternoon,
        TimeStamp.WednesdayAfternoon,
        TimeStamp.ThursdayAfternoon,
        TimeStamp.FridayAfternoon
    ];

    function sortSlots(startVal: Slot[]) {
        const newSlots: Slot[][] = []
        for (let i = 0; i < 10 ; i++) {
            newSlots[i] = [];
        }
        (startVal).forEach((val, index) => {
            // remember which box belongs to which slot
            slotToBoxMap.set(val, box.children[index]);
            switch (val.$time.day) {
                case 1: {
                    switch (val.$time.part) {
                        case 1: { // Monday morning
                            newSlots[0].push(val);
                            break;
                        }
                        case 2: { // Monday afternoon
                            newSlots[5].push(val);
                            break;
                        }
                        default: {
                            newSlots[0].push(val);
                        }
                    }
                    break;
                }
                case 2: {
                    switch (val.$time.part) {
                        case 1: { // Tuesday morning
                            newSlots[1].push(val);
                            break;
                        }
                        case 2: { // Tuesday afternoon
                            newSlots[6].push(val);
                            break;
                        }
                        default: {
                            newSlots[1].push(val);
                        }
                    }
                    break;
                }
                case 3: {
                    switch (val.$time.part) {
                        case 1: { // Wednesday morning
                            newSlots[2].push(val);
                            break;
                        }
                        case 2: { // Wednesday afternoon
                            newSlots[7].push(val);
                            break;
                        }
                        default: {
                            newSlots[2].push(val);
                        }
                    }
                    break;
                }
                case 4: {
                    switch (val.$time.part) {
                        case 1: { // Thursday morning
                            newSlots[3].push(val);
                            break;
                        }
                        case 2: { // Thursday afternoon
                            newSlots[8].push(val);
                            break;
                        }
                        default: {
                            newSlots[3].push(val);
                        }
                    }
                    break;
                }
                case 5: {
                    switch (val.$time.part) {
                        case 1: { // Friday morning
                            newSlots[4].push(val);
                            break;
                        }
                        case 2: { // Friday afternoon
                            newSlots[9].push(val);
                            break;
                        }
                        default: {
                            newSlots[4].push(val);
                        }
                    }
                    break;
                }
            }
        })
        sortedSlots = newSlots
    }

    /* Sort the list of slots based on the time */
    function initialize() {
        let startVal: FreNode[] | undefined = box.getPropertyValue();
        if (notNullOrUndefined(startVal) && box.getPropertyType() === "Slot") {
            // cast the startVal to the expected type, in this case "Slot[]".
            // sort the slots based on the time and remember which box belongs to which slot
            sortSlots(startVal as Slot[]);
        }
    }

    const addSlot = (timeStamp: TimeStamp) => {
        // Note that you need to put any changes to the actual model in a 'AST.change' or 'AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.change(() => {
            let newSlot: Slot = Slot.create({time: FreNodeReference.create<TimeStamp>(timeStamp, "TimeStamp")});
            box.getPropertyValue().push(newSlot);
        });
    }

    const findBoxForSlot = (slot: Slot): Box => {
        let xx = slotToBoxMap.get(slot);
        if (!isNullOrUndefined(xx)) {
            return xx;
        } else {
            return new LabelBox(box.node, 'no-role', () => { return 'No box found'});
        }
    }
    initialize();
    const colorCls: string = 'text-light-base-50 dark:text-dark-base-900 ';
    const buttonCls: string =
      'bg-light-base-600 					dark:bg-dark-base-200 ' +
      'hover:bg-light-base-900 		dark:hover:bg-dark-base-50 ' +
      'border-light-base-100 			dark:border-dark-base-800 ';
    const iconCls: string = 'ms-0 inline h-6 w-6';
</script>


<div class="demo-table-container">
    <table class="demo-table">
        <thead>
        <tr class="demo-header-row">
            <th class="demo-header-cell"></th>
            {#each dayTitle as title}
                <th class="demo-header-cell">{title}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
        <tr class="demo-row">
            <td class="demo-header-cell">Morning</td>
            {#each sortedSlots as slots, index}
                {#if index < 5}
                    {#if slots.length > 0}
                        <td class="demo-cell">
                            <div class="demo-cell-content">
                            {#each slots as slot}
                                <div class="demo-slot-render">
                                <RenderComponent box={findBoxForSlot(slot)} editor={editor} />
                                </div>
                            {/each}
                            </div>
                        </td>
                    {:else}
                        <td class="demo-cell">
                            <div class="demo-slot-render">NONE</div>
                        </td>
                    {/if}
                {/if}
            {/each}
        </tr>
        <tr>
            <td class="demo-btn-cell"></td>
            {#each timeStamps as stamp, index}
                {#if index < 5}
                    <td class="demo-btn-cell">
                        <Button tabindex={-1} id="add-button" class="{buttonCls} {colorCls} " name="ToastOpen" onclick={() => addSlot(stamp)}>
                            <UserAddOutline class="{iconCls}" />
                        </Button>
                    </td>
                {/if}
            {/each}
        </tr>
        <tr>
            <td class="demo-header-cell">Afternoon</td>
            {#each sortedSlots as slots, index}
                {#if index >= 5}
                    {#if slots.length > 0}
                        <td class="demo-cell">
                            {#each slots as slot}
                                <div class="demo-slot-render">
                                <RenderComponent box={findBoxForSlot(slot)} editor={editor} />
                                </div>
                            {/each}
                        </td>
                    {:else}
                        <td class="demo-cell">
                            <div class="demo-slot-render">
                                NONE
                            </div>
                        </td>
                    {/if}
                {/if}
            {/each}
        </tr>
        <tr>
            <td class="demo-btn-cell"></td>
            {#each timeStamps as stamp, index}
                {#if index >= 5}
                    <td class="demo-btn-cell">
                        <Button tabindex={-1} id="add-button" class="{buttonCls} {colorCls} " name="ToastOpen" onclick={() => addSlot(stamp)}>
                            <UserAddOutline class="{iconCls}" />
                        </Button>
                    </td>
                {/if}
            {/each}
        </tr>
        </tbody>
    </table>
</div>


<style>
    .demo-table-container {
        background-color:#fff;
        color: rgba(0, 0, 0, 0.87);
        max-width: 100%;
        border-radius:4px;
        border-width:1px;
        border-style:solid;
        border-color:rgba(0,0,0,.12);
        display:inline-flex;
        flex-direction:column;
        box-sizing:border-box;
        position:relative;
    }
    .demo-table {
        min-width:100%;
        border:0;
        white-space:nowrap;
        border-spacing:0;
        table-layout:fixed;
    }
    .demo-cell {
        height: 200px;
        border-right-width: 1px;
        border-right-style: solid;
        border-right-color: rgba(0,0,0,.12);
    }
    .demo-slot-render {
        margin: 0 4px 20px 4px;
    }
    .demo-header-row {
        height: 56px;
    }
    .demo-header-cell {
        font-size:0.875rem;
        line-height:1.375rem;
        font-weight:bolder;
        box-sizing:border-box;
        text-align:left;
        padding: 0 16px 0 16px;
        border-right-width: 1px;
        border-right-style: solid;
        border-right-color: rgba(0,0,0,.12);
        background-color: var(--mdc-theme-surface, #fff);
    }
    .demo-cell-content {
        justify-content: space-between;
        flex-direction: column;
        display: flex;
    }
    .demo-btn-cell {
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom-color: rgba(0,0,0,.12);
        border-right-width: 1px;
        border-right-style: solid;
        border-right-color: rgba(0,0,0,.12);
        justify-content: space-between;
    }
</style>
