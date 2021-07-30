<div class="editorArea">
<!--    tmp to see whether the names are set-->
<!--    <div>-->
<!--        This is a large div to make room for the menus.-->
<!--    </div>-->
<!--    <div>-->
<!--        This is a large div to make room for the menus.-->
<!--    </div>-->
<!--    <div>-->
<!--        This is a large div to make room for the menus.-->
<!--    </div>-->
<!--    <div>-->
<!--        This is a large div to make room for the menus.-->
<!--    </div>-->
<!--    <div>-->
<!--        This is a large div to make room for the menus.-->
<!--    </div>-->
<!--    <div>-->
<!--        This is a large div to make room for the menus.-->
<!--    </div>-->
    <h5>Showing unit <i>{$currentUnitName}</i> of model <i>{$currentModelName}</i></h5>
<!--    end tmp-->
    <ProjectItComponent editor={editorEnvironment.editor}/>
</div>

<script lang="ts">
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { currentUnitName, currentModelName } from "../menu-ts-files/WebappStore";
    import { editorEnvironment } from "../WebappConfiguration";
</script>

<style>
    .editorArea{
        max-width: 1500px;
    }
</style>
