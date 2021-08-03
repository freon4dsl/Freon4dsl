<!-- RightPanel shows a Panel that contains Help Info -->
<!-- It is shown to the right -->
<!-- It shows Help Info -->

<Sidepanel right bind:visible>
	<!-- icon  button to close the side panel -->
	<div class="logo">
		<Button
				icon
				color="inherit"
				on:click={() => {
				visible = false;
			}}
		>
			<Icon style="color:var(--inverse-color)" path={arrowForward} />
		</Button>
	</div>
	<p>
		<a id="brand" class="icon" target="_blank" href="http://www.projectit.org">
			<!-- compiled svg does not work, because the path is too complex-->
			<!--			<Icon>-->
			<!--				<svelte:component this={projectit_logo} />-->
			<!--			</Icon>-->
			{#if $theme === 'light'}
				<img src="/img/projectit-logo-inverse-colors.png" alt="ProjectIt Logo">
			{:else if ($theme === 'dark')}
				<img src="/img/projectit-logo.png" alt="ProjectIt Logo">
			{/if}
		</a>
		<br>
		<i style="padding: 12px;">Add some help info here ...</i>
	</p>
</Sidepanel>

<script lang="ts">
	import {Button, Icon, Sidepanel} from 'svelte-mui';
	import {arrowForward} from '../assets/icons';
	import { rightPanelVisible, theme } from "../WebappStore";
	let visible = $rightPanelVisible;
</script>

<style>
	.logo {
		height: var(--pi-header-height);
		padding: 0 4px;
		display: flex;
		align-items: center;
		color: var(--color);
		background: var(--bg-app-bar);
	}
	img{
		max-width: 180px;
		max-height: calc(var(--pi-header-height) - 5px);
		margin-top: 3px;
		margin-bottom: 3px;
		margin-left: auto;
		margin-right: 10px;
	}
</style>
