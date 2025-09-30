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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent
} from "@/components/ui/hover-card.tsx";
import {ReactNode} from "react";
import {CopyIcon} from "lucide-react";
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

const ResultsDataTable = <TData, TValue>({
    columns,
    data,
}: ResultsDataTableProps<TData, TValue>) => {
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
        <div className="rounded-md border md:mb-0 h-fit max-h-fit md:max-h md:max-h-full w-full max-w-screen">
            <div className="flex items-center justify-end">
                <ScrollArea className={"mr-auto whitespace-nowrap"}>
                    <div className={"flex w-fit items-center"}>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button
                                    className={"rounded-r-none rounded-bl-none"}
                                    aria-label={"Open dropdown of tables available"}
                                >
                                    Show all tables
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <ScrollArea className={"h-52 max-h-52"}>
                                    <DropdownMenuLabel>Tables</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    {tables.map(table => {
                                        const isTableInQuery = query!.includes(table);
                                        return (
                                            <DropdownMenuItem key={table} className={"p-0"}>
                                                <Button
                                                    aria-label={"Inspect data of a specific table"}
                                                    variant={"ghost"}
                                                    className={`w-full h-full rounded-none ${isTableInQuery && "font-semibold underline underline-offset-4"}`}
                                                    onClick={() => {
                                                        const query = `SELECT * FROM ${table}`
                                                        setQuery(query);
                                                        setData(alasql(query));
                                                    }}
                                                >
                                                    {table}
                                                </Button>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                    <ScrollBar/>
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </ScrollArea>
                <div className={"flex w-fit min-w-fit"}>
                    <Button
                        aria-label={"Check the previous page in paginated data table"}
                        variant={"outline"}
                        className={"rounded-none border-y-0"}
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous Page
                    </Button>
                    <Button
                        aria-label={"Check the next page in paginated data table"}
                        className={"rounded-br-none rounded-l-none border-y-0"}
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next Page
                    </Button>
                </div>
            </div>

            <Separator/>

            <ScrollArea className="h-[400px] w-full whitespace-nowrap">
                <Table>
                    <TableHeader className={"sticky top-0 bg-secondary"}>
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
                                                <HoverCardTrigger href={"#"} onClick={(e) => {
                                                    e.preventDefault();
                                                    copyTextToClipboard(cell.getContext().getValue() as string);
                                                    toast.success("Copied to clipboard!");
                                                }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </HoverCardTrigger>
                                                <HoverCardContent
                                                    className={`cursor-pointer flex gap-x-2 w-fit max-w-[600px] truncate`}
                                                    onClick={() => {
                                                        copyTextToClipboard(cell.getContext().getValue() as string);
                                                        toast.success("Copied to clipboard!");
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

export default ResultsDataTable;
