<script>
    import SplitPane from './SplitPane.svelte';
    import ErrorList from "./ErrorList.svelte";
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";
    import { currentModelName, currentUnitName } from "../WebappStore";

    export let orientation = 'rows';
    export let fixed = false;
    export let fixedPos = 80;

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

<div>showing unit {$currentUnitName} of model {$currentModelName}</div>
<div class="grid" class:orientation>
    <SplitPane
            type="vertical"
            pos="{fixed ? fixedPos : orientation === 'rows' ? 80 : 80}"
    >
        <section slot=a>
            <ProjectItComponent editor={editorEnvironment.editor}/>
        </section>

        <section slot=b>
            <ErrorList/>
        </section>
    </SplitPane>
</div>
