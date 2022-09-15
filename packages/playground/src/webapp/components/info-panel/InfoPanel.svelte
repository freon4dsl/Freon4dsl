<script lang='ts'>
    import { Label } from "@smui/button";
    import Tab from "@smui/tab";
    import TabBar from "@smui/tab-bar";
    import Card from "@smui/card";
    import ErrorList from "./ErrorList.svelte";
    import SearchResults from "./SearchResults.svelte";
    import { errorTab, searchTab, activeTab } from "../stores/InfoPanelStore";

</script>

<TabBar tabs={[errorTab, searchTab]} let:tab bind:active={$activeTab}>
    <Tab {tab} minWidth>
        <Label>{tab}</Label>
    </Tab>
</TabBar>

<div class='mdc-typography--body1 infopanel'>
    {#if $activeTab === errorTab}
        <Card>
            <ErrorList />
        </Card>
    {:else if $activeTab === searchTab}
        <Card>
            <SearchResults />
        </Card>
    {/if}
</div>

<style>
    .infopanel {
        overflow: auto;
        box-sizing: border-box;
        padding: 4px;
    }
</style>
