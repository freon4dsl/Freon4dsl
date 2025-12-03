<script lang="ts">
    import {
        type Box,
        FreEditor,
        FreLanguageEnvironment,
        FreProjectionHandler,
        HorizontalListBox,
        LabelBox,
        type ListBox,
        type TableBox, TableBoxRowOriented,
        TableCellBox,
        TableRowBox,
        VerticalListBox
    } from '@freon4dsl/core';
    import { ModelMaker } from '$lib/__test__/test-environment/simple-models/ModelMaker.js';
    import { ElementWithList } from '$lib/__test__/test-environment/simple-models/ElementWithList.js';
    import ListComponent from '$lib/components/ListComponent.svelte';
    import TableComponent from '$lib/components/TableComponent.svelte';

    let editor = new FreEditor(new FreProjectionHandler(), new FreLanguageEnvironment());

    // for ListComponent
    let listElement1: ElementWithList = ModelMaker.makeList('List1');
    let listChildren1: Box[] = [];
    listElement1.myList.forEach((xx, index) => {
        listChildren1.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `List1 content ${index}`;
            })
        );
    });
    let listElement2: ElementWithList = ModelMaker.makeList('List2');
    let listChildren2: Box[] = [];
    listElement2.myList.forEach((xx, index) => {
        listChildren2.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `List2 content ${index}`;
            })
        );
    });
    let listBox1: ListBox = new HorizontalListBox(
        listElement1,
        'myList',
        'horizontal-list',
        listChildren1
    );
    let listBox2: ListBox = new VerticalListBox(
        listElement2,
        'myList',
        'vertical-list',
        listChildren2
    );

    // for TableComponent
    let listElement3: ElementWithList = ModelMaker.makeList('List3');
    let tableRows: TableRowBox[] = [];
    listElement3.myList.forEach((xx, index) => {
        let cells: TableCellBox[] = [];
        cells.push(
            new TableCellBox(
                xx,
                'myList',
                index,
                'ElementWithList',
                'table-label-box',
                index + 1,
                index + 1,
                new LabelBox(xx, 'table-label-box', () => {
                    return `Table content ${index}`;
                })
            )
        );
        tableRows.push(new TableRowBox(xx, 'row', cells, index));
    });
    let tableBox: TableBox = new TableBoxRowOriented(
        listElement3,
        'myList',
        'ElementWithList',
        'table',
        false,
        tableRows
    );
</script>

<div class="top">
    <h1>TODO Test for selecting boxes by tabbing and arrow keys</h1>
    <div class="button-container">
        <a href=".">Basic tests</a>
        <a href="./render">Tests that use RenderComponent</a>
        <a href="./dragdrop">Drag and Drop tests</a>
<!--        <a href="./tabbing">Selection tests</a>-->
    </div>
</div>

<div style="height:1000px;" class="test-area">
    <ul>
        <li>
            Test ListComponent horizontal: <ListComponent {editor} box={listBox1} />
            Test ListComponent vertical: <ListComponent {editor} box={listBox2} />
            <br />
            TODO: Drag and drop not functioning properly.
            <hr class="line" />
        </li>
        <li>
            Test TableComponent: <TableComponent {editor} box={tableBox} />
            <br />
            TODO: Drag and drop not functioning properly.
            <br />
            TODO: TableBox constructor is protected, should be public.
            <hr class="line" />
        </li>
    </ul>
</div>

<style>
</style>
