<script lang='ts'>

    import IconButton, { Label, Icon } from "@smui/button";
    import { mdiExclamation, mdiCheckCircle } from "@mdi/js";
    import { Svg } from "@smui/common/elements";
    import Banner from "@smui/banner";

    import { userMessage, userMessageOpen } from "../stores/UserMessageStore";

    import SplitPane from "../components/SplitPane.svelte";
    import EditorPart from "../components/editor-panel/EditorPart.svelte";
    import InfoPanel from "../components/info-panel/InfoPanel.svelte";
    // todo restrict height to 100vh, and show footer
</script>

<div>
    <Banner bind:open={$userMessageOpen} mobileStacked content$style='max-width: max-content;'>
        <Icon slot='icon' component={Svg} viewBox='0 0 24 24'>
            <path fill='red' d={mdiExclamation}/>
        </Icon>
        <Label slot='label'>
            {$userMessage}
        </Label>
        <IconButton slot='actions'>
            <Icon component={Svg} viewBox='0 0 24 24'>
                <path fill='red' d={mdiCheckCircle}/>
            </Icon>
        </IconButton>
    </Banner>
    <SplitPane type='vertical' pos={80}>
        <section class='splitpane-section' slot='a'>
            <div>
                <EditorPart/>
            </div>
        </section>

        <section class='splitpane-section' slot='b'>
            <div>
                <InfoPanel/>
            </div>
        </section>
    </SplitPane>

</div>
