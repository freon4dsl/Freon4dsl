<script lang='ts'>
	import Drawer, {
		AppContent,
		Header,
		Title,
		Subtitle
	} from "@smui/drawer";
	import { drawerOpen } from "../stores/DrawerStore";
	import { Content } from "@smui/card";
	import Mainframe from "../components/Mainframe.svelte";
	import ModelInfo from "../components/menus/ModelInfo.svelte";
	import { currentModelName } from "../stores/ModelStore";
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
		<Mainframe />
	</AppContent>
</div>
