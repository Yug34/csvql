import './App.css'
import {useEffect, useState} from "react";
import alasql from "alasql";
import {DATA_FILES} from "./constants.ts";
import {useTablesStore} from "@/store/tablesStore.ts";
import {ResultsDataTable} from "@/components/ResultsDataTable.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {useAlasqlStore} from "@/store/alasqlStore.ts";
import {SQLEditor} from "@/components/SQLEditor.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import Navbar from "@/components/Navbar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "sonner";

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {addTable} = useTablesStore();
    const {query, setQuery, data, setData, setQueryError} = useAlasqlStore();

    const executeQuery = () => {
        alasql.promise(query)
            .then((data: Record<string, string>[]) => {
                if (data) {
                    setData(data);
                    setQueryError(null);
                    toast.success("Query executed!");
                }
            })
            .catch((err: {message: string}) => {
                toast.error(err.message);
            });
    }

    useEffect(() => {
        if (data !== null) {
            setIsLoaded(true);
        }
    }, [data]);

    useEffect(() => {
        Promise.all(DATA_FILES.map(async ({fileName, tableName}) => {
            const response = await fetch(`data/${fileName}`);
            const csvData = await response.text();
            await alasql.promise(`CREATE TABLE ${tableName}`);
            await alasql.promise(`INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`, [csvData]);
            addTable(tableName);
        })).then(() => {
            const query = `-- Enter SQL Query here:\nSELECT * FROM employees`;
            setQuery(query);
            setData(alasql(query));
        });
    }, []);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className={"w-screen h-screen flex flex-col overflow-x-hidden"}>
                <Navbar/>
                {isLoaded ? (
                    <div className={"p-4 flex flex-col gap-y-6 w-full h-full max-h-full max-w-full"}>
                        <Button onClick={executeQuery}>
                            Run query
                        </Button>

                        {/*<Button onClick={() => {*/}
                        {/*    console.log(alasql(`SELECT t.territoryDescription*/}
                        {/*                FROM territories t*/}
                        {/*                JOIN employee_territories et ON t.territoryID = et.territoryID*/}
                        {/*                WHERE et.employeeID = 2;*/}
                        {/*                `))*/}
                        {/*}}>*/}
                        {/*    join query*/}
                        {/*</Button>*/}

                        <div className={"w-1/2 h-1/2 max-w-[50%] max-h-[50%]"}>
                            <SQLEditor/>
                        </div>

                        <div className={"w-full h-1/2 max-h-[50%]"}>
                            <ResultsDataTable
                                columns={Object.keys(data![0]).map(key => ({
                                    accessorKey: key,
                                    header: key,
                                }))}
                                data={data!}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={"p-4 flex flex-col gap-y-6 w-full h-full max-h-full max-w-full"}>
                        Not yet Loaded
                    </div>
                )}
                <Toaster richColors />
            </div>
        </ThemeProvider>
    )
}

export default App
