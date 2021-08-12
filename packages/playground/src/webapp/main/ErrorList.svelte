<!-- this file contains the code for a list of elements that need to shown in a table -->

<div>
    <div class="list">
        {#each headers as column, index}
            <div
                    class="header"
                    on:click={() => {sortOnColumn(index)} }
            >
                {#if sortedBy === index}
                    {#if asc}
                        <Icon color="var(--color)">
                            <svelte:component this={arrowUp} />
                        </Icon>
                    {:else }
                        <Icon color="var(--color)">
                            <svelte:component this={arrowDown} />
                        </Icon>
                    {/if}
                {:else}
                    <Icon><svelte:component this={import_export}/></Icon>
                {/if}
                <span class={sortedBy === index ? "underline" : ""}>{column}</span>
            </div>
        {/each}
        {#each $modelErrrors as item}
            <div class="item" on:click={() => itemSelected(item)}>
                {item.message}
            </div>
            <div class="item" on:click={() => itemSelected(item)}>
                {item.locationdescription}
            </div>
            <div class="item" on:click={() => itemSelected(item)}>
                {item.severity}
            </div>
        {/each}
    </div>
    <div>
        Showing unit {$currentUnitName} of model {$currentModelName}
    </div>
</div>

<!-- todo use 'fly' to delete this view: https://svelte.dev/tutorial/adding-parameters-to-transitions -->
<script lang="ts">

    import { Icon } from "svelte-mui";
    import arrowUp from "../../webapp/assets/icons/svg/arrow_upward.svg";
    import arrowDown from "../../webapp/assets/icons/svg/arrow_downward.svg";
    import import_export from "../../webapp/assets/icons/svg/import_export_24px.svg";

    import sortErrors from "../main-ts-files/SortErrors";
    import { modelErrrors } from "../main-ts-files/ModelErrorsStore";
    import { currentUnitName, currentModelName } from "../WebappStore";
    import { PiError } from "@projectit/core";
    import { EditorCommunication } from "../editor/EditorCommunication";

    let headers: string[] = [ "Error message", "Location", "Severity"];

    let sortedBy: number = 0; // stores the column id by which the table is currently sorted, minus means unsorted
    let asc = false;

    // index is the number of the column by which to sort
    const sortOnColumn = (index: number) => {
        asc = sortedBy === index ? !asc : false;
        sortedBy = index;
        // console.log("columnId: " + index);
        $modelErrrors = sortErrors($modelErrrors, index, asc);
    }

    const itemSelected = (item: PiError) => {
        console.log("item clicked: " + item.message);
        EditorCommunication.getInstance().errorSelected(item);
    }

</script>

<style>
    .list {
        display: grid;
        grid-template-columns: auto 180px 150px;
        grid-gap: 1px;
        max-width: 100%;
        margin: 0 auto;
        background-color: var(--list-divider);
        font-size: var(--error-font-size);
        border-bottom: var(--color) 1px solid;
    }
    .list div{
        background: var(--bg-color); /* color of background of all grid elements */
        padding: 5px;
    }
    .header{
        font-weight: bold;
        cursor: pointer;
        color: var(--color);
    }
    .header .underline{
        text-decoration: underline;
    }
    .item{
        text-align: left;
        color: var(--color);
    }
</style>

