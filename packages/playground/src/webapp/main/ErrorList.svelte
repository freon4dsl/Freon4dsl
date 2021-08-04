<!-- this file contains the code for a list of elements that need to shown in a table -->

<div>
    <div class="list">
        {#each headers as column, index}
            <div
                    class="header"
                    on:click={() => {sortOnColumn(index)} }
            >
                {#if sortedBy === index}
                    <!-- compiled svg -->
                    <Icon color="black">
                        <svelte:component this={asc ? arrowUp : arrowDown} />
                    </Icon>
                {:else}
                    <Icon><svelte:component this={import_export}/></Icon>
                {/if}
                <span class={sortedBy === index ? "underline" : ""}>{column}</span>
            </div>
        {/each}
        {#each $modelErrrors as item}
            <div class="item">
                {item.message}
            </div>
            <div class="item">
                {item.locationdescription}
            </div>
            <div class="item">
                {item.severity}
            </div>
        {/each}
    </div>
</div>

<!-- todo use 'fly' to delete this view: https://svelte.dev/tutorial/adding-parameters-to-transitions -->
<script lang="ts">

    import { Icon } from "svelte-mui";
    import arrowUp from "../../webapp/assets/icons/svg/arrow-up.svg";
    import arrowDown from "../../webapp/assets/icons/svg/arrow_downward.svg";
    import import_export from "../../webapp/assets/icons/svg/import_export_24px.svg";

    import sortErrors from "../main-ts-files/SortErrors";
    import { modelErrrors } from "../main-ts-files/ModelErrorsStore";

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
        border-bottom: var(--pi-darkblue) 1px solid;
    }
    .list div{
        background: var(--bg-color);
        padding: 5px;
    }
    .header{
        font-weight: bold;
        cursor: pointer;
    }
    .header .underline{
        text-decoration: underline;
    }
    .item{
        text-align: left;
    }
</style>

