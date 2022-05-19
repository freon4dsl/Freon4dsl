<script lang='ts'>
    import { Label } from "@smui/button";
    import Tab from "@smui/tab";
    import TabBar from "@smui/tab-bar";
    import Card from "@smui/card";
    import ErrorList from "./ErrorList.svelte";
    import SearchResults from "./SearchResults.svelte";
    import { errorsLoaded, searchResultLoaded } from "../../stores/InfoPanelStore";

    const errorTitle = "Errors";
    const searchTitle = "Search";
    let active = errorTitle;

    // todo loading of erros and search results should also depend on weather something has changed in the unit shown
    $: active === errorTitle ? $errorsLoaded = false : $searchResultLoaded = false;
</script>

<TabBar tabs={[errorTitle, searchTitle]} let:tab bind:active>
    <Tab {tab} minWidth
         onChange:
    >
        <Label>{tab}</Label>
    </Tab>
</TabBar>

<div class='mdc-typography--body1'>
    {#if active === errorTitle}
        <Card>
            <ErrorList />
        </Card>
    {:else if active === searchTitle}
        <Card>
            <SearchResults />
        </Card>
    {/if}
</div>
