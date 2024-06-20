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
            <Cell checkbox sortable={false}>
                <Label>Show in Editor</Label>
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
        <Row>
            <Cell>
                <Radio
                        bind:group={selected}
                        value={index}
                />
            </Cell>
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
    import Radio from '@smui/radio';
    import LinearProgress from "@smui/linear-progress";
    import IconButton from "@smui/icon-button";
    import { searchResultLoaded, searchResults } from "../stores/InfoPanelStore";
    import type { FreError } from "@freon4dsl/core";
    import { EditorState } from "../../language/EditorState";

    // sorting of table
    let sort: keyof FreError = "message";
    let sortDirection: Lowercase<keyof typeof SortValue> = "ascending";

    function handleSort() {
        // first remember the currectly selected item
        let item;
        if (!!$searchResults && $searchResults.length > 0) {
            item = $searchResults[selected];
        }
        $searchResults.sort((a, b) => {
            const [aVal, bVal] = [a[sort], b[sort]][
                sortDirection === "ascending" ? "slice" : "reverse"
                ]();
            if (typeof aVal === "string" && typeof bVal === "string") {
                return aVal.localeCompare(bVal);
            }
            return Number(aVal) - Number(bVal);
        });
        $searchResults = $searchResults; // we need an assignment to trigger svelte's reactiveness
        // find the new index for the selected item and make sure this is marked
        selected = $searchResults.indexOf(item);
        handleClick(selected);
    }

    // selection of row does not function, therefore we use the checkbox option from the SMUI docs
    // todo look into selection of row in searchlist
    let selected: number = 0;
    $: handleClick(selected);

    const handleClick = (index: number) => {
        if (!!$searchResults && $searchResults.length > 0) {
            const item = $searchResults[index];
            if (Array.isArray(item.reportedOn)) {
                // todo get info on property from 'reportedOn'
                EditorState.getInstance().selectElement(item.reportedOn[0], item.propertyName);
            } else {
                EditorState.getInstance().selectElement(item.reportedOn, item.propertyName);
            }
        }
    }
</script>
