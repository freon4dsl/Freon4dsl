<!-- RightPanel shows a Panel that contains Help Info -->
<!-- It is shown to the right -->

<!-- It looks like it is impossible to styule the side-panel directly. -->
<!-- Therefore we introduce another <div> to surround it. Here the --bg-color parameter -->
<!-- of the side-panel is set. -->
<div class="panel">
<Sidepanel right bind:visible={$rightPanelVisible}>
	<!-- icon  button to close the side panel -->
	<div class="topbar">
			<a target="_blank" href="http://www.projectit.org">
				<!-- compiled svg does not work, because the path is too complex-->
				<img src="/img/projectit-logo-inverse-colors.png"  style="color:var(--theme-colors-color)" alt="ProjectIt Logo">
			</a>
<!--		<div class="inbetween"></div>-->
			<Button
					icon
					class="close-button"
					color="inherit"
					on:click={() => {
				$rightPanelVisible = false;
			}}
			>
				<Icon> <svelte:component this={arrowForward}/> </Icon>
			</Button>
	</div>
	<div class="title">Help for ProjectIt</div>

	<div class="content">
		Currently there is no in-build help functionality, other than a list of keybindings. We refer you to our website:
		<br>
		<div>
			<a href="http://www.projectit.org/" target="_blank">
				www.projectit.org
			</a>
		</div>
	</div>

	<hr>

	<div class="title">Keybindings</div>

	<ul class="keybinding">
		<li>Arrow Keys move in the expected direction</li>
		<li>TAB key moves to next place where the user can type something</li>
		<li>Ctrl-UP selects the parent element in the AST</li>
		<li>Ctrl-DOWN selects the first child element in the AST</li>
		<li>Ctrl-SPACE shows popup menu of possible options</li>
		<li>DEL deletes the next character or the currently selected item from the AST</li>
	</ul>

	<hr>
	<div class="title">About ProjectIt

	</div>

	<div class="content" >
		ProjectIt is an open source project which can be found at:
		<br>
		<div>
			<a href="https://github.com/projectit-org" target="_blank">
				https://github.com/projectit-org.
			</a>
		</div>
	</div>
	<hr>
	<div class="content">
		Version: <b>{versionNumber}</b>
	</div>
	<hr>
	<div class="content">
		Created by:
		<div >
			<a href="http://www.openmodeling.nl/" target="_blank">
				www.openmodeling.nl.
			</a>
		</div>
	</div>

</Sidepanel>
</div>

<script lang="ts">
	import {Button, Icon, Sidepanel} from 'svelte-mui';
	import arrowForward from '../assets/icons/svg/arrow_forward.svg';
	import { rightPanelVisible, versionNumber} from "../webapp-ts-utils/WebappStore";
</script>

<style>
	.panel {
		--bg-color: var(--theme-colors-inverse_color);
	}
	.topbar {
		height: var(--pi-header-height);
		padding: 0 4px;
		color: var(--theme-colors-inverse_color);
		background: var(--theme-colors-bg_app_bar);
		display: flex;
		justify-content: space-between;
	}
	img{
		max-width: 180px;
		max-height: calc(var(--pi-header-height) - 5px);
		margin-top: 3px;
		margin-bottom: 3px;
		margin-left: auto;
		margin-right: 10px;
	}
	.keybinding {
		color: var(--theme-colors-color);
	}
	.keybinding li {
		padding: 4px;
	}
	.content{
		color: var(--theme-colors-color);
		text-align: left;
		margin: auto;
		padding: 4px;
	}
	.title {
		color: var(--theme-colors-color);
		font-weight: bold;
		padding: 4px;
	}
	a{
		color: var(--theme-colors-color);
		text-decoration: underline;
		font-style: italic;
		vertical-align: middle;
	}

</style>
