<!-- LeftPanel is shown when the width of the viewport is small -->
<!-- It is shown to the left, when activated by the button on the AppBar -->
<!-- It shows menus that otherwise would be on the AppBar -->

<!-- It looks like it is impossible to styule the side-panel directly. -->
<!-- Therefore we introduce another <div> to surround it. Here the --bg-color parameter -->
<!-- of the side-panel is set. -->
<div class="panel">
<Sidepanel style="width: 100px; color: var(--theme-colors-color); background: var(--theme-colors-bg_color);" bind:visible={$leftPanelVisible} disableScroll>
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
	<hr>
	<Navigator />
</Sidepanel>
</div>

<script lang="ts">
	import { Button, Icon, Sidepanel } from "svelte-mui";

	import arrowBack from "../assets/icons/svg/arrow_back.svg";
	import MenuList from "../menu/MenuList.svelte";
	import { leftPanelVisible } from "../webapp-ts-utils/WebappStore";
	import Navigator from "../main/Navigator.svelte";
	import MenuGroup from "../menu/MenuGroup.svelte";
</script>

<style>
	.panel {
		--bg-color: var(--theme-colors-inverse_color);
	}
	.logo {
		height: var(--pi-header-height);
		padding: 0 4px;
		display: flex;
		align-items: center;
		color: var(--theme-colors-inverse_color);
		background: var(--theme-colors-bg_app_bar);
	}
</style>
