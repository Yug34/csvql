"use client";
import {ChangeEvent} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {UploadIcon} from "lucide-react";
import alasql from "alasql";
import {useTablesStore} from "@/store/tablesStore.ts";
import {roundNumber} from "@/lib/utils.ts";
import {useAlasqlStore} from "@/store/alasqlStore.ts";

export default function CSVUpload() {
    const {addTable} = useTablesStore();
    const {setQuery, setData, setQueryExecutionTime} = useAlasqlStore();

    const getCSVDataFromFile = (event: ChangeEvent) => {
        const file = (event.target as HTMLInputElement).files![0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const contents = e.target!.result;
            const tableName = "new_table";
            addTable(tableName);

            await alasql.promise(`CREATE TABLE ${tableName}`);
            await alasql.promise(`INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`, [contents]);

            let startTime = performance.now();
            const query = `-- Enter SQL Query here:\nSELECT * FROM ${tableName}`;
            setQuery(query);
            setData(alasql(query));

            let endTime = performance.now();
            let timeElapsed = endTime - startTime;
            setQueryExecutionTime(roundNumber(timeElapsed));
        };

        reader.readAsText(file);
    };

    return (
        <div className={"flex flex-col h-full justify-center items-center w-full"}>
            <Card className={"w-full border-none p-0"}>
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
                                <span className="font-semibold">
                                  Click here to upload a CSV file
                                </span>
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
            </Card>
        </div>
    );
}
