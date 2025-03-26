<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow } from "flowbite-svelte"
    import { type FreError, type FreNode } from "@freon4dsl/core"
    import { searchResults } from "$lib/stores/InfoPanelStore.svelte"

    let items: FreError[] = $derived(searchResults.list);

    function gotoNode(node: FreNode | FreNode[]) {
        if (Array.isArray(node)) {
            console.log(`gotoNode: ${node[0]?.freId()}`)
        } else {
            console.log(`gotoNode: ${node.freId()}`)
        }
    }
</script>

<Table hoverable={true} {items} striped={true}>
    <TableBody tableBodyClass="divide-y">
        <TableBodyRow slot="row" let:item>
            <TableBodyCell>{item.locationdescription}</TableBodyCell>
            <TableBodyCell>
                <button class="font-medium text-primary-600 hover:underline dark:text-primary-500" onclick={() => gotoNode(item.reportedOn)}>Go to ...</button>
            </TableBodyCell>
        </TableBodyRow>
    </TableBody>
</Table>
