<script lang='ts'>

    import IconButton, { Label, Icon } from "@smui/button";
    import { mdiAlertCircle, mdiCheckCircle, mdiInformation, mdiLightbulb, mdiCheck } from "@mdi/js";
    import { Svg } from "@smui/common/elements";
    import Banner from "@smui/banner";

    import { userMessage, userMessageOpen, severity, SeverityType } from "./components/stores/UserMessageStore";
    import SplitPane from "./components/SplitPane.svelte";
    import EditorPart from "./components/editor-panel/EditorPart.svelte";
    import InfoPanel from "./components/info-panel/InfoPanel.svelte";
    // todo restrict height to 100vh, and show footer
</script>

<div>
    <Banner bind:open={$userMessageOpen} mobileStacked content$style='max-width: max-content;'>
        <Icon slot='icon' class="less-padding" component={Svg} viewBox='0 0 24 24'>
            {#if $severity === SeverityType.info}
                <path d={mdiInformation}/>
            {:else if $severity === SeverityType.hint}
                <path d={mdiLightbulb}/>
            {:else if $severity === SeverityType.warning}
                <path d={mdiAlertCircle}/>
            {:else if $severity === SeverityType.error}
                <path d={mdiCheckCircle}/>
            {/if}
        </Icon>
        <Label slot='label'>
            {$userMessage}
        </Label>
        <IconButton slot='actions'>
            <Icon component={Svg} viewBox='0 0 24 24'>
                <path fill='red' d={mdiCheck}/>
            </Icon>
        </IconButton>
    </Banner>
    <SplitPane type='vertical' pos={80}>
        <section class='splitpane-section' slot='a'>
            <EditorPart/>
        </section>

        <section class='splitpane-section' slot='b'>
            <InfoPanel/>
        </section>
    </SplitPane>
</div>
