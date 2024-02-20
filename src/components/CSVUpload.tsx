"use client";
import {ChangeEvent, useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {UploadIcon} from "lucide-react";
import alasql from "alasql";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {useTablesStore} from "@/store/tablesStore.ts";
import {useAlasqlStore} from "@/store/alasqlStore.ts";
import {roundNumber} from "@/lib/utils.ts";

interface CSVUploadProps {
    setIsUploadDialogOpen: (isOpen: boolean) => void;
}

export default function CSVUpload({setIsUploadDialogOpen}: CSVUploadProps) {
    const [csvData, setCSVData] = useState<null | string>(null);
    const [tableName, setTableName] = useState<string>("");
    // const [queryData, setQueryData] = useState<null | Record<string, string>[]>(null);

    const {addTable} = useTablesStore();
    const {setQuery, setData, setQueryExecutionTime} = useAlasqlStore();

    const getCSVDataFromFile = (event: ChangeEvent) => {
        const file = (event.target as HTMLInputElement).files![0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const contents = e.target!.result as string;
            setCSVData(contents);
            // TODO: Needed for table
            //  setQueryData(alasql("SELECT * FROM CSV(?, {headers: true, separator:\",\"})", [contents]));
        };

        reader.readAsText(file);
    };

    const createTable = async () => {
        addTable(tableName);
        await alasql.promise(`CREATE TABLE ${tableName}`);
        await alasql.promise(`INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`, [csvData]);
        let startTime = performance.now();
        const query = `-- Enter SQL Query here:\nSELECT * FROM ${tableName}`;
        setQuery(query);
        setData(alasql(query));
        let endTime = performance.now();
        let timeElapsed = endTime - startTime;
        setQueryExecutionTime(roundNumber(timeElapsed));
        setIsUploadDialogOpen(false);
    }

    return (
        <div className={"flex flex-col h-full justify-center items-center w-full max-w-full"}>
            <Card className={"w-full"}>
                {csvData ? (
                    <>
                        <CardHeader>
                            <CardTitle className="mb-3 flex justify-between items-center">
                                <div>Name your new table</div>
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <Input
                                type={"text"}
                                placeholder={"Enter new table name"}
                                name="table_name"
                                onChange={(e) => {
                                    setTableName(e.target.value);
                                }}
                            />
                            <ScrollArea className={"w-full max-w-full max-h-[400px]"}>
                                <ScrollBar/>

                                {/*<Table className={"w-fit max-w-fit"}>*/}
                                {/*    <TableHeader>*/}
                                {/*        <TableRow>*/}
                                {/*            {Object.keys(queryData![0]).map((key) => (*/}
                                {/*                <TableHead>{key}</TableHead>*/}
                                {/*            ))}*/}
                                {/*        </TableRow>*/}
                                {/*    </TableHeader>*/}
                                {/*    <TableBody>*/}
                                {/*        {queryData?.map((row, index) => {*/}
                                {/*            const keys = Object.keys(row);*/}
                                {/*            return (*/}
                                {/*                <TableRow key={row[keys[0]]}>*/}
                                {/*                    {keys.map((key) => (*/}
                                {/*                        <TableCell>{queryData[index][key]}</TableCell>*/}
                                {/*                    ))}*/}
                                {/*                </TableRow>*/}
                                {/*            )*/}
                                {/*        })}*/}
                                {/*    </TableBody>*/}
                                {/*</Table>*/}
                                <Button className={"w-full mt-6"} onClick={createTable}>
                                    Create table
                                </Button>
                            </ScrollArea>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle className="mb-3 flex justify-between items-center">
                                <div>Import a CSV file</div>
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <Label htmlFor="dropzone-file" className={"cursor-pointer"}>
                                <Card
                                    className="flex p-4 items-center justify-center w-full brightness-[0.95] hover:brightness-[0.90] dark:brightness-125 dark:hover:brightness-150">
                                    <div className="text-center w-full">
                                        <div className="border p-2 rounded-md max-w-min mx-auto">
                                            <UploadIcon/>
                                        </div>

                                        <p className="my-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click here to upload a CSV file</span>
                                        </p>
                                    </div>
                                </Card>
                            </Label>

                            <Input
                                id="dropzone-file"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                type="file"
                                className="hidden"
                                onChange={getCSVDataFromFile}
                            />
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
