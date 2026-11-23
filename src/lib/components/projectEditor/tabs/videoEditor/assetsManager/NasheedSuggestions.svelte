<script lang="ts">
	import { openUrl } from '@tauri-apps/plugin-opener';
	import LL from '$lib/i18n/i18n-svelte';
	import { get } from 'svelte/store';

	type NasheedSuggestion = {
		title: string;
		artist: string;
		query: string;
	};

	const suggestions: NasheedSuggestion[] = [
		{ title: 'Ya Ilahi (Vocals Only)', artist: 'Muad', query: 'Muad Ya Ilahi vocals only nasheed' },
		{ title: 'Ya Nabi Salam Alayka (Arabic)', artist: 'Maher Zain', query: 'Maher Zain Ya Nabi Salam Alayka Arabic vocals only' },
		{ title: 'Shukran Laka Rabbi (No Music)', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir Shukran Laka Rabbi no music' },
		{ title: 'Ana Al\'abdu Nashid', artist: 'Mishary Alafasy', query: 'Mishary Alafasy Ana Al abdu nasheed' },
		{ title: 'La Ilaha Illa Allah', artist: 'Mishary Alafasy', query: 'Mishary Alafasy La Ilaha Illa Allah nasheed' },
		{ title: 'Rahman', artist: 'Mishary Alafasy', query: 'Mishary Alafasy Rahman nasheed' },
		{ title: 'Ahbabtuk', artist: 'Mishary Alafasy', query: 'Mishary Alafasy Ahbabtuk nasheed' },
		{ title: 'La Illah Illa Allah', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir La Illah Illa Allah nasheed' },
		{ title: 'Ya Adheeman', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir Ya Adheeman nasheed' },
		{ title: 'Zayed Al wafa', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir Zayed Al wafa nasheed' },
		{ title: 'Ya Akhi', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir Ya Akhi nasheed' },
		{ title: 'Dunia Albashar', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir Dunia Albashar nasheed' },
		{ title: 'Noori', artist: 'Ahmed Bukhatir', query: 'Ahmed Bukhatir Noori nasheed' },
		{ title: 'Qamarun Qamarun', artist: 'Mohamed Tarek', query: 'Qamarun Qamarun Ya Nabi Salam Alayka Mohamed Tarek' }
	];

	async function openSuggestion(suggestion: NasheedSuggestion) {
		await openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion.query)}`);
	}
</script>

<section class="space-y-2">
	<div class="flex items-center gap-2 text-sm font-semibold text-primary">
		<span class="material-icons text-accent-primary text-base">library_music</span>
		{get(LL).editor.downloadFromSocialMedia()}
	</div>
	<p class="text-xs text-thirdly">
		{get(LL).editor.supportedLinksHint()}
	</p>
	<div class="space-y-2">
		{#each suggestions as suggestion (suggestion.title + suggestion.artist)}
			<div class="flex items-center justify-between gap-3 rounded-lg border border-color bg-bg-secondary px-3 py-2">
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-primary">{suggestion.title}</p>
					<p class="truncate text-xs text-thirdly">{suggestion.artist}</p>
				</div>
				<button
					class="btn flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs"
					type="button"
					onclick={() => openSuggestion(suggestion)}
				>
					<span class="material-icons text-sm">open_in_new</span>
					{get(LL).common.download()}
				</button>
			</div>
		{/each}
	</div>
</section>
PY