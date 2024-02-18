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
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [query, setQuery] = useState<null | string>(null);
    const {addTable, tables} = useTablesStore();
    const [data, setData] = useState(null);

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
            setData(alasql(`SELECT * FROM categories`))
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
                                {Object.keys(data[0]).map(key => (
                                    <TableHead key={key}>{key}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(({categoryID, categoryName, description, picture}) => (
                                <TableRow key={categoryID}>
                                    <TableCell className="font-medium">{categoryID}</TableCell>
                                    <TableCell className="text-left">{categoryName}</TableCell>
                                    <TableCell className="text-left">{description}</TableCell>
                                    <TableCell className="text-right">{picture}</TableCell>
                                </TableRow>
                            ))}
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
