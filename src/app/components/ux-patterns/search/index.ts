/**
 * Global Search Pattern - Exports
 * 
 * Global search with categorized results and keyboard navigation.
 * 
 * @module UXPatterns/Search
 */

export { GlobalSearch } from './GlobalSearch';
export type {
  GlobalSearchProps,
  SearchResult,
  SearchResultType,
  SearchCategory
} from './GlobalSearch';

export { useGlobalSearch } from './useGlobalSearch';
export type {
  UseGlobalSearchOptions,
  UseGlobalSearchReturn
} from './useGlobalSearch';
