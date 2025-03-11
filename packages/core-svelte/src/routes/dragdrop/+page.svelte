<script lang="ts">
    import {
        BoxUtil,
        FreErrorSeverity, FreNodeReference,
        type ListBox,
        ListDirection, type TableBox,
        TableDirection, TableUtil,
    } from '@freon4dsl/core';
    import ListComponent from '$lib/components/ListComponent.svelte';
    import TableComponent from '$lib/components/TableComponent.svelte';
    import {
        SvelteTestEnvironment
    } from "$lib/__test__/test-environment/svelte-test-model/config/gen/SvelteTestEnvironment";
    import {SvelteTestInstantiator} from "$lib/__test__/test-environment/svelte-test-model/SvelteTestInstantiator";
    import {OtherType, SimpleNode} from "$lib/__test__/test-environment/svelte-test-model";
    import {makeListBox, makeTableBox} from "$lib/__test__/test-environment/utils/CommonFunctions";
    import {contextMenu, draggedElem} from "$lib/components/stores/AllStores.svelte";
    import ContextMenu from "$lib/components/ContextMenu.svelte";
    import {runInAction} from "mobx";

    let editor = SvelteTestEnvironment.getInstance().editor;

    const myUnit = SvelteTestInstantiator.makeTestUnit("UNIT");
    runInAction(() => {
        editor.rootElement = myUnit;
        editor.setUserMessage = setUserMessage;
    });

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
    let listBox1: ListBox = makeListBox<SimpleNode>(myUnit, myUnit.myList1, 'myList1', ListDirection.HORIZONTAL);
    let listBox2: ListBox = makeListBox<SimpleNode>(myUnit, myUnit.myList2, 'myList2', ListDirection.VERTICAL);
    let listBox3: ListBox = makeListBox<OtherType>(myUnit, myUnit.myList3, 'myList3', ListDirection.HORIZONTAL);
    let listBox4: ListBox = BoxUtil.verticalReferenceListBox(myUnit, "myList7", SvelteTestEnvironment.getInstance().scoper, undefined);
    let listBox5: ListBox = BoxUtil.verticalReferenceListBox(myUnit, "myList8", SvelteTestEnvironment.getInstance().scoper, undefined);
    let listBox6: ListBox = BoxUtil.horizontalReferenceListBox(myUnit, "myList9", SvelteTestEnvironment.getInstance().scoper, undefined);

    // for TableComponent
    let tableBox1: TableBox = makeTableBox<SimpleNode>(myUnit, myUnit.myList4, 'myList4', 'SimpleNode', TableDirection.HORIZONTAL);
    let tableBox2: TableBox = makeTableBox<SimpleNode>(myUnit, myUnit.myList5, 'myList5', 'SimpleNode', TableDirection.VERTICAL);
    let tableBox3: TableBox = makeTableBox<OtherType>(myUnit, myUnit.myList6, 'myList6', 'OtherType', TableDirection.HORIZONTAL);

    let draggedId: string | undefined = $derived.by(() =>{
        if (draggedElem.value?.element instanceof FreNodeReference) {
            return draggedElem.value?.element.name
        } else {
            return draggedElem.value?.element.freId()
        }
    })
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

<ContextMenu bind:this={contextMenu.instance} {editor} />

<div style="height:1000px;" class="test-area">
    <div style="font-weight: bold"> NB the list and table components are not refreshed, because mobx works through editor.rootBox and here we use a different box model.
        Use a console.log message from ListUtil (from core) to see whether the drop has worked.</div>
    <hr class="line" />
    <ul>
        <li>
            Test ListComponent horizontal: <ListComponent {editor} box={listBox1} />
            <br/>
            Test ListComponent vertical: <ListComponent {editor} box={listBox2} />
            <br />
            Test ListComponent other types: <ListComponent {editor} box={listBox3} />
            <br />
            Test ListComponent ref types: <ListComponent {editor} box={listBox4} />
            <br />
            Test ListComponent ref types: <ListComponent {editor} box={listBox5} />
            <br />
            Test ListComponent ref other types: <ListComponent {editor} box={listBox6} />
            <br />
            <div class="error" style="color:{severityClass}">
                <button onclick={resetUserMessage}>Reset message</button>
                {message}
            </div>
        </li>
        <hr class="line" />
        <p style="color:green">Currently dragged node "{draggedId}" of type "{draggedElem.value?.elementType}"</p>
        <hr class="line" />
        <li>
            Test TableComponent row oriented: <TableComponent {editor} box={tableBox1} />
            <br/>
            Test TableComponent column oriented: <TableComponent {editor} box={tableBox2} />
            <br />
            Test TableComponent other types: <TableComponent {editor} box={tableBox3} />
            <br />
            <p>NB Because every row of a table (or column if otherwise oriented) correspond with a single node, the above test
            is not representative.</p>
            <p>NB References cannot be displayed in a table, therefore there is no test for references here.</p>
            <hr class="line" />
        </li>
    </ul>
</div>

<style>
</style>
