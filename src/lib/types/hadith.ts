/**
 * Normalized Hadith model and provider contracts for SunnahCaption.
 *
 * The model intentionally stays small and source-agnostic so additional Hadith
 * providers (for example sunnah.com) can be added without changing callers.
 */

export interface HadithReference {
	book?: number;
	hadith?: number;
}

export interface Hadith {
	/** Provider-specific collection/edition id, e.g. `eng-bukhari`. */
	collection: string;
	/** Display name of the collection, when available. */
	collectionName?: string;
	/** Hadith number in its collection. */
	number: number | string;
	/** Arabic numbering, when provided by the source. */
	arabicNumber?: number;
	/** Main Hadith text. */
	text: string;
	/** Optional grading information. */
	grades: string[];
	/** Optional section/book reference. */
	reference?: HadithReference;
	/** Attribution to the original source/API. */
	source: string;
}

export interface HadithCollection {
	/** Edition id used in provider requests, e.g. `eng-bukhari`. */
	id: string;
	/** Collection/book id, e.g. `bukhari`. */
	book: string;
	/** Human-readable collection name. */
	name: string;
	/** Language name reported by the provider. */
	language: string;
	/** Text direction reported by the provider. */
	direction: 'ltr' | 'rtl';
	/** Optional provider note. */
	comments?: string;
}

export interface HadithQuery {
	/** Edition id to load. */
	collection: string;
	/** Maximum number of Hadiths to return. */
	limit?: number;
	/** Number of Hadiths to skip. */
	offset?: number;
	/** Optional case-insensitive text filter. */
	search?: string;
}

export interface HadithProvider {
	/** Stable provider id. */
	readonly id: string;
	/** List available collections, optionally filtered by language. */
	getCollections(language?: string): Promise<HadithCollection[]>;
	/** Load Hadiths for one collection. */
	getHadiths(query: HadithQuery): Promise<Hadith[]>;
}
