<script lang='ts'>
	import Drawer, {
		AppContent,
		Header,
		Title,
		Subtitle
	} from '@smui/drawer';
	import { drawerOpen } from '../stores/DrawerStore';
	import { Content } from '@smui/card';
	import DrawerContent from '../components/DrawerContent.svelte';
	import Mainframe from '../components/Mainframe.svelte';
	// todo restrict height to 100vh
</script>

<div>
	<Drawer variant='dismissible' bind:open={$drawerOpen}>
		<Header>
			<Title>Super Drawer</Title>
			<Subtitle>It's the best drawer.</Subtitle>
		</Header>
		<Content>
			<DrawerContent />
		</Content>
	</Drawer>
	<AppContent>
		<Mainframe />
	</AppContent>
</div>
