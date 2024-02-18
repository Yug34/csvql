import {create} from 'zustand'

interface AlaSQLStore {
    query: null | string;
    setQuery: (query: string) => void;
    data: Record<string, string>[] | null;
    setData: (data: Record<string, string>[]) => void;
}

export const useAlasqlStore = create<AlaSQLStore>()((set) => ({
    query: null,
    setQuery: (query: string) => set(() => ({query: query})),
    data: null,
    setData: (data: Record<string, string>[]) => set(() => ({data: data}))
}));