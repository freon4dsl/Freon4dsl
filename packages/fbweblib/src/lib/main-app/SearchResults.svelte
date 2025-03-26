<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte"
    import { type FreError, FreErrorSeverity } from "@freon4dsl/core"

    let items: FreError[] = [
        { message: 'Toyota', locationdescription: 'ABC', reportedOn: null, propertyIndex: -1, propertyName: 'name', severity: FreErrorSeverity.NONE },
        { message: 'Ford', locationdescription: 'CDE', reportedOn: null, propertyIndex: -1, propertyName: 'name', severity: FreErrorSeverity.NONE },
        { message: 'Volvo', locationdescription: 'FGH', reportedOn: null, propertyIndex: -1, propertyName: 'name', severity: FreErrorSeverity.NONE},
        { message: 'Saab', locationdescription: 'IJK', reportedOn: null, propertyIndex: -1, propertyName: 'name', severity: FreErrorSeverity.NONE}
    ];
</script>

<Table hoverable={true} {items} striped={true}>
    <TableHead>
        <TableHeadCell sort={(a: FreError, b: FreError) => a.message.localeCompare(b.message)} defaultSort>Text found</TableHeadCell>
        <TableHeadCell sort={(a: FreError, b: FreError) => a.locationdescription.localeCompare(b.locationdescription)}>Location</TableHeadCell>
        <TableHeadCell>
            <span class="sr-only"></span>
        </TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
        <TableBodyRow slot="row" let:item>
            <TableBodyCell>{item.message}</TableBodyCell>
            <TableBodyCell>{item.locationdescription}</TableBodyCell>
            <TableBodyCell>
                <a href="/tables" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Locate</a>
            </TableBodyCell>
        </TableBodyRow>
    </TableBody>
</Table>
