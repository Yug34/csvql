import './App.css'
import {useEffect, useState} from "react";
import alasql from "alasql";
import {DATA_FILES} from "./constants.ts";
import {Button} from "@/components/ui/button.tsx";
import {useTablesStore} from "@/store/tablesStore.ts";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import uniqid from "uniqid";

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [query, setQuery] = useState<null | string>(null);
    const {addTable, tables} = useTablesStore();
    const [data, setData] = useState<Record<string, string>[] | null>(null);

    useEffect(() => {
        Promise.all(DATA_FILES.map(async ({fileName, tableName}) => {
            const response = await fetch(`data/${fileName}`);
            const csvData = await response.text();
            await alasql.promise(`CREATE TABLE ${tableName}`);
            await alasql.promise(`INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`, [csvData]);
            addTable(tableName);
        })).then(() => {
            setIsLoaded(true)
            // setQuery(`SELECT * FROM categories`)
            setData(alasql(`SELECT * FROM employees`));
        });
    }, []);

    return (
        <div>
            {isLoaded ? (
                <>
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
                    <Table>
                        <TableCaption>{query}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                {Object.keys(data![0]).map(key => (
                                    <TableHead key={key}>{key}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data!.map((row: Record<string, string>) => {
                                const id = uniqid();
                                return (
                                    <TableRow key={id}>
                                        {Object.keys(row).map((key) => (
                                            <TableCell key={id+key} className="text-left">{row[key]}</TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </>
            ) : (
                <div>Not yet Loaded</div>
            )}
        </div>
    )
}

export default App
