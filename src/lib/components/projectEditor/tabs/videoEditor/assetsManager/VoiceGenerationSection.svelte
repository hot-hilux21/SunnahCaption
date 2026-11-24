<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import LL from '$lib/i18n/i18n-svelte';
	import { get } from 'svelte/store';
	import { globalState } from '$lib/runes/main.svelte';
	import Settings from '$lib/classes/Settings.svelte';
	import { ProjectService } from '$lib/services/ProjectService';
	import { SourceType } from '$lib/classes/enums';
	import toast from 'svelte-5-french-toast';

	let text = $state('');
	let isGenerating = $state(false);

	async function generateVoice(): Promise<void> {
		if (isGenerating || !text.trim()) return;
		const project = globalState.currentProject;
		if (!project) {
			toast.error(get(LL).common.sorryErrorMessage());
			return;
		}

		const settings = globalState.settings?.voiceApiSettings;
		if (!settings) {
			toast.error(get(LL).common.sorryErrorMessage());
			return;
		}

		isGenerating = true;
		try {
			const assetFolder = await ProjectService.getAssetFolderForProject(project.detail.id);
			const fileName = `voice-${crypto.randomUUID()}.mp3`;
			const outputPath = `${assetFolder}/${fileName}`;

			let result: string;
			if (settings.provider === 'free') {
				result = await invoke<string>('generate_free_arabic_tts', {
					text: text.trim(),
					outputPath,
					language: settings.language
				});
			} else {
				if (!settings.apiKey.trim() || !settings.voiceId.trim()) {
					toast.error(get(LL).common.sorryErrorMessage());
					return;
				}
				result = await invoke<string>('generate_elevenlabs_tts', {
					request: {
						text: text.trim(),
						voiceId: settings.voiceId.trim(),
						apiKey: settings.apiKey.trim(),
						outputPath,
						modelId: settings.modelId
					}
				});
			}

			project.content.addAsset(result, undefined, SourceType.VoiceApi);
			toast.success(get(LL).settings.voiceGenerated());
			text = '';
		} catch (error) {
			console.error(error);
			toast.error(get(LL).common.sorryErrorMessage());
		} finally {
			isGenerating = false;
		}
	}
</script>

<section class="space-y-3">
	<div class="flex items-center gap-2 text-sm font-semibold text-primary">
		<span class="material-icons text-accent-primary text-base">record_voice_over</span>
		{get(LL).settings.voiceApi()}
	</div>
	<p class="text-xs text-thirdly">{get(LL).settings.freeVoiceApiHint()}</p>

	<textarea
		bind:value={text}
		placeholder={get(LL).common.enterTextHere()}
		class="w-full min-h-24 rounded-lg border border-color bg-secondary px-3 py-2 text-sm text-primary"
	></textarea>

	<button
		type="button"
		class="btn-accent flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
		onclick={generateVoice}
		disabled={isGenerating || !text.trim()}
	>
		<span class="material-icons text-lg">{isGenerating ? 'sync' : 'graphic_eq'}</span>
		{isGenerating ? get(LL).common.generating() : get(LL).settings.generateVoice()}
	</button>
</section>
PY