<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {Box, ExternalPartListBox, FreEditor, FreNode, FreNodeReference, AST} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {Slot, TimeSlot} from "@freon4dsl/samples-course-schedule";
    import IconButton from "@smui/icon-button";

    // This component replaces the component for "timeSlots: Slot[];" from model unit "Schedule".
    // This property is a parts list, therefore the external box to use is an ExternalPartListBox.
    export let box: ExternalPartListBox;
    export let editor: FreEditor;

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        // set the focus on the first element in the table
        // if (!!sortedSlots2 && sortedSlots2.length > 0) {
        //     slotToBoxMap.get(sortedSlots2[0]).setFocus();
        // } else {
        //     button.focus();
        // }
    }
    const refresh = (why?: string): void => {
        console.log("refresh XXX")
        // do whatever needs to be done to refresh the elements that show information from the model
        getSlotList();
    };
    onMount(() => {
        console.log("onmount")
        getSlotList();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        console.log("afterupdate")
        getSlotList();
        sortedSlots = [...sortedSlots]
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // --------------------------- //
    let slotToBoxMap: Map<Slot, Box> = new Map<Slot, Box>();
    let sortedSlots: Slot[][]; // an array of 10 positions, making use of the 10 different timeSlots that are available
    sortedSlots = [];
    for (let i = 0; i < 10 ; i++) {
        sortedSlots[i] = [];
    }
    let dayTitle: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ];

    // variables for creating a new slot
    let timeStamps: TimeSlot[] = [
        TimeSlot.MondayMorning,
        TimeSlot.TuesdayMorning,
        TimeSlot.WednesdayMorning,
        TimeSlot.ThursdayMorning,
        TimeSlot.FridayMorning,
        TimeSlot.MondayAfternoon,
        TimeSlot.TuesdayAfternoon,
        TimeSlot.WednesdayAfternoon,
        TimeSlot.ThursdayAfternoon,
        TimeSlot.FridayAfternoon
    ];

    function sortSlots(startVal: FreNode[]) {
        for (let i = 0; i < 10 ; i++) {
            sortedSlots[i] = [];
        }
        (startVal as Slot[]).forEach((val, index) => {
            // remember which box belongs to which slot
            slotToBoxMap.set(val, box.children[index]);
            switch (val.$time.day) {
                case 1: {
                    switch (val.$time.part) {
                        case 1: { // Mon mor
                            sortedSlots[0].push(val);
                            break;
                        }
                        case 2: { // monday afternoon
                            sortedSlots[5].push(val);
                            break;
                        }
                        default: {
                            sortedSlots[0].push(val);
                        }
                    }
                    break;
                }
                case 2: {
                    switch (val.$time.part) {
                        case 1: {
                            sortedSlots[1].push(val);
                            break;
                        }
                        case 2: {
                            sortedSlots[6].push(val);
                            break;
                        }
                        default: {
                            sortedSlots[1].push(val);
                        }
                    }
                    break;
                }
                case 3: {
                    switch (val.$time.part) {
                        case 1: {
                            sortedSlots[2].push(val);
                            break;
                        }
                        case 2: {
                            sortedSlots[7].push(val);
                            break;
                        }
                        default: {
                            sortedSlots[2].push(val);
                        }
                    }
                    break;
                }
                case 4: {
                    switch (val.$time.part) {
                        case 1: {
                            sortedSlots[3].push(val);
                            break;
                        }
                        case 2: {
                            sortedSlots[8].push(val);
                            break;
                        }
                        default: {
                            sortedSlots[3].push(val);
                        }
                    }
                    break;
                }
                case 5: {
                    switch (val.$time.part) {
                        case 1: {
                            sortedSlots[4].push(val);
                            break;
                        }
                        case 2: {
                            sortedSlots[9].push(val);
                            break;
                        }
                        default: {
                            sortedSlots[4].push(val);
                        }
                    }
                    break;
                }
            }
        })
    }

    /* Sort the list of slots based on the time */
    function getSlotList() {
        console.log('getSlotList')
        let startVal: FreNode[] | undefined = box.getPropertyValue();
        if (!!startVal && box.getPropertyType() === "Slot") {
            // cast the startVal to the expected type, in this case "Slot[]".
            // sort the slots based on the time and remember which box belongs to which slot
            sortSlots(startVal);
            // sortedSlots = sortedSlots;
        }
    }

    const addSlot = (timeStamp: TimeSlot) => {
        // Note that you need to put any changes to the actual model in a 'AST.change or AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.changeNamed("ExternalPartListComponent.addChild", () => {
            let newSlot: Slot = Slot.create({time: FreNodeReference.create<TimeSlot>(timeStamp, "TimeSlot")});
            box.getPropertyValue().push(newSlot);
        });
    }

    getSlotList();
</script>


<div class="demo-table-container">
    <table class="demo-table">
        <thead>
        <tr class="demo-header-row">
            <th class="demo-header-cell">--</th>
            {#each dayTitle as title}
                <th class="demo-header-cell">{title}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
        <tr class="demo-row">
            <td class="demo-header-cell">Morning</td>
            {#each sortedSlots  as slots, index}
                {#if index < 5}
                    {#if slots.length > 0}
                        <td class="demo-cell">
                            <div class="demo-cell-content">
                            {#each slots as slot}
                                <div class="demo-slot-render">
                                <RenderComponent box={slotToBoxMap.get(slot)} editor={editor} />
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
                        <IconButton class="material-icons demo-button" on:click={() => addSlot(stamp)}>add</IconButton>
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
                                <RenderComponent box={slotToBoxMap.get(slot)} editor={editor} />
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
                        <IconButton class="material-icons demo-button" on:click={() => addSlot(stamp)}>add</IconButton>
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
