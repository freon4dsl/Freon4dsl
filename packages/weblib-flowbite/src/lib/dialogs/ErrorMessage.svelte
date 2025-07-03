<script lang="ts">
	import { messageInfo, userMessageOpen } from "$lib";
	import { Modal } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
</script>

<Modal bind:open={userMessageOpen.value} autoclose={false} class="w-full bg-light-accent-100 dark:bg-dark-accent-800">
	<h3 class="mb-4 text-xl font-medium text-light-accent-900 dark:text-dark-accent-50">{messageInfo.severity}</h3>
	<div role="alert" class="text-sm rounded-lg flex items-center p-1 m-2 gap-1 bg-light-accent-600 dark:bg-dark-accent-200 text-light-accent-50 dark:text-dark-accent-900">
		<InfoCircleSolid class="w-5 h-5"/>
		<div>{messageInfo.userMessage}</div>
	</div>
</Modal>
