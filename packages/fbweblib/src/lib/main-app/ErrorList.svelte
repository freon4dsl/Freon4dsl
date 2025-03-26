<script>
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    let items = [
        { id: 1, maker: 'Toyota', type: 'ABC', make: 2017 },
        { id: 2, maker: 'Ford', type: 'CDE', make: 2018 },
        { id: 3, maker: 'Volvo', type: 'FGH', make: 2019 },
        { id: 4, maker: 'Saab', type: 'IJK', make: 2020 }
    ];
</script>

<Table hoverable={true} {items} striped={true}>
    <TableHead>
        <TableHeadCell sort={(a, b) => a.id - b.id}>ID</TableHeadCell>
        <TableHeadCell sort={(a, b) => a.maker.localeCompare(b.maker)} defaultSort>Maker</TableHeadCell>
        <TableHeadCell sort={(a, b) => a.type.localeCompare(b.type)}>Type</TableHeadCell>
        <TableHeadCell sort={(a, b) => a.make - b.make} defaultDirection="desc">Make</TableHeadCell>
        <TableHeadCell>
            <span class="sr-only">Buy</span>
        </TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
        <TableBodyRow slot="row" let:item>
            <TableBodyCell>{item.id}</TableBodyCell>
            <TableBodyCell>{item.maker}</TableBodyCell>
            <TableBodyCell>{item.type}</TableBodyCell>
            <TableBodyCell>{item.make}</TableBodyCell>
            <TableBodyCell>
                <a href="/tables" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Buy</a>
            </TableBodyCell>
        </TableBodyRow>
    </TableBody>
</Table>
