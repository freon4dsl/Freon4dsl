<script>
    import SplitPane from "./SplitPane.svelte";
    import ErrorList from "./ErrorList.svelte";
    import EditorGrid from "./EditorGrid.svelte";

    let orientation = "rows";
    let fixed = false;
    let fixedPos = 80;
</script>

<style>
    .maingrid {
        position: relative;
        width: 100%;
        height: 100%;
    }
    .maingrid .section {
        position: relative;
        height: 100%;
        box-sizing: border-box;
    }
    /*.container :global(section) > :global(*):first-child {*/
    /*    position: absolute;*/
    /*    top: 0;*/
    /*    left: 0;*/
    /*    width: 100%;*/
    /*    height: 42px;*/
    /*    box-sizing: border-box;*/
    /*}*/
    /*.container :global(section) > :global(*):last-child {*/
    /*    width: 100%;*/
    /*    height: 100%;*/
    /*}*/
</style>

<div class="maingrid">
    <SplitPane
            type="{orientation === 'rows' ? 'vertical' : 'horizontal'}"
            pos="{fixed ? fixedPos : orientation === 'rows' ? 80 : 80}"
            {fixed}
    >
        <section class="section" slot=a>
            <EditorGrid/>
        </section>

        <section class="section" slot=b>
            <ErrorList/>
        </section>
    </SplitPane>
</div>
