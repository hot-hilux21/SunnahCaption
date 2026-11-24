<script lang="ts">
	import Settings from '$lib/classes/Settings.svelte';
	import LL from '$lib/i18n/i18n-svelte';
	import { globalState } from '$lib/runes/main.svelte';
	import { openUrl } from '@tauri-apps/plugin-opener';

	function persistSettings(): void {
		void Settings.save();
	}
</script>

<div class="space-y-5">
	<div>
		<h3 class="text-lg font-medium text-primary">{$LL.settings.voiceApi()}</h3>
		<p class="mt-1 text-sm text-thirdly">
			{$LL.settings.freeVoiceApiHint()}
		</p>
	</div>

	<div class="rounded-xl border border-color bg-primary p-4 space-y-4">
		<label class="space-y-2 block">
			<span class="text-sm font-medium text-secondary">{$LL.settings.voiceApiKey()}</span>
			<input
				type="password"
				bind:value={globalState.settings!.voiceApiSettings.apiKey}
				onblur={persistSettings}
				placeholder="ElevenLabs API key"
				class="w-full rounded-lg border border-color bg-secondary px-3 py-2 text-sm text-primary"
			/>
			<p class="text-xs text-thirdly">
				{$LL.settings.providerApiKey()}
				<button
					type="button"
					class="text-[var(--accent-primary)] hover:underline ms-1"
					onclick={() => openUrl('https://elevenlabs.io/app/settings/api-keys')}
				>
					elevenlabs.io
				</button>
			</p>
		</label>

		<label class="space-y-2 block">
			<span class="text-sm font-medium text-secondary">{$LL.settings.voiceId()}</span>
			<input
				type="text"
				bind:value={globalState.settings!.voiceApiSettings.voiceId}
				onblur={persistSettings}
				placeholder="Voice ID"
				class="w-full rounded-lg border border-color bg-secondary px-3 py-2 text-sm text-primary"
			/>
		</label>

		<label class="space-y-2 block">
			<span class="text-sm font-medium text-secondary">{$LL.settings.voiceModel()}</span>
			<select
				bind:value={globalState.settings!.voiceApiSettings.modelId}
				onchange={persistSettings}
				class="w-full rounded-lg border border-color bg-secondary px-3 py-2 text-sm text-primary"
			>
				<option value="eleven_multilingual_v2">ElevenLabs Multilingual v2</option>
				<option value="eleven_turbo_v2_5">ElevenLabs Turbo v2.5</option>
			</select>
		</label>

		<label class="space-y-2 block">
			<span class="text-sm font-medium text-secondary">{$LL.common.language()}</span>
			<select
				bind:value={globalState.settings!.voiceApiSettings.language}
				onchange={persistSettings}
				class="w-full rounded-lg border border-color bg-secondary px-3 py-2 text-sm text-primary"
			>
				<option value="ar">Arabic</option>
				<option value="en">English</option>
				<option value="fr">French</option>
			</select>
		</label>
	</div>
</div>
PY
