import {create} from 'zustand'

interface AlaSQLStore {
    query: null | string;
    setQuery: (query: string) => void;
    data: Record<string, string>[] | null;
    setData: (data: Record<string, string>[]) => void;
    queryError: string | null;
    setQueryError: (err: string | null) => void;
    previousQueries: string[];
    setPreviousQueries: (queries: string[]) => void;
    addPreviousQueries: (query: string) => void;
}

export const useAlasqlStore = create<AlaSQLStore>()((set) => ({
    query: null,
    setQuery: (query: string) => set(() => ({query: query})),
    data: null,
    setData: (data: Record<string, string>[]) => set(() => ({data: data})),
    queryError: null,
    setQueryError: (err: string | null) => set(() => ({queryError: err})),
    previousQueries: ["SELECT * FROM employees"],
    setPreviousQueries: (queries: string[]) => set(() => ({previousQueries: queries})),
    addPreviousQueries: (query: string) => set((state) => ({
        previousQueries: [...state.previousQueries, query]
    })),
}));