<!-- For now we use an ExpansionPanel, when we change to another ui-lib, we can use tabs. -->

<div class="infoPanel">
    <ExpansionPanel style={infoPanelStyle} name="errors" bind:group={group} bind:expand="{$errorsOpen}" {dense} on:change={onchange}>
        <ErrorList/>
    </ExpansionPanel>
    <ExpansionPanel style={infoPanelStyle} name="search results" bind:group={group} bind:expand="{$searchResultsOpen}" {dense} on:change={onchange}>
        <SearchResults/>
    </ExpansionPanel>
</div>

<script lang="ts">
    import { ExpansionPanel } from "svelte-mui";
    import ErrorList from "./ErrorList.svelte";
    import SearchResults from "./SearchResults.svelte";
    import { infoPanelStyle } from "../menu/StyleConstants";
    import { searchResultsOpen, errorsOpen } from "../webapp-ts-utils/InfoPanelStore"

    let group = 1;
    let dense = true;

    // TODO expanding search results programmatically still does not work
    const onchange = ({ detail }) => {
        if (detail.expanded && detail.name === "errors") {
            $searchResultsOpen = false;
            $errorsOpen = true;
        } else {
            $searchResultsOpen = true;
            $errorsOpen = false;
        }
        // console.log(detail.expanded ? 'open' : 'close', "[" + detail.name + "]", ' searchResultsOpen ' + $searchResultsOpen, ' errorsOpen ' + $errorsOpen);
    };
</script>
