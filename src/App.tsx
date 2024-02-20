import './App.css'
import {useEffect, useState} from "react";
import alasql from "alasql";
import {DATA_FILES, SAMPLE_QUERIES} from "./constants.ts";
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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {roundNumber, stripQueryOfComments} from "@/lib/utils.ts";
import {Separator} from "@/components/ui/separator.tsx";
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table.tsx";
import {DownloadIcon, PlayIcon, UploadIcon} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

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

    const executeQuery = (queryToRun?: string) => {
        let startTime = performance.now();

        alasql.promise(queryToRun ?? query)
            .then((data: Record<string, string>[]) => {
                if (data) {
                    setData(data);
                    setQueryError(null);
                    toast.success("Query executed!");
                    addPreviousQueries(queryToRun ?? query!);
                    let endTime = performance.now()
                    let timeElapsed = endTime - startTime;
                    setQueryExecutionTime(roundNumber(timeElapsed));
                }
            })
            .catch((err: { message: string }) => {
                toast.error(err.message);
            });

    }

    const exportDataToCSV = () => {
        alasql.promise('SELECT * INTO CSV("output.csv", {headers:false}) FROM ?', [data])
            .then(() => {
                toast.success("Data downloaded as CSV!");
            }).catch((err) => {
            toast.error("Error saving data: ", err);
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

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className={"w-screen h-screen flex flex-col max-w-screen max-h-screen overflow-x-hidden"}>
                <Navbar/>
                {isLoaded ? (
                    <div className={"p-4 flex gap-x-4 w-full h-full max-h-full max-w-full"}>
                        <div className={"w-1/5 max-w-1/5 flex flex-col"}>
                            <Card className={"h-1/2 rounded-b-none"}>
                                <CardHeader>
                                    <CardTitle>Sample Queries</CardTitle>
                                    <CardDescription>Click to execute</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {SAMPLE_QUERIES.map(({query, queryName}) => (
                                        <ScrollArea key={queryName}>
                                            <Card className={"p-2"}>
                                                <div className={"flex w-full font-semibold justify-between"}>
                                                    <div>{queryName}</div>
                                                    <PlayIcon className={"cursor-pointer"} size={"1.25rem"} onClick={() => executeQuery(query)}/>
                                                </div>
                                                <code className={"text-xs"}>{query}</code>
                                            </Card>
                                        </ScrollArea>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className={"h-1/2 border-t-0 rounded-t-none"}>
                                <CardHeader>
                                    <CardTitle>Previous Queries</CardTitle>
                                    <CardDescription>Click to execute</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {previousQueries.map(query => <code
                                        key={query}>{stripQueryOfComments(query)}</code>)}
                                </CardContent>
                            </Card>
                        </div>

                        <div className={"w-4/5 max-w-4/5 flex flex-col gap-y-6"}>
                            <Button onClick={() => executeQuery()}>Run query</Button>

                            <div className={"flex w-full h-1/2 max-h-[50%] gap-x-6"}>
                                <SQLEditor/>
                                <Card className={"w-1/2"}>
                                    <CardContent className={"p-0 flex flex-col justify-between h-full"}>
                                        <CardHeader className={"flex justify-center p-0"}>
                                            <CardTitle className={"p-4"}>Query Metadata</CardTitle>
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
                                            <Separator/>
                                        </CardHeader>
                                        <div>
                                            <Button className={"flex gap-x-2 w-full rounded-none"} variant="outline">
                                                Import Data
                                                <UploadIcon size={"1.25rem"}/>
                                            </Button>
                                            <Button className={"flex gap-x-2 w-full rounded-none rounded-b-lg"}
                                                    onClick={exportDataToCSV}>
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
