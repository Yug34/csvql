import "./App.css";
import { useEffect, useState } from "react";
import alasql from "alasql";
import { DATA } from "./constants.ts";
import { useTablesStore } from "@/store/tablesStore.ts";
import ResultsDataTable from "@/components/ResultsDataTable";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useAlasqlStore } from "@/store/alasqlStore.ts";
import { SQLEditor } from "@/components/SQLEditor.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import Navbar from "@/components/Navbar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { roundNumber } from "@/lib/utils.ts";
import { DownloadIcon, Loader2, UploadIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area.tsx";
import CSVUpload from "@/components/CSVUpload";
import { useQueryMetadataStore } from "@/store/queryMetadataStore.ts";
import PreviousQueriesList from "@/components/PreviousQueries.tsx";
import SampleQueries from "@/components/SampleQueries.tsx";

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const toggleDialog = () => {
    setIsUploadDialogOpen((isOpen) => !isOpen);
  };

  const [isPrevQuerySheetOpen, setIsPrevQuerySheetOpen] =
    useState<boolean>(false);
  const togglePrevQuerySheet = () => {
    setIsPrevQuerySheetOpen((isOpen) => !isOpen);
  };

  const [isSampleQuerySheetOpen, setIsSampleQuerySheetOpen] =
    useState<boolean>(false);
  const toggleSampleQuerySheet = () => {
    setIsSampleQuerySheetOpen((isOpen) => !isOpen);
  };

  const { addTable } = useTablesStore();
  const { query, setQuery, data, setData, setQueryError } = useAlasqlStore();
  const { addPreviousQueries, queryExecutionTime, setQueryExecutionTime } =
    useQueryMetadataStore();

  const executeQuery = (queryToRun?: string) => {
    const startTime = performance.now();

    if (queryToRun) {
      setQuery(queryToRun); // Sync query with the editor
    }

    alasql
      .promise(queryToRun ?? query)
      .then((data: Record<string, string>[]) => {
        if (data) {
          if (data.length === 0) {
            toast.error(
              `The query result returned empty, are you sure the query was correct?`
            );
          } else {
            // Query successful!
            setData(data);
            setQueryError(null);
            toast.success(
              `Query executed! ${
                data.length ?? 0
              } rows returned in ${queryExecutionTime}ms!`
            );
            addPreviousQueries(queryToRun ?? query!);
            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            setQueryExecutionTime(roundNumber(timeElapsed));
          }
        }
      })
      .catch((err: { message: string }) => {
        toast.error(err.message);
      });
  };

  const exportDataToCSV = () => {
    alasql
      .promise('SELECT * INTO CSV("output.csv", {headers:false}) FROM ?', [
        data,
      ])
      .then(() => toast.success("Data downloaded as CSV!"))
      .catch((err) => toast.error("Error saving data: ", err));
  };

  useEffect(() => {
    // Fetch the CSV files from /public/data/<filePath>
    Promise.all(
      DATA.map(async ({ data, tableName }) => {
        // Create a table and insert the CSV file data into the table
        await alasql.promise(`CREATE TABLE ${tableName}`);
        await alasql.promise(
          `INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`,
          [data]
        );
        addTable(tableName);
      })
    ).then(() => {
      const startTime = performance.now();

      // select * from employees and display it in the Data Table, and measure query execution time.
      const query = `-- Enter SQL Query here:\nSELECT * FROM employees`;
      setQuery(query);
      setData(alasql(query));
      const endTime = performance.now();
      const timeElapsed = endTime - startTime;
      setQueryExecutionTime(roundNumber(timeElapsed));
      setIsLoaded(true);
    });
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div
        className={
          "w-screen h-screen flex flex-col max-w-screen max-h-screen overflow-x-hidden"
        }
      >
        <Navbar />
        {isLoaded ? (
          <div
            className={"p-4 flex gap-x-4 w-full h-full max-h-full max-w-full"}
          >
            <div className={"hidden w-1/5 max-w-1/5 xl:flex flex-col"}>
              <Card className={"h-1/2 rounded-b-none"}>
                <CardHeader>
                  <CardTitle>Sample Queries</CardTitle>
                  <CardDescription>Click to execute</CardDescription>
                </CardHeader>
                <CardContent>
                  <SampleQueries
                    executeQuery={executeQuery}
                    setIsSampleQuerySheetOpen={setIsSampleQuerySheetOpen}
                  />
                </CardContent>
              </Card>
              <Card className={"h-1/2 max-h-1/2 border-t-0 rounded-t-none"}>
                <ScrollArea className={"h-full"}>
                  <CardHeader>
                    <CardTitle>Previous Queries</CardTitle>
                    <CardDescription>Click to execute</CardDescription>
                  </CardHeader>
                  <CardContent className={"flex flex-col gap-y-2"}>
                    <PreviousQueriesList
                      executeQuery={executeQuery}
                      setIsPrevQuerySheetOpen={setIsPrevQuerySheetOpen}
                    />
                  </CardContent>
                  <ScrollBar />
                </ScrollArea>
              </Card>
            </div>

            <div
              className={
                "w-full max-w-full xl:w-4/5 xl:max-w-4/5 flex flex-col gap-y-6"
              }
            >
              <Button aria-label={"Run Query"} onClick={() => executeQuery()}>
                Run query
              </Button>
              <div className={"flex w-full xl:hidden"}>
                <Sheet
                  open={isSampleQuerySheetOpen}
                  onOpenChange={toggleSampleQuerySheet}
                >
                  <SheetTrigger className={"w-full"}>
                    <Button
                      aria-label={"View sample query list"}
                      className={"w-full rounded-r-none"}
                    >
                      View sample queries
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={"left"}>
                    <SheetHeader>
                      <SheetTitle>Sample Queries</SheetTitle>
                      <SheetDescription>Click to execute</SheetDescription>
                    </SheetHeader>
                    <Card className={"mt-4"}>
                      <CardContent
                        className={"p-4 max-h-52 flex flex-col gap-y-2"}
                      >
                        <SampleQueries
                          executeQuery={executeQuery}
                          setIsSampleQuerySheetOpen={setIsSampleQuerySheetOpen}
                        />
                      </CardContent>
                    </Card>
                  </SheetContent>
                </Sheet>

                <Sheet
                  open={isPrevQuerySheetOpen}
                  onOpenChange={togglePrevQuerySheet}
                >
                  <SheetTrigger className={"w-full"}>
                    <Button
                      aria-label={"View previous query list"}
                      variant={"outline"}
                      className={"w-full rounded-l-none"}
                    >
                      View previous queries
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={"left"}>
                    <SheetHeader>
                      <SheetTitle>Previous Queries</SheetTitle>
                      <SheetDescription>Click to execute</SheetDescription>
                    </SheetHeader>
                    <Card className={"mt-4"}>
                      <ScrollArea className={"max-h-full"}>
                        <CardContent
                          className={"p-4 max-h-52 flex flex-col gap-y-2"}
                        >
                          <PreviousQueriesList
                            executeQuery={executeQuery}
                            setIsPrevQuerySheetOpen={setIsPrevQuerySheetOpen}
                          />
                        </CardContent>
                        <ScrollBar />
                      </ScrollArea>
                    </Card>
                  </SheetContent>
                </Sheet>
              </div>

              <SQLEditor />

              <div className={"flex w-full"}>
                <Dialog open={isUploadDialogOpen} onOpenChange={toggleDialog}>
                  <DialogTrigger asChild>
                    <Button
                      aria-label={"Import data from CSV file"}
                      className={"w-full rounded-r-none flex gap-x-2"}
                      variant="outline"
                    >
                      Import Data
                      <UploadIcon size={"1.25rem"} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-none">
                    <CSVUpload setIsUploadDialogOpen={setIsUploadDialogOpen} />
                  </DialogContent>
                </Dialog>
                <Button
                  aria-label={"Export query results as CSV"}
                  className={"flex gap-x-2 w-full rounded-l-none"}
                  onClick={exportDataToCSV}
                >
                  Export Data as CSV
                  <DownloadIcon size={"1.25rem"} />
                </Button>
              </div>

              <div className={"w-full h-1/2 max-h-[50%]"}>
                <ResultsDataTable
                  columns={Object.keys(data![0]).map((key) => ({
                    accessorKey: key,
                    header: key,
                  }))}
                  data={data!}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className={
              "flex flex-col w-full h-full items-center justify-center"
            }
          >
            <Card>
              <CardContent className={"p-4 flex items-center gap-x-4"}>
                Fetching data, populating local database
                <Loader2 className={"animate-spin"} />
              </CardContent>
            </Card>
          </div>
        )}
        <Toaster richColors />
      </div>
    </ThemeProvider>
  );
};

export default App;
