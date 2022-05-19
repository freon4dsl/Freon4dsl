<script lang='ts'>
	import Drawer, {
		AppContent,
		Header,
		Title
	} from "@smui/drawer";
	import { drawerOpen } from "../stores/DrawerStore";
	import { Content } from "@smui/card";
	import IconButton, { Label, Icon } from "@smui/button";
	import { mdiExclamation, mdiCheckCircle } from "@mdi/js";
	import { Svg } from "@smui/common/elements";
	import Banner from "@smui/banner";
	import { currentModelName } from "../stores/ModelStore";
	import { userMessage, userMessageOpen } from "../stores/UserMessageStore";
	import ModelInfo from "../components/menus/ModelInfo.svelte";
	import SplitPane from "../components/SplitPane.svelte";
	import EditorPart from "../components/editor-panel/EditorPart.svelte";
	import InfoPanel from "../components/info-panel/InfoPanel.svelte";
	// todo restrict height to 100vh
</script>

<div>
	<Drawer variant='dismissible' bind:open={$drawerOpen}>
		<Header>
			<Title>{$currentModelName}</Title>
		</Header>
		<Content>
			<ModelInfo />
		</Content>
	</Drawer>
	<AppContent>
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
							<InfoPanel />
						</div>
					</section>
				</SplitPane>
			</div>
		</div>
	</AppContent>
</div>

<style>
	.outer {
		/* the commented stuff results in a beautifully positioned page, but then the drawer does not work anymore.
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
