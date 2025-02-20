<script lang='ts'>
    // todo this component can be combined with FreonLayout
    import Banner from "@smui/banner";
    import { Label } from "@smui/button";

    import { userMessage, userMessageOpen, severity } from "./components/stores/UserMessageStore.svelte";
    import SplitPane from "./components/SplitPane.svelte";
    import EditorPart from "./components/editor-panel/EditorPart.svelte";
    import InfoPanel from "./components/info-panel/InfoPanel.svelte";
    import Button from "@smui/button";
    import { FreErrorSeverity } from "@freon4dsl/core";

    // Instead of a button to dismiss the banner, we use a 'normal' text button.
    // Instead of an icon in front of the banner message, which takes up a lot of vertical space,
    // we use a different style/color for the error message.
    // todo use freon variables here
    let severityClass: string = $state("red");
    $effect( () => {
        severityClass =
            severity.value === FreErrorSeverity.Info ?
                "blue"
                : (severity.value === FreErrorSeverity.Hint ?
                    "green"
                    : (severity.value === FreErrorSeverity.Warning ?
                        "plum"
                        : (severity.value === FreErrorSeverity.Error ?
                            "red"
                            : "black")));
    });
</script>

<div>
    <Banner bind:open={userMessageOpen.value} mobileStacked content$style='max-width: max-content;'>
        {#snippet label()}
        <Label style="color:{severityClass}">
            {userMessage.value}
        </Label>
        {/snippet}
        {#snippet actions()}
        <Button>Dismiss</Button>
        {/snippet}
    </Banner>
    <SplitPane type='vertical' pos={80}>
        {#snippet a()}
            <EditorPart/>
        {/snippet}
        {#snippet b()}
            <InfoPanel/>
        {/snippet}
    </SplitPane>
</div>
