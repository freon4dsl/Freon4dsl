<script lang='ts'>
	import IconButton, { Label, Icon } from '@smui/button';
	import { Svg } from '@smui/common/elements';
	import Tab from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import Banner from '@smui/banner';
	import DataTable from '../components/DataTable.svelte';
	import { mdiExclamation, mdiCheckCircle } from '@mdi/js';
	import EditorPart from '../components/EditorPart.svelte';
	import { userMessage, userMessageOpen } from '../stores/UserMessageStore';
	import Card from '@smui/card';
	import SplitPane from '../components/SplitPane.svelte';

	const errorTxt = 'Errors';
	const searchTxt = 'Search';
	let active = errorTxt;
</script>

<div class='outer'>
	<div class='inner'>
		<Banner bind:open={$userMessageOpen} mobileStacked content$style='max-width: max-content;'>
			<Icon slot='icon' component={Svg} viewBox='0 0 24 24'>
				<path fill='red' d={mdiExclamation} />
			</Icon>
			<Label slot='label'>
				{$userMessage}
			</Label>
			<IconButton slot='actions'>
				<Icon component={Svg} viewBox='0 0 24 24'>
					<path fill='red' d={mdiCheckCircle} />
				</Icon>
			</IconButton>
		</Banner>
		<SplitPane type='vertical' pos={80}>
			<section class='splitpane-section' slot='a'>
				<div>
					<EditorPart />
				</div>
			</section>

			<section class='splitpane-section' slot='b'>
				<div>
					<TabBar tabs={[errorTxt, searchTxt]} let:tab bind:active>
						<Tab {tab} minWidth
								 onChange:
						>
							<Label>{tab}</Label>
						</Tab>
					</TabBar>

					<div class='mdc-typography--body1'>
						{#if active === errorTxt}
							<Card>
								<DataTable />
							</Card>
						{:else if active === searchTxt}
							<p>Search data list </p>
						{/if}
					</div>
				</div>
			</section>
		</SplitPane>
	</div>
</div>


<style>
    .outer {
				/* the commented stuff results in a beautifulle positioned page, but then the drawer does not work anymore.
				 Maybe these divs need to be surrounding the drawer as well??? */
        /*position: fixed;*/
        /*top: 48px;*/
        /*left: 0px;*/
        /*bottom: 50px;*/
        /*right: 0px;*/
        /*width: 100%;*/
        /*height: calc(100% - 48px - 20px);*/
        display: flex;
        flex-grow : 1;
        /*flex-flow: column;*/
        /*height: 100%;*/
    }

    .inner {
        /*padding: 10px;*/
        /*height: 100%;*/
        display: flex;
        /*background-color: #DDDDDD;*/
        flex-grow : 1;
    }
</style>
