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
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {roundNumber, stripQueryOfComments} from "@/lib/utils.ts";
import {Separator} from "@/components/ui/separator.tsx";
import {DownloadIcon, Loader2, PlayIcon, UploadIcon} from "lucide-react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import CSVUpload from "@/components/CSVUpload.tsx";

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
    const toggleDialog = () => {
        setIsUploadDialogOpen(prevState => !prevState)
    };

    const [isPrevQuerySheetOpen, setIsPrevQuerySheetOpen] = useState<boolean>(false);
    const togglePrevQuerySheet = () => {
        setIsPrevQuerySheetOpen(prevState => !prevState)
    };

    const [isSampleQuerySheetOpen, setIsSampleQuerySheetOpen] = useState<boolean>(false);
    const toggleSampleQuerySheet = () => {
        setIsSampleQuerySheetOpen(prevState => !prevState)
    };

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

        if (queryToRun) {
            setQuery(queryToRun); // Sync query to the editor
        }

        alasql.promise(queryToRun ?? query)
            .then((data: Record<string, string>[]) => {
                console.log("this ran")
                if (data) {
                    if (data.length === 0) {
                        toast.error(`The query ran and returned nothing, are you sure the query was correct?`);
                    } else {
                        console.log("this ran too")
                        setData(data);
                        setQueryError(null);
                        toast.success(`Query executed! ${data.length ?? 0} rows returned in ${queryExecutionTime}ms!`);
                        addPreviousQueries(queryToRun ?? query!);
                        let endTime = performance.now()
                        let timeElapsed = endTime - startTime;
                        setQueryExecutionTime(roundNumber(timeElapsed));
                    }
                }
            })
            .catch((err: { message: string }) => {
                console.log("this ran three")
                toast.error(err.message);
            });
    }

    const exportDataToCSV = () => {
        alasql.promise('SELECT * INTO CSV("output.csv", {headers:false}) FROM ?', [data])
            .then(() => {
                toast.success("Data downloaded as CSV!");
            })
            .catch((err) => {
                toast.error("Error saving data: ", err);
            });
    }

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
            setIsLoaded(true);
        });
    }, []);

    const SampleQueriesList = () => {
        return (
            <>
                {SAMPLE_QUERIES.map(({query, queryName}) => (
                    <ScrollArea key={queryName}>
                        <Card className={"p-2"}>
                            <div
                                className={"flex w-full items-center font-semibold justify-between"}>
                                <div className={"text-sm"}>
                                    {queryName}
                                </div>
                                <Button
                                    variant={"outline"}
                                    className={"p-2"}
                                    onClick={() => {
                                        setIsSampleQuerySheetOpen(false);
                                        executeQuery(query)
                                    }}
                                >
                                    <PlayIcon className={"ml-1"} size={"1.25rem"}/>
                                </Button>
                            </div>
                            <Separator className={"my-2"}/>
                            <code className={"text-xs"}>{query}</code>
                        </Card>
                    </ScrollArea>
                ))}
            </>
        )
    }

    const PreviousQueriesList = () => {
        return (
            <>
                {previousQueries.length === 0 ? (
                    <>Nothing to see here! Please run a query to see it in history.</>
                ) : (
                    <>
                        {previousQueries.map(query => (
                            <div className={"flex justify-between items-center border rounded-md p-2"} key={query}>
                                <code className={"text-xs"}>{stripQueryOfComments(query)}</code>
                                <Button
                                    variant={"outline"}
                                    className={"p-2"}
                                    onClick={() => {
                                        setIsPrevQuerySheetOpen(false);
                                        executeQuery(query)
                                    }}
                                >
                                    <PlayIcon className={"ml-1"} size={"1.25rem"}/>
                                </Button>
                            </div>
                        ))}
                    </>
                )}
            </>
        )
    }

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className={"w-screen h-screen flex flex-col max-w-screen max-h-screen overflow-x-hidden"}>
                <Navbar/>
                {isLoaded ? (
                    <div className={"p-4 flex gap-x-4 w-full h-full max-h-full max-w-full"}>
                        <div className={"hidden w-1/5 max-w-1/5 xl:flex flex-col"}>
                            <Card className={"h-1/2 rounded-b-none"}>
                                <CardHeader>
                                    <CardTitle>Sample Queries</CardTitle>
                                    <CardDescription>Click to execute</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SampleQueriesList/>
                                </CardContent>
                            </Card>
                            <Card className={"h-1/2 min-h-1/2 border-t-0 rounded-t-none"}>
                                <ScrollArea className={"max-h-full"}>
                                    <CardHeader>
                                        <CardTitle>Previous Queries</CardTitle>
                                        <CardDescription>Click to execute</CardDescription>
                                    </CardHeader>
                                    <CardContent className={"flex flex-col gap-y-2"}>
                                        <PreviousQueriesList/>
                                    </CardContent>
                                    <ScrollBar/>
                                </ScrollArea>
                            </Card>
                        </div>

                        <div className={"w-full max-w-full xl:w-4/5 xl:max-w-4/5 flex flex-col gap-y-6"}>
                            <Button onClick={() => executeQuery()}>Run query</Button>
                            <div className={"flex w-full xl:hidden"}>
                                <Sheet open={isSampleQuerySheetOpen} onOpenChange={toggleSampleQuerySheet}>
                                    <SheetTrigger className={"w-full"}>
                                        <Button className={"w-full rounded-r-none"}>
                                            View sample queries
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side={"left"}>
                                        <SheetHeader>
                                            <SheetTitle>Sample Queries</SheetTitle>
                                            <SheetDescription>
                                                Click to execute
                                            </SheetDescription>
                                        </SheetHeader>
                                        <Card className={"mt-4"}>
                                            <CardContent className={"p-4 max-h-52 flex flex-col gap-y-2"}>
                                                <SampleQueriesList/>
                                            </CardContent>
                                        </Card>
                                    </SheetContent>
                                </Sheet>
                                <Sheet open={isPrevQuerySheetOpen} onOpenChange={togglePrevQuerySheet}>
                                    <SheetTrigger className={"w-full"}>
                                        <Button variant={"outline"} className={"w-full rounded-l-none"}>
                                            View previous queries
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side={"left"}>
                                        <SheetHeader>
                                            <SheetTitle>Previous Queries</SheetTitle>
                                            <SheetDescription>
                                                Click to execute
                                            </SheetDescription>
                                        </SheetHeader>
                                        <Card className={"mt-4"}>
                                            <ScrollArea className={"max-h-full"}>
                                                <CardContent className={"p-4 max-h-52 flex flex-col gap-y-2"}>
                                                    <PreviousQueriesList/>
                                                </CardContent>
                                                <ScrollBar/>
                                            </ScrollArea>
                                        </Card>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            {/*<div className={"flex flex-row w-full h-1/2 max-h-[50%] gap-x-6"}>*/}
                                <SQLEditor/>
                            {/*</div>*/}

                            <div className={"flex w-full"}>
                                <Dialog open={isUploadDialogOpen} onOpenChange={toggleDialog}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className={"w-full rounded-r-none flex gap-x-2"}
                                            variant="outline"
                                        >
                                            Import Data
                                            <UploadIcon size={"1.25rem"}/>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="p-0 border-none">
                                        <CSVUpload setIsUploadDialogOpen={setIsUploadDialogOpen}/>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className={"flex gap-x-2 w-full rounded-l-none"}
                                    onClick={exportDataToCSV}
                                >
                                    Export Data as CSV
                                    <DownloadIcon size={"1.25rem"}/>
                                </Button>
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
                    <div className={"flex flex-col w-full h-full items-center justify-center"}>
                        <Card>
                            <CardContent className={"p-4 flex items-center gap-x-4"}>
                                Fetching data, populating local database
                                <Loader2 className={"animate-spin"}/>
                            </CardContent>
                        </Card>
                    </div>
                )}
                <Toaster richColors/>
            </div>
        </ThemeProvider>
    );
}

export default App;