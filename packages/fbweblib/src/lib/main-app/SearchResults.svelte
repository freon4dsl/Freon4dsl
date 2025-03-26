<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow } from "flowbite-svelte"
    import { type FreError } from "@freon4dsl/core"
    import { searchResults } from "$lib/stores/InfoPanelStore.svelte"
    import { goToNode } from "$lib/ts-utils/CommonFunctions.js"

    let items: FreError[] = $derived(searchResults.list);

</script>

<Table hoverable={true} {items} striped={true}>
    <TableBody tableBodyClass="divide-y">
        <TableBodyRow slot="row" let:item>
            <TableBodyCell class="p-1.5">
                <button class="font-medium text-primary-600 hover:underline dark:text-primary-500" onclick={() => goToNode(item.reportedOn)}>{item.locationdescription}</button>
            </TableBodyCell>
        </TableBodyRow>
    </TableBody>
</Table>
