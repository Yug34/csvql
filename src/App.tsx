import './App.css'
import {useEffect, useState} from "react";
import alasql from "alasql";
import {DATA_FILES} from "./constants.ts";
import {Button} from "@/components/ui/button.tsx";
import {useTablesStore} from "@/store/tablesStore.ts";
import {ResultsDataTable} from "@/components/ResultsDataTable.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {useAlasqlStore} from "@/store/alasqlStore.ts";
import {SQLEditor} from "@/components/SQLEditor.tsx";

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {addTable, tables} = useTablesStore();
    const {query, setQuery} = useAlasqlStore();
    const [data, setData] = useState<Record<string, string>[] | null>(null);

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
            const query = `SELECT * FROM employees`;
            setQuery(query);
            setData(alasql(query));
        });
    }, []);

    return (
        <div>
            {isLoaded ? (
                <>
                    <SQLEditor/>
                    {tables.map((tab) => (
                        <div key={tab}>{tab}</div>
                    ))}
                    <Button onClick={() => {
                        console.log(alasql(`SELECT * FROM categories`))
                    }}>
                        categories
                    </Button>
                    <Button onClick={() => {
                        console.log(alasql(`SELECT * FROM products`))
                    }}>
                        products
                    </Button>
                    <Button onClick={() => {
                        console.log(alasql(`SELECT t.territoryDescription
                                    FROM territories t
                                    JOIN employee_territories et ON t.territoryID = et.territoryID
                                    WHERE et.employeeID = 2;
                                    `))
                    }}>
                        join query
                    </Button>
                    <ResultsDataTable
                        columns={Object.keys(data![0]).map(key => ({
                            accessorKey: key,
                            header: key,
                        }))}
                        data={data!}
                    />
                </>
            ) : (
                <div>Not yet Loaded</div>
            )}
            <Toaster />
        </div>
    )
}

export default App
