<!-- LeftPanel is shown when the width of the viewport is small -->
<!-- It is shown to the left, when activated by the button on the AppBar -->
<!-- It shows menus that otherwise would be on the AppBar -->

<Sidepanel style="width: 100px;" bind:visible={$leftPanelVisible} disableScroll>
	<!-- icon  button to close the side panel -->
	<div class="logo">
		<Button
			icon
			color="inherit"
			on:click={() => {
				$leftPanelVisible = false;
			}}
		>
			<Icon> <svelte:component this={arrowBack}/> </Icon>
		</Button>
	</div>

	<!-- content of the side panel-->
	<MenuList />
</Sidepanel>

<script lang="ts">
	import {Button, Icon, Sidepanel} from 'svelte-mui';

	import arrowBack from '../assets/icons/svg/arrow_back.svg';
	import MenuList from "../menu/MenuList.svelte";
	import { leftPanelVisible } from "../WebappStore";
</script>

<style>
	.logo {
		height: var(--pi-header-height);
		padding: 0 4px;
		display: flex;
		align-items: center;
		color: var(--inverse-color);
		background: var(--bg-app-bar);
	}
	/*.side-panel{*/
	/*	width: 100px;*/
	/*}*/
</style>
