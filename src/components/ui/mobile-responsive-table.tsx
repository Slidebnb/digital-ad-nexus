
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Column {
  key: string;
  title: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface MobileResponsiveTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  mobileCardRender?: (row: any, index: number) => React.ReactNode;
}

export function MobileResponsiveTable({
  columns,
  data,
  loading = false,
  emptyMessage = "Keine Daten gefunden",
  onRowClick,
  mobileCardRender
}: MobileResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Desktop table view
  const DesktopTable = () => (
    <div className="hidden md:block rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow 
                key={index} 
                className={`hover:bg-background/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile card view
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        data.map((row, index) => (
          <Card key={index} className="gradient-card">
            <CardContent className="p-4">
              {mobileCardRender ? (
                mobileCardRender(row, index)
              ) : (
                <div className="space-y-2">
                  {/* Show primary columns on mobile */}
                  {columns.filter(col => !col.mobileHidden).slice(0, 3).map((column) => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.title}:
                      </span>
                      <span className="text-sm">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    </div>
                  ))}
                  
                  {/* Expandable section for additional data */}
                  {columns.length > 3 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(index)}
                        className="w-full mt-2 h-8"
                      >
                        <span className="text-xs">
                          {expandedRows.has(index) ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                        </span>
                        <ChevronRight 
                          className={`h-4 w-4 ml-2 transition-transform ${
                            expandedRows.has(index) ? 'rotate-90' : ''
                          }`}
                        />
                      </Button>
                      
                      {expandedRows.has(index) && (
                        <div className="pt-3 mt-3 border-t space-y-2">
                          {columns.slice(3).map((column) => (
                            <div key={column.key} className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">
                                {column.title}:
                              </span>
                              <span className="text-sm">
                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {onRowClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRowClick(row)}
                      className="w-full mt-3"
                    >
                      <MoreVertical className="h-4 w-4 mr-2" />
                      Aktionen
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <>
      <DesktopTable />
      <MobileCards />
    </>
  );
}
