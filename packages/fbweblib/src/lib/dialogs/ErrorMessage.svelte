<script lang="ts">
	import { messageInfo, userMessageOpen, WebappConfigurator } from "$lib";
	import { Alert, Button, Modal } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { fly } from 'svelte/transition';

	let alertCls: string = 'p-1 m-2 gap-1 bg-light-accent-600 dark:bg-dark-accent-200 text-light-accent-50 dark:text-dark-accent-900';
</script>

<Modal bind:open={userMessageOpen.value} autoclose={false} class="w-full bg-light-accent-100 dark:bg-dark-accent-800">
	<h3 class="mb-4 text-xl font-medium text-light-accent-900 dark:text-dark-accent-50">{messageInfo.severity}</h3>
	<Alert dismissable transition={fly} params={{ x: 200 }} class={alertCls}>
		<InfoCircleSolid slot="icon" class="w-5 h-5"/>
		{messageInfo.userMessage}
		<Button slot="close-button" size="xs"
						onclick={() => {userMessageOpen.value = !userMessageOpen.value; WebappConfigurator.getInstance().langEnv?.editor.selectionChanged()}}
						class="ms-auto dark:text-dark-accent-100 bg-light-accent-800 dark:bg-dark-accent-800"
		>
			Dismiss
		</Button>
	</Alert>
</Modal>
