<!-- LeftPanel is shown when the width of the viewport is small -->
<!-- It is shown to the left, when activated by the button on the AppBar -->
<!-- It shows menus that otherwise would be on the AppBar -->

<Sidepanel style="width: 100px;" bind:visible disableScroll>
	<!-- icon  button to close the side panel -->
	<div class="logo">
		<Button
			icon
			color="inherit"
			on:click={() => {
				visible = false;
			}}
		>
			<Icon path={arrowBack} />
		</Button>
	</div>

	<!-- content of the side panel-->
	<MenuList />
</Sidepanel>

<script>
	import {Button, Icon, Sidepanel} from 'svelte-mui';

	import {arrowBack} from '../../webapp/assets/icons';
	import MenuList from "../menu/MenuList.svelte";

	export let visible = false;
</script>

<style>
	.logo {
		height: var(--pi-header-height);
		padding: 0 4px;
		display: flex;
		align-items: center;
		color: #fff;
		background: var(--bg-app-bar);
	}
	/*.side-panel{*/
	/*	width: 100px;*/
	/*}*/
</style>
