<DataTable
        sortable
        bind:sort
        bind:sortDirection
        on:SMUIDataTable:sorted={handleSort}
        table$aria-label="Search results"
        style="width: 100%;"
>
    <Head>
        <Row>
            <!--
                Note: whatever you supply to "columnId" is
                appended with "-status-label" and used as an ID
                for the hidden label that describes the sort
                status to screen readers.

                You can localize those labels with the
                "sortAscendingAriaLabel" and
                "sortDescendingAriaLabel" props on the DataTable.
            -->
            <Cell numeric columnId="id">
                <!-- For numeric columns, icon comes first. -->
                <IconButton class="material-icons">arrow_upward</IconButton>
                <Label></Label>
            </Cell>
            <Cell columnId="message" style="width: 100%;">
                <Label>Text found</Label>
                <!-- For non-numeric columns, icon comes second. -->
                <IconButton class="material-icons">arrow_upward</IconButton>
            </Cell>
            <Cell columnId="locationdescription">
                <Label>Location</Label>
                <IconButton class="material-icons">arrow_upward</IconButton>
            </Cell>
        </Row>
    </Head>
    <Body>
    {#each $searchResults as item, index}
        <Row on:mousedown={xxx(item)}>
            <Cell numeric>{index}</Cell>
            <Cell>{item.message}</Cell>
            <Cell>{item.locationdescription}</Cell>
        </Row>
    {/each}
    </Body>

    <LinearProgress
            indeterminate
            closed="{$searchResultLoaded}"
            aria-label="Data is being loaded..."
            slot="progress"
    />
</DataTable>

<script lang="ts">
    import DataTable, { Head, Body, Row, Cell, Label } from "@smui/data-table";
    import type { SortValue } from "@material/data-table"; // should be exported by SMUI, but gives error
    import LinearProgress from "@smui/linear-progress";
    import IconButton from "@smui/icon-button";
    import { searchResultLoaded, searchResults } from "../stores/InfoPanelStore";
    import type { PiError } from "@projectit/core";

    // sorting of table
    let sort: keyof PiError = "message";
    let sortDirection: Lowercase<keyof typeof SortValue> = "ascending";

    function handleSort() {
        $searchResults.sort((a, b) => {
            const [aVal, bVal] = [a[sort], b[sort]][
                sortDirection === "ascending" ? "slice" : "reverse"
                ]();
            if (typeof aVal === "string" && typeof bVal === "string") {
                return aVal.localeCompare(bVal);
            }
            return Number(aVal) - Number(bVal);
        });
        $searchResults = $searchResults;
    }

    // selection of row
    function handleClick(item: PiError) {
        console.log("item clicked: " + item.message);
        // EditorCommunication.getInstance().selectElement(item.reportedOn);
    }
    // todo handleCLick
    function xxx(e: CustomEvent) {
        console.log("P+OK: " + e.detail)
    }
</script>
