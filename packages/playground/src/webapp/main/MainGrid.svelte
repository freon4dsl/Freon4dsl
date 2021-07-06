<script>
    import EditorArea from "./EditorArea.svelte";
    import ErrorList from "./ErrorList.svelte";
</script>

<div id="grid">
    <div class="editor"><EditorArea/></div>
    <div class="errorlist"><ErrorList/></div>
</div>

<style>
    /*default layout */
    /* todo layout for small screens  */
    #grid {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        grid-template-rows: repeat(6, minmax(150px, auto));
        grid-gap: 0px;
        grid-template-areas:
            "editor editor editor editor editor editor editor editor editor"
            "editor editor editor editor editor editor editor editor editor"
            "editor editor editor editor editor editor editor editor editor"
            "editor editor editor editor editor editor editor editor editor"
            "errorlist errorlist errorlist errorlist errorlist errorlist errorlist errorlist errorlist"
            "errorlist errorlist errorlist errorlist errorlist errorlist errorlist errorlist errorlist";
        max-width: 100%;
        margin: 0 auto;
    }
    #grid div{
        /*background: #3bbced;*/
        padding: 2px;
    }
    #grid div:nth-child(even){
        /*background: #777;*/
        padding: 2px;
    }
    .editor{
        /*grid-column: 2 / 10;*/
        /*grid-row: 1 / 6;*/
        grid-area: editor;
    }
    .errorlist{
        /*grid-column: 1 / 10;*/
        /*grid-row: 6 / 7;*/
        grid-area: errorlist;
    }

</style>

