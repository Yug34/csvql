import {create} from 'zustand'

interface QueryMetadataStore {
    previousQueries: string[];
    setPreviousQueries: (queries: string[]) => void;
    addPreviousQueries: (query: string) => void;
    queryExecutionTime: number | null;
    setQueryExecutionTime: (time: number) => void;
}

export const useQueryMetadataStore = create<QueryMetadataStore>()((set) => ({
    previousQueries: [],
    setPreviousQueries: (queries: string[]) => set(() => ({previousQueries: queries})),
    addPreviousQueries: (query: string) => set((state) => ({
        previousQueries: [...state.previousQueries, query]
    })),
    queryExecutionTime: null,
    setQueryExecutionTime: (time: number) => set(() => ({queryExecutionTime: time}))
}));