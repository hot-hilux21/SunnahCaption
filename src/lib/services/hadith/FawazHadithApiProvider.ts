import type {
	Hadith,
	HadithCollection,
	HadithProvider,
	HadithQuery
} from '$lib/types/hadith';

interface FawazEditionEntry {
	name: string;
	book: string;
	author?: string;
	language: string;
	has_sections?: boolean;
	direction?: string;
	comments?: string;
	link?: string;
	linkmin?: string;
}

interface FawazEditionsIndex {
	[book: string]: {
		name?: string;
		collection?: FawazEditionEntry[];
	};
}

interface FawazHadithItem {
	hadithnumber?: number | string;
	arabicnumber?: number;
	text?: string;
	grades?: unknown;
	reference?: {
		book?: number;
		hadith?: number;
	};
}

interface FawazEditionPayload {
	metadata?: {
		name?: string;
	};
	hadiths?: FawazHadithItem[];
}

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

/**
 * Hadith provider backed by the fawazahmed0/hadith-api CDN.
 *
 * The provider keeps an in-memory cache for the current session and falls back
 * from the pretty JSON file to the minified file when needed.
 */
export class FawazHadithApiProvider implements HadithProvider {
	readonly id = 'fawazahmed0';

	private collectionsCache: HadithCollection[] | null = null;
	private readonly hadithCache = new Map<string, Hadith[]>();

	/**
	 * List available editions, optionally filtered by language.
	 *
	 * @param language Optional language name, such as `English` or `Arabic`.
	 * @returns Available Hadith collections.
	 */
	async getCollections(language?: string): Promise<HadithCollection[]> {
		if (!this.collectionsCache) {
			const response = await fetch(`${BASE_URL}/editions.json`);
			if (!response.ok) {
				throw new Error(`Failed to load Hadith editions: ${response.status}`);
			}

			const index = (await response.json()) as FawazEditionsIndex;
			const collections: HadithCollection[] = [];

			for (const book of Object.keys(index)) {
				for (const entry of index[book]?.collection ?? []) {
					collections.push({
						id: entry.name,
						book: entry.book || book,
						name: entry.name.replace(/^[a-z]{3}-/i, '').replace(/^\w/, (char) => char.toUpperCase()),
						language: entry.language,
						direction: entry.direction === 'rtl' ? 'rtl' : 'ltr',
						comments: entry.comments
					});
				}
			}

			this.collectionsCache = collections;
		}

		if (!language) {
			return this.collectionsCache;
		}

		const normalizedLanguage = language.trim().toLowerCase();
		return this.collectionsCache.filter(
			(collection) => collection.language.toLowerCase() === normalizedLanguage
		);
	}

	/**
	 * Load Hadiths for one edition, with optional filtering and paging.
	 *
	 * @param query Collection and paging/filter options.
	 * @returns Normalized Hadiths.
	 */
	async getHadiths(query: HadithQuery): Promise<Hadith[]> {
		const cached = this.hadithCache.get(query.collection);
		let hadiths = cached;

		if (!hadiths) {
			const payload = await this.fetchEdition(query.collection);
			const collectionName = payload.metadata?.name ?? query.collection;

			hadiths = (payload.hadiths ?? []).map((item, index) => ({
				collection: query.collection,
				collectionName,
				number: item.hadithnumber ?? index + 1,
				arabicNumber: item.arabicnumber,
				text: item.text ?? '',
				grades: Array.isArray(item.grades)
					? item.grades.filter((grade): grade is string => typeof grade === 'string')
					: [],
				reference: item.reference,
				source: 'fawazahmed0/hadith-api'
			}));

			this.hadithCache.set(query.collection, hadiths);
		}

		let result = hadiths;
		if (query.search?.trim()) {
			const needle = query.search.trim().toLowerCase();
			result = result.filter((hadith) => hadith.text.toLowerCase().includes(needle));
		}

		const offset = Math.max(0, query.offset ?? 0);
		const limit = query.limit ?? result.length;
		return result.slice(offset, offset + Math.max(0, limit));
	}

	/**
	 * Fetch one edition, trying the readable JSON file first.
	 *
	 * @param collection Edition id.
	 * @returns Parsed edition payload.
	 */
	private async fetchEdition(collection: string): Promise<FawazEditionPayload> {
		const urls = [
			`${BASE_URL}/editions/${encodeURIComponent(collection)}.json`,
			`${BASE_URL}/editions/${encodeURIComponent(collection)}.min.json`
		];

		for (const url of urls) {
			const response = await fetch(url);
			if (response.ok) {
				return (await response.json()) as FawazEditionPayload;
			}
		}

		throw new Error(`Failed to load Hadith edition: ${collection}`);
	}
}
