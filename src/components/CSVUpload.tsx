"use client";
import {ChangeEvent} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {UploadIcon} from "lucide-react";

export default function CSVUpload() {
    const getCSVDataFromFile = (event: ChangeEvent) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const contents = e.target!.result;
            parseCSV(contents as string);
        };

        reader.readAsText(file);
    };

    const parseCSV = (csvData: string) => {
        // Here you can use a CSV parsing library or implement your own parsing logic
        // For example, you can split the CSV data by line and then by comma
        const lines = csvData.split('\n');
        const values = lines.map((line: string) => line.split(','));

        if (values[0].length !== values[values.length - 1].length) {
            values.pop(); // Remove a row added mistakenly due to trailing whitespace
        }

        console.log(values);
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
