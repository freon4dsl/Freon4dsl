<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow } from "flowbite-svelte"
    import { type FreError, FreErrorSeverity } from "@freon4dsl/core"
    import { modelErrors } from "$lib/stores/InfoPanelStore.svelte.js"
    import { goToNode } from "$lib/ts-utils/CommonFunctions.js"

    // let items: FreError[] = $derived(modelErrors.list.filter(err => {
    //     err.severity === FreErrorSeverity.Error
    // }));
    let items: FreError[] = $derived(modelErrors.list);
</script>

<Table hoverable={true} {items} striped={true}>
    <TableBody tableBodyClass="divide-y">
        <TableBodyRow slot="row" let:item>
            <TableBodyCell class="p-1.5">
                <button class="font-medium text-primary-900 hover:underline dark:text-primary-500" onclick={() => goToNode(item.reportedOn)}>{item.message}</button>
            </TableBodyCell>
        </TableBodyRow>
    </TableBody>
</Table>

