import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel
} from "@tanstack/react-table"

import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent
} from "@/components/ui/hover-card.tsx";
import {ReactNode} from "react";
import {CopyIcon, InfoIcon} from "lucide-react";
import {toast} from "sonner";
import {copyTextToClipboard} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {ScrollBar, ScrollArea} from "@/components/ui/scroll-area.tsx";
import {useTablesStore} from "@/store/tablesStore.ts";
import {useAlasqlStore} from "@/store/alasqlStore.ts";
import alasql from "alasql";

interface ResultsDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function ResultsDataTable<TData, TValue>({
    columns,
    data,
}: ResultsDataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {pageSize: 30}
        }
    });

    const {tables} = useTablesStore();
    const {setQuery, setData, query} = useAlasqlStore();

    return (
        <div className="rounded-md border max-h-full w-full max-w-screen">
            <div className="flex items-center justify-end space-x-2">
                <ScrollArea className={"flex mr-auto"}>
                    <HoverCard>
                        <HoverCardTrigger>
                            <InfoIcon className={"inline m-0 w-4 h-4 mx-4"}/>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            Click on any of these table names to view the data
                        </HoverCardContent>
                    </HoverCard>

                    {tables.map(table => (
                        <Button
                            variant={"ghost"}
                            className={`rounded-none ${query!.includes(`SELECT * FROM ${table}`) && "font-semibold underline underline-offset-4"}`}
                            key={table}
                            onClick={() => {
                                const query = `SELECT * FROM ${table}`
                                setQuery(query);
                                setData(alasql(query));
                            }}
                        >
                            {table}
                        </Button>
                    ))}
                </ScrollArea>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>

            <Separator/>

            <ScrollArea className="w-full whitespace-nowrap">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <HoverCard>
                                                <HoverCardTrigger>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </HoverCardTrigger>
                                                <HoverCardContent
                                                    className={`cursor-pointer flex gap-x-2 w-fit max-w-[600px] truncate`}
                                                    onClick={() => {
                                                        copyTextToClipboard(cell.getContext().getValue() as string)
                                                        toast.success("Copied to clipboard!")
                                                    }}
                                                >
                                                    {cell.getContext().getValue() as ReactNode}
                                                    <CopyIcon className={"w-4 h-4"}/>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <ScrollBar orientation="horizontal"/>
            </ScrollArea>
        </div>
    )
}