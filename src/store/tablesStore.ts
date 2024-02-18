import {create} from 'zustand'

interface TablesStore {
    tables: string[];
    setTables: (newTables: string[]) => void;
    addTable: (newTable: string) => void;
}

export const useTablesStore = create<TablesStore>()((set) => ({
    tables: [],
    setTables: (newTables: string[]) => set(() => ({tables: newTables})),
    addTable: (newTable: string) => set((state) => ({
        tables: [...state.tables, newTable]
    })),
}));