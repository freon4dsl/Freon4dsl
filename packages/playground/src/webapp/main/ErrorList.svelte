<!-- this file contains the code for a list of elements that need to shown in a table -->

<div class="list-viewport">
    <div class="list">
        {#each headers as column, index}
            <div
                    class="header"
                    on:click={() => {sortOnColumn(index)} }
            >
                {#if sortedBy === index}
                    <!-- compiled svg -->
                    <Icon>
                        <svelte:component this={asc ? arrowUp : arrowDown} />
                    </Icon>
                {:else}
                    <Icon><svelte:component this={import_export}/></Icon>
                {/if}
                <span class={sortedBy === index ? "underline" : ""}>{column}</span>
            </div>
        {/each}
        {#each data as item}
            <div class="item">
                {item.message}
            </div>
            <div class="item">
                {item.foundIn}
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
    import arrowUp from '../../webapp/assets/icons/svg/arrow-up.svg';
    import arrowDown from '../../webapp/assets/icons/svg/arrow-down.svg';
    import import_export from '../../webapp/assets/icons/svg/import_export_24px.svg';

    import sortErrors from "../main-ts-files/SortErrors";
    import type {ErrorMessage} from "../main-ts-files/ErrorMessage";

    let internaldata: ErrorMessage[] = [
        {message: 'error message1', foundIn: 'model part A', severity: 'error', id:1},
        {message: 'error message2', foundIn: 'model part A', severity: 'error', id:2},
        {message: 'error message3', foundIn: 'model part C', severity: 'error', id:3},
        {message: 'error message4', foundIn: 'model part B', severity: 'warning', id:4},
        {message: 'error message5', foundIn: 'model part A', severity: 'error', id:5},
        {message: 'error message6', foundIn: 'model part A', severity: 'error', id:6},
        {message: 'error message7', foundIn: 'model part A', severity: 'error', id:7},
        {message: 'error message8', foundIn: 'model part C', severity: 'error', id:8},
        {message: 'error message9', foundIn: 'model part B', severity: 'warning', id:9},
        {message: 'error message10', foundIn: 'model part A', severity: 'error', id:10}
    ];
    export let headers: string[] = [ "Error message", "Found in", "Severity"];
    export let data: ErrorMessage[] = internaldata;

    let sortedBy: number = 0; // stores the column id by which the table is currently sorted, minus means unsorted
    let asc = false;

    // index is the number of the column by which to sort
    const sortOnColumn = (index: number) => {
        asc = sortedBy === index ? !asc : false;
        sortedBy = index;
        // console.log("columnId: " + index);
        data = sortErrors(data, index, asc);
    }

</script>

<style>
    .list-viewport{
        border: 2px solid black;
        overflow: auto;
        max-height: 15vh;
    }
    .header{
        font-weight: bold;
        cursor: pointer;
    }
    .header .underline{
        text-decoration: underline;
        /*text-underline: #333333;*/
    }
    .list {
        display: grid;
        grid-template-columns: auto 180px 150px;
        /*grid-template-rows: repeat(6, minmax(150px, auto));*/
        grid-gap: 1px;
        max-width: 100%;
        margin: 0 auto;
        background-color: black;
        font-size: var(--error-font-size);
    }
    .list div{
        background: var(--bg-color);
        padding: 5px;
    }
    /*.list div:nth-child(even){*/
    /*    background: #666;*/
    /*    padding: 10px;*/
    /*}*/
    .item{
        text-align: left;
    }
</style>

