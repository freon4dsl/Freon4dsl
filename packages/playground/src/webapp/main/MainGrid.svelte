<script>
    import SplitPane from './SplitPane.svelte';
    import ErrorList from "./ErrorList.svelte";
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";

    export let orientation = 'rows';
    export let fixed = false;
    export let fixedPos = 50;

</script>

<style>
    .grid {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .grid :global(section) {
        position: relative;
        height: 100%;
        box-sizing: border-box;
    }
</style>

<div class="grid" class:orientation>
    <SplitPane
            type="vertical"
            pos="{fixed ? fixedPos : orientation === 'rows' ? 50 : 60}"
    >
        <section slot=a style="border: 2px solid darkblue">
            <ProjectItComponent editor={editorEnvironment.editor}/>
        </section>

        <section slot=b style='border: 2px solid darkblue'>
            <ErrorList/>
        </section>
    </SplitPane>
</div>
