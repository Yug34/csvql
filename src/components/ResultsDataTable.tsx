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
} from "@tanstack/react-table"

import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent
} from "@/components/ui/hover-card.tsx";
import {ReactNode} from "react";
import {CopyIcon} from "lucide-react";
import {toast} from "sonner";
import {copyTextToClipboard} from "@/lib/utils.ts";

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
    })

    return (
        <div className="rounded-md border">
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
                                            <HoverCardContent className={"flex gap-x-2 w-fit max-w-[600px] truncate"}>
                                                {cell.getContext().getValue() as ReactNode}
                                                <CopyIcon
                                                    className={"cursor-pointer"}
                                                    onClick={() => {
                                                        copyTextToClipboard(cell.getContext().getValue() as string)
                                                        toast.success("Copied to clipboard!")
                                                    }}
                                                />
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
        </div>
    )
}