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

import {
    Card,
    CardContent,
    CardDescription, CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {roundNumber} from "@/lib/utils.ts";
import {Separator} from "@/components/ui/separator.tsx";
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table.tsx";
import {DownloadIcon} from "lucide-react";

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {addTable} = useTablesStore();
    const {
        query,
        setQuery,
        data,
        setData,
        setQueryError,
        addPreviousQueries,
        previousQueries,
        queryExecutionTime,
        setQueryExecutionTime
    } = useAlasqlStore();

    const executeQuery = () => {
        let startTime = performance.now();
        alasql.promise(query)
            .then((data: Record<string, string>[]) => {
                if (data) {
                    setData(data);
                    setQueryError(null);
                    toast.success("Query executed!");
                    addPreviousQueries(query!);
                    let endTime = performance.now()
                    let timeElapsed = endTime - startTime;
                    setQueryExecutionTime(roundNumber(timeElapsed));
                }
            })
            .catch((err: { message: string }) => {
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
            let startTime = performance.now();
            const query = `-- Enter SQL Query here:\nSELECT * FROM employees`;
            setQuery(query);
            setData(alasql(query));
            let endTime = performance.now()
            let timeElapsed = endTime - startTime;
            setQueryExecutionTime(roundNumber(timeElapsed));
        });
    }, []);

    {/*<Button onClick={() => {*/
    }
    {/*    console.log(alasql(`SELECT t.territoryDescription*/
    }
    {/*                FROM territories t*/
    }
    {/*                JOIN employee_territories et ON t.territoryID = et.territoryID*/
    }
    {/*                WHERE et.employeeID = 2;*/
    }
    {/*                `))*/
    }
    {/*}}>*/
    }
    {/*    join query*/
    }
    {/*</Button>*/
    }

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className={"w-screen h-screen flex flex-col max-w-screen max-h-screen overflow-x-hidden"}>
                <Navbar/>
                {isLoaded ? (
                    <div className={"p-4 flex gap-x-4 w-full h-full max-h-full max-w-full"}>
                        <Card className={"w-1/6 max-w-1/6"}>
                            <CardHeader>
                                <CardTitle>Previous Queries</CardTitle>
                                <CardDescription>Click to execute</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {previousQueries.map(query => <code key={query}>{query}</code>)}
                            </CardContent>
                        </Card>
                        <div className={"w-5/6 max-w-5/6 flex flex-col gap-y-6"}>
                            <Button onClick={executeQuery}>Run query</Button>

                            <div className={"flex w-full h-1/2 max-h-[50%] gap-x-6"}>
                                <SQLEditor/>
                                <Card className={"w-1/2"}>
                                    <CardHeader className={"flex justify-center p-0 pl-4 h-10"}>
                                        <CardTitle>Query Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent className={"p-0 flex flex-col justify-between h-fit"}>
                                        <Table className={"p-4"}>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Execution time</TableCell>
                                                    <TableCell>{queryExecutionTime ?? 0}ms</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Rows returned</TableCell>
                                                    <TableCell>{data?.length ?? 0}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        <div>
                                            <Button className={"w-full rounded-none"} variant="outline">Cancel</Button>
                                            <Button className={"flex gap-x-2 w-full rounded-none rounded-b-lg"} onClick={() => {
                                                alasql.promise('SELECT * INTO CSV("output.csv", {headers:false}) FROM ?', [data])
                                                    .then(() => {
                                                        toast.success("Data downloaded as CSV!");
                                                    }).catch((err) => {
                                                    toast.error("Error saving data: ", err);
                                                });
                                            }}>
                                                Export Data as CSV
                                                <DownloadIcon size={"1.25rem"}/>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
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
                    </div>
                ) : (
                    <div className={"p-4 flex flex-col gap-y-6 w-full h-full max-h-full max-w-full"}>
                        Not yet Loaded
                    </div>
                )}
                <Toaster richColors/>
            </div>
        </ThemeProvider>
    );
}

export default App
