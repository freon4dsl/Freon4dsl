<script lang='ts'>
	import List, { Item, Text } from '@smui/list';
	let drawer_active = 'Gray Kittens';

	function setActive(value: string) {
		drawer_active = value;
	}
</script>

<List>
	<Item
		href="javascript:void(0)"
		on:click={() => setActive('Gray Kittens')}
		activated={drawer_active === 'Gray Kittens'}
	>
		<Text>Gray Kittens</Text>
	</Item>
	<Item
		href="javascript:void(0)"
		on:click={() => setActive('A Space Rocket')}
		activated={drawer_active === 'A Space Rocket'}
	>
		<Text>A Space Rocket</Text>
	</Item>
	<Item
		href="javascript:void(0)"
		on:click={() => setActive('100 Pounds of Gravel')}
		activated={drawer_active === '100 Pounds of Gravel'}
	>
		<Text>100 Pounds of Gravel</Text>
	</Item>
	<Item
		href="javascript:void(0)"
		on:click={() => setActive('All of the Shrimp')}
		activated={drawer_active === 'All of the Shrimp'}
	>
		<Text>All of the Shrimp</Text>
	</Item>
	<Item
		href="javascript:void(0)"
		on:click={() => setActive('A Planet with a Mall')}
		activated={drawer_active === 'A Planet with a Mall'}
	>
		<Text>A Planet with a Mall</Text>
	</Item>
</List>
