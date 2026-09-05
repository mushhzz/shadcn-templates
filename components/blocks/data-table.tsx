"use client"

import * as React from "react"
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludesSome,
  filterFn_includesString,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ReactTable,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Download,
  EyeOff,
  MoreHorizontal,
  PlusCircle,
  Settings2,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * Features and column helpers
 * -----------------------------------------------------------------------------------------------*/

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnFilteringFeature,
  columnFacetingFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text, datetime: sortFn_datetime },
  filterFns: { includesString: filterFn_includesString, arrIncludesSome: filterFn_arrIncludesSome },
})

export type DataTableFeatures = typeof dataTableFeatures
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData, unknown>
export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>

/**
 * Build columns with the returned helper and wrap them in `helper.columns([...])`.
 * Columns used by a faceted filter must declare `filterFn: "arrIncludesSome"`.
 */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

export function DataTableSelectColumn<TData extends RowData>(): DataTableColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
    ),
    enableSorting: false,
    enableHiding: false,
  } as DataTableColumnDef<TData>
}

export type RowAction<TData> = {
  label: string
  onSelect: (row: TData) => void
  icon?: React.ComponentType<{ className?: string }>
  destructive?: boolean
  /** Render a separator above this action. */
  separator?: boolean
}

/** A trailing "…" column with a dropdown of actions. */
export function DataTableActionsColumn<TData extends RowData>(actions: RowAction<TData>[] | ((row: TData) => RowAction<TData>[])): DataTableColumnDef<TData> {
  return {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const list = typeof actions === "function" ? actions(row.original) : actions
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {list.map((a) => (
                <React.Fragment key={a.label}>
                  {a.separator ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem variant={a.destructive ? "destructive" : "default"} onSelect={() => a.onSelect(row.original)}>
                    {a.icon ? <a.icon className="size-4" /> : null}
                    {a.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  } as DataTableColumnDef<TData>
}

/* -------------------------------------------------------------------------------------------------
 * Column header
 * -----------------------------------------------------------------------------------------------*/

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>
  const sorted = column.getIsSorted()
  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" aria-label={`${title} column options`}>
            {title}
            {sorted === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : sorted === "desc" ? (
              <ArrowDown className="size-3.5" />
            ) : (
              <ChevronsUpDown className="size-3.5 opacity-50" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => column.toggleSorting(false)}>
            <ArrowUp className="size-4" /> Sort ascending
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => column.toggleSorting(true)}>
            <ArrowDown className="size-4" /> Sort descending
          </DropdownMenuItem>
          {column.getCanHide() ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => column.toggleVisibility(false)}>
                <EyeOff className="size-4" /> Hide column
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Context so composed parts can reach the table instance
 * -----------------------------------------------------------------------------------------------*/

const DataTableContext = React.createContext<DataTableInstance<RowData> | null>(null)

export function useDataTable<TData extends RowData>(): DataTableInstance<TData> {
  const ctx = React.useContext(DataTableContext)
  if (!ctx) throw new Error("useDataTable must be used inside <DataTable>")
  return ctx as unknown as DataTableInstance<TData>
}

/* -------------------------------------------------------------------------------------------------
 * Faceted filter
 * -----------------------------------------------------------------------------------------------*/

export type FacetOption = { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }

export function DataTableFacetedFilter<TData extends RowData>({
  column,
  title,
  options,
}: {
  column: Column<DataTableFeatures, TData, unknown> | undefined
  title: string
  options: FacetOption[]
}) {
  if (!column) return null
  const facets = column.getFacetedUniqueValues()
  const selected = new Set((column.getFilterValue() as string[] | undefined) ?? [])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-4" />
          {title}
          {selected.size > 0 ? (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selected.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((o) => selected.has(o.value))
                    .map((o) => (
                      <Badge key={o.value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {o.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const isSelected = selected.has(o.value)
                const count = facets.get(o.value) ?? 0
                return (
                  <CommandItem
                    key={o.value}
                    onSelect={() => {
                      const next = new Set(selected)
                      if (isSelected) next.delete(o.value)
                      else next.add(o.value)
                      column.setFilterValue(next.size ? [...next] : undefined)
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="size-3" />
                    </div>
                    {o.icon ? <o.icon className="size-4 text-muted-foreground" /> : null}
                    <span>{o.label}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{count}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.size > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => column.setFilterValue(undefined)} className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------------------------------
 * View options, pagination, export
 * -----------------------------------------------------------------------------------------------*/

export function DataTableViewOptions<TData extends RowData>({ table }: { table: DataTableInstance<TData> }) {
  const hideable = table.getAllColumns().filter((c) => c.getCanHide())
  if (hideable.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings2 className="size-4" /> View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(v) => column.toggleVisibility(!!v)}
          >
            {column.id.replace(/([A-Z])/g, " $1")}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function exportTableToCsv<TData extends RowData>(table: DataTableInstance<TData>, filename = "export.csv") {
  const columns = table.getVisibleLeafColumns().filter((c) => c.id !== "select" && c.id !== "actions")
  const escape = (v: unknown) => {
    const s = v instanceof Date ? v.toISOString() : v == null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    columns.map((c) => escape(c.id)).join(","),
    ...table.getFilteredRowModel().rows.map((r) => columns.map((c) => escape(r.getValue(c.id))).join(",")),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 50],
}: {
  table: DataTableInstance<TData>
  pageSizeOptions?: number[]
}) {
  const pageIndex = table.state.pagination.pageIndex
  const pageSize = table.state.pagination.pageSize
  const pageCount = Math.max(table.getPageCount(), 1)
  const selected = table.getFilteredSelectedRowModel().rows.length
  const total = table.getFilteredRowModel().rows.length
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
      <div className="text-muted-foreground">{selected > 0 ? `${selected} of ${total} selected` : `${total} rows`}</div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="hidden text-muted-foreground sm:inline">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-18" aria-label="Rows per page" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="hidden size-8 lg:inline-flex" aria-label="First page" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="hidden size-8 lg:inline-flex" aria-label="Last page" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DataTable
 * -----------------------------------------------------------------------------------------------*/

export type DataTableFacet = { column: string; title: string; options: FacetOption[] }

export type DataTableProps<TData extends RowData> = {
  columns: ReadonlyArray<DataTableColumnDef<TData>>
  data: TData[]
  pageSize?: number
  pageSizeOptions?: number[]
  /** Shows a search box that filters across all columns. */
  searchPlaceholder?: string
  enableSearch?: boolean
  /** Faceted filters; each column must declare `filterFn: "arrIncludesSome"`. */
  facets?: DataTableFacet[]
  /** Extra toolbar content, rendered after search and facets. */
  toolbar?: React.ReactNode
  /** Enables a CSV export button for the filtered rows. */
  exportFilename?: string
  /** Rendered in a bar above the table while rows are selected. */
  bulkActions?: (rows: TData[], clear: () => void) => React.ReactNode
  emptyMessage?: string
  onSelectionChange?: (rows: TData[]) => void
  onRowClick?: (row: TData) => void
  getRowId?: (row: TData) => string
  className?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize = 10,
  pageSizeOptions,
  searchPlaceholder = "Search…",
  enableSearch = false,
  facets,
  toolbar,
  exportFilename,
  bulkActions,
  emptyMessage = "No results.",
  onSelectionChange,
  onRowClick,
  getRowId,
  className,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    state: { rowSelection, columnFilters, globalFilter },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    enableRowSelection: true,
  })

  const onSelectionChangeRef = React.useRef(onSelectionChange)
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  })
  React.useEffect(() => {
    onSelectionChangeRef.current?.(table.getSelectedRowModel().rows.map((r) => r.original))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const isFiltered = columnFilters.length > 0 || globalFilter !== ""
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const rows = table.getRowModel().rows
  const showToolbar = enableSearch || (facets && facets.length > 0) || toolbar || exportFilename || table.getAllColumns().some((c) => c.getCanHide())

  return (
    <DataTableContext.Provider value={table as unknown as DataTableInstance<RowData>}>
      <div data-slot="data-table" className={cn("flex flex-col gap-3", className)}>
        {showToolbar ? (
          <div className="flex flex-wrap items-center gap-2">
            {enableSearch ? (
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-full min-w-40 sm:w-56"
                aria-label={searchPlaceholder}
              />
            ) : null}
            {facets?.map((f) => (
              <DataTableFacetedFilter key={f.column} column={table.getColumn(f.column)} title={f.title} options={f.options} />
            ))}
            {isFiltered ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  setColumnFilters([])
                  setGlobalFilter("")
                }}
              >
                Reset <X className="size-4" />
              </Button>
            ) : null}
            {toolbar}
            <div className="ml-auto flex items-center gap-2">
              {exportFilename ? (
                <Button variant="outline" size="sm" className="h-8" aria-label="Export CSV" onClick={() => exportTableToCsv(table, exportFilename)}>
                  <Download className="size-4" /> <span className="hidden sm:inline">Export</span>
                </Button>
              ) : null}
              <DataTableViewOptions table={table} />
            </div>
          </div>
        ) : null}

        {bulkActions && selectedRows.length > 0 ? (
          <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
            <span className="font-medium">{selectedRows.length} selected</span>
            <div className="flex flex-wrap items-center gap-2">{bulkActions(selectedRows, () => setRowSelection({}))}</div>
            <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={() => setRowSelection({})}>
              Clear
            </Button>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.id === "select" && "w-9", header.column.id === "actions" && "w-12")}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      </div>
    </DataTableContext.Provider>
  )
}

export function DataTableSkeleton({ rows = 6, columns = 5, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div data-slot="data-table-skeleton" className={cn("flex flex-col gap-3", className)} aria-busy>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="ml-auto h-8 w-20" />
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="grid gap-px bg-border">
          {Array.from({ length: rows + 1 }).map((_, r) => (
            <div key={r} className="grid items-center gap-4 bg-background px-3 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={c} className={cn("h-4", r === 0 ? "w-16" : c === 0 ? "w-3/4" : "w-1/2")} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  )
}
