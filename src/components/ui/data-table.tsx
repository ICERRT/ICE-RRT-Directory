import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const DEFAULT_CSV_URL = "/rrts.csv"

export type RrtGroup = {
    name: string
    stateTerrUs: string
    regionNote: string
    type: string
    web: string
    phone: string
    email: string
    social: string
    comment: string
}

// Minimal CSV line splitter that handles quoted fields and commas within quotes.
function splitCsvLine(line: string): string[] {
    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === "," && !inQuotes) {
            values.push(current)
            current = ""
        } else {
            current += char
        }
    }
    values.push(current)
    return values.map((v) => v.trim())
}

function parseCsv(text: string): Record<string, string>[] {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    if (lines.length === 0) return []
    const header = splitCsvLine(lines[0])
    const rows: Record<string, string>[] = []
    for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i])
        const row: Record<string, string> = {}
        for (let j = 0; j < header.length; j++) {
            row[header[j]] = cols[j] ?? ""
        }
        rows.push(row)
    }
    return rows
}

export const columns: ColumnDef<RrtGroup>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "stateTerrUs",
        header: "State/Terr./US",
    },
    {
        accessorKey: "regionNote",
        header: "Region Note",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "web",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Web
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => {
            const url = String(row.getValue("web") ?? "")
            if (!url) return <span>-</span>
            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                >
                    {url}
                </a>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "social",
        header: "Social",
    },
    {
        accessorKey: "comment",
        header: "Comment",
    },
]

export function DataTable({ csvUrl = DEFAULT_CSV_URL }: { csvUrl?: string } = {}) {
    const [data, setData] = React.useState<RrtGroup[]>([])
    const [selectedState, setSelectedState] = React.useState<string | undefined>(undefined)
    const [selectedRegion, setSelectedRegion] = React.useState<string | undefined>(undefined)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    React.useEffect(() => {
        let isCancelled = false
        async function load() {
            try {
                const response = await fetch(csvUrl, { cache: "no-store" })
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
                }
                const text = await response.text()
                const rows = parseCsv(text)
                const rrts: RrtGroup[] = rows
                    .map((r) => {
                        return {
                            name: r["Name"] ?? "",
                            stateTerrUs: r["State/Terr./US"] ?? "",
                            regionNote: r["Region Note"] ?? "",
                            type: r["Type"] ?? "",
                            web: r["Web"] ?? "",
                            phone: r["Phone"] ?? "",
                            email: r["Email"] ?? "",
                            social: r["Social"] ?? "",
                            comment: r["Comment"] ?? "",
                        }
                    })
                    .filter((p) => Object.values(p).some((v) => String(v).trim().length > 0))
                if (!isCancelled) {
                    setData(rrts)
                }
            } catch (err) {
                console.error(err)
                if (!isCancelled) {
                    setData([])
                }
            }
        }
        load()
        return () => {
            isCancelled = true
        }
    }, [csvUrl])

    const uniqueStates = React.useMemo(
        () =>
            Array.from(
                new Set(
                    data
                        .map((d) => d.stateTerrUs)
                        .filter((v): v is string => Boolean(v && v.trim().length > 0))
                )
            ).sort(),
        [data]
    )
    const uniqueRegions = React.useMemo(
        () =>
            Array.from(
                new Set(
                    data
                        .map((d) => d.regionNote)
                        .filter((v): v is string => Boolean(v && v.trim().length > 0))
                )
            ).sort(),
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter names..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="ml-2 w-56">
                    <Select
                        value={selectedState}
                        onValueChange={(value) => {
                            if (value === "all") {
                                setSelectedState(undefined)
                                table.getColumn("stateTerrUs")?.setFilterValue(undefined)
                                return
                            }
                            setSelectedState(value)
                            table.getColumn("stateTerrUs")?.setFilterValue(
                                value
                            )
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All states/territories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {uniqueStates.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="ml-2 w-56">
                    <Select
                        value={selectedRegion}
                        onValueChange={(value) => {
                            if (value === "all") {
                                setSelectedRegion(undefined)
                                table.getColumn("regionNote")?.setFilterValue(undefined)
                                return
                            }
                            setSelectedRegion(value)
                            table.getColumn("regionNote")?.setFilterValue(
                                value
                            )
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All regions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {uniqueRegions.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
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
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
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
            </div>
        </div>
    )
}
