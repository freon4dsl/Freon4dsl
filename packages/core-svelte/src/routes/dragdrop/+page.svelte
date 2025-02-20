<script lang="ts">
    import {
        type Box, FreErrorSeverity, type FreNode,
        HorizontalListBox,
        LabelBox,
        type ListBox,
        TableBox,
        TableBoxRowOriented,
        TableCellBox,
        TableRowBox,
        VerticalListBox
    } from '@freon4dsl/core';
    import { ModelMaker } from '$lib/__test__/test-environment/simple-models/ModelMaker.js';
    import { ElementWithList } from '$lib/__test__/test-environment/simple-models/ElementWithList.js';
    import ListComponent from '$lib/components/ListComponent.svelte';
    import TableComponent from '$lib/components/TableComponent.svelte';
    import {
        SvelteTestEnvironment
    } from "$lib/__test__/test-environment/svelte-test-model/config/gen/SvelteTestEnvironment";
    import {SvelteTestInstantiator} from "$lib/__test__/test-environment/svelte-test-model/SvelteTestInstantiator";

    let editor = SvelteTestEnvironment.getInstance().editor;

    const myUnit = SvelteTestInstantiator.makeTestUnit("UNIT76");
    editor.rootElement = myUnit;
    editor.setUserMessage = setUserMessage;

    let message: string = $state('All good');
    let severityClass: string = $state('black')
    function setUserMessage(mess: string, sev: FreErrorSeverity) {
        message = mess;
        severityClass =
            sev === FreErrorSeverity.Info ?
                "blue"
                : (sev === FreErrorSeverity.Hint ?
                    "green"
                    : (sev === FreErrorSeverity.Warning ?
                        "plum"
                        : (sev === FreErrorSeverity.Error ?
                            "red"
                            : "black")));
    }

    function resetUserMessage() {
        message = 'All good';
        severityClass = 'black';
    }

    // for ListComponent
    let listChildren1: Box[] = $state([]);
    myUnit.myList1.forEach((xx) => {
        listChildren1.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `${xx.name}`;
            })
        );
    });
    let listBox1: ListBox = new HorizontalListBox(
        myUnit,
        'myList1',
        'horizontal-list-role',
        listChildren1
    );

    let listChildren2: Box[] = [];
    myUnit.myList2.forEach((xx) => {
        listChildren2.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `${xx.name}`;
            })
        );
    });
    let listBox2: ListBox = new VerticalListBox(
        myUnit,
        'myList2',
        'vertical-list-role',
        listChildren2
    );

    let listChildren3: Box[] = [];
    myUnit.myList3.forEach((xx) => {
        listChildren3.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `${xx.name}`;
            })
        );
    });
    let listBox3: ListBox = new HorizontalListBox(
        myUnit,
        'myList3',
        'other-type-list-role',
        listChildren3
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
    <h1>Test for components that support drag and drop</h1>
    <div class="button-container">
        <a href=".">Basic tests</a>
        <a href="./render">Tests that use RenderComponent</a>
        <!--        <a href="./dragdrop">Drag and Drop tests</a>-->
        <a href="./tabbing">Selection tests</a>
    </div>
</div>

<div style="height:1000px;" class="test-area">
    <ul>
        <li>
            Test ListComponent horizontal: <ListComponent {editor} box={listBox1} />
            <br/>
            Test ListComponent vertical: <ListComponent {editor} box={listBox2} />
            <br />
            Test ListComponent other types: <ListComponent {editor} box={listBox3} />
            <br />
            <div class="error" style="color:{severityClass}">
                <button onclick={resetUserMessage}>Reset message</button>
                {message}
            </div>
            <p> NB the list components are not refreshed, because mobx works through editor.rootBox and here we use a different box model.
            Use a console.log message from ListUtil (from core) to see whether the drop has worked.</p>
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
