<!-- RightPanel shows a Panel that contains Help Info -->
<!-- It is shown to the right -->
<!-- It shows Help Info -->

<Sidepanel right bind:visible>
	<div class="logo" style="padding-left: 1rem;">Help</div>
	<p>
		<i style="padding: 12px;">Add some help info here ...</i>
	</p>
</Sidepanel>

<script>
	export let visible = false;

	import { Sidepanel } from 'svelte-mui';
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
</style>
