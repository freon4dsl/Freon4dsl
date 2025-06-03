<DataTable
        sortable
        bind:sort
        bind:sortDirection
        onSMUIDataTableSorted={handleSort}
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
    {#each searchResults.list as item, index}
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
            closed={searchResultLoaded.value}
            aria-label="Data is being loaded..."
    />
</DataTable>

<script lang="ts">
    import DataTable, { Head, Body, Row, Cell, Label } from "@smui/data-table";
    import type { SortValue } from "@material/data-table"; // should be recursive by SMUI, but gives error
    import Radio from '@smui/radio';
    import LinearProgress from "@smui/linear-progress";
    import IconButton from "@smui/icon-button";
    import { searchResultLoaded, searchResults } from "../stores/InfoPanelStore.svelte";
    import {FreError, isNullOrUndefined} from "@freon4dsl/core";
    import { EditorState } from "$lib/language/EditorState";

    // sorting of table
    let sort: keyof FreError = $state("message");
    let sortDirection: Lowercase<keyof typeof SortValue> = $state("ascending");

    function handleSort() {
        // first remember the currently selected item
        let item;
        if (!!searchResults.list && searchResults.list.length > 0) {
            item = searchResults.list[selected];
        }
        searchResults.list.sort((a, b) => {
            const [aVal, bVal] = [a[sort], b[sort]][
                sortDirection === "ascending" ? "slice" : "reverse"
                ]();
            if (typeof aVal === "string" && typeof bVal === "string") {
                return aVal.localeCompare(bVal);
            }
            return Number(aVal) - Number(bVal);
        });
        searchResults.list = searchResults.list; // we need an assignment to trigger svelte's reactiveness
        // find the new index for the selected item and make sure this is marked
        if (!isNullOrUndefined(item)) {
            selected = searchResults.list.indexOf(item);
            handleClick(selected);
        }
    }

    // selection of row does not function, therefore we use the checkbox option from the SMUI docs
    // todo look into selection of row in searchlist
    let selected: number = $state(0);
    $effect(() => {handleClick(selected);});

    const handleClick = (index: number) => {
        if (!!searchResults.list && searchResults.list.length > 0) {
            const item = searchResults.list[index];
            if (Array.isArray(item.reportedOn)) {
                // todo get info on property from 'reportedOn'
                EditorState.getInstance().selectElement(item.reportedOn[0], item.propertyName);
            } else {
                EditorState.getInstance().selectElement(item.reportedOn, item.propertyName);
            }
        }
    }
</script>
