<script>
    let name = 'world';
</script>

<h1>Hello {name}!</h1>

<div class='CompleteGrid' tabIndex={0}>
    <a class='BlackLink' href='https://svelte.dev'>
        <div class='ListWrapper' tabIndex={0}>
            <div class='cell1 cell'tabIndex={0}>name1</div>
            <div class='cell2 cell' tabIndex={0}>email1</div>
            <div class='cell3 cell'>phone1</div>
            <div class='cell4 cell'>groups1</div>
        </div>
    </a>
    <a class='BlackLink' href='https://svelte.dev'>
        <div class='ListWrapper'>
            <div class='cell1'tabIndex={0} >name2</div>
            <div class='cell2'>email2</div>
            <div class='cell3'>phone2</div>
            <div class='cell4'>groups2</div>
        </div>
    </a>
</div>

<style>
    .CompleteGrid {
        display:grid;
        grid-template-columns:2fr 2fr;
        grid-gap: 10px;
        background-color:#EDF5FC;
        cursor:pointer;
        margin:auto;
    }
    .ListWrapper {
        display:grid;
        grid-template-rows:1.5fr 1.8fr 1.5fr 1fr;
        grid-template-columns:1fr;
        grid-template-areas: "ListTitleTxt email phone groups";
        background-color:#EDF5FC;
        cursor:pointer;
        margin:auto;
        width:85% }

    .ListWrapper:hover { background-color:#1b9bff; color:white; }

    .BlackLink:link { text-decoration:none; color:black; }

    .cell1 {
        grid-row: 1;
        grid-column: 1;
    }
    .cell2 {
        grid-row: 2;
        grid-column: 1;
    }
    .cell3 {
        grid-row: 3;
        grid-column: 1;
    }
    .cell4 {
        grid-row: 4;
        grid-column: 1;
    }
</style>
