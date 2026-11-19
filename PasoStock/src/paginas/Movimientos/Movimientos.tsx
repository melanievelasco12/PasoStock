import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import Pagination from '../../componentes/Table/Pagination';
import { TableFilterMenu } from '../../componentes/Table/TableFilterMenu';
import TableSortButton, { type SortDirection } from '../../componentes/Table/TableSortButton';
import { usePagination } from '../../componentes/Table/usePagination';
import { EmptyState } from '../../componentes/common';
import type { Movement, MovementType, Product } from '../../types';

const movementDateTime = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});
const movementDateLabel = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

function getMovementDate(value: string): Date | null {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

interface MovementsProps {
    movements: Movement[];
    allMovements: Movement[];
    products: Product[];
    onNew: (type: MovementType) => void;
}

interface MovementColumnFilters {
    category: string;
    type: string;
    dateFrom: string;
    dateTo: string;
}

export default function Movements({ movements, allMovements, products, onNew }: MovementsProps) {
    const [columnFilters, setColumnFilters] = useState<MovementColumnFilters>({
        category: '',
        type: '',
        dateFrom: '',
        dateTo: '',
    });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const categoryOptions = [...new Set(allMovements
        .map((movement) => productsById.get(movement.productId)?.category ?? '')
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'))
        .map((category) => ({ value: category, label: category }));
    const filteredMovements = movements.filter((movement) => {
        const date = getMovementDate(movement.createdAt);
        const dateKey = date ? getDateKey(date) : '';
        return (!columnFilters.category || productsById.get(movement.productId)?.category === columnFilters.category)
            && (!columnFilters.type || movement.type === columnFilters.type)
            && (!columnFilters.dateFrom || dateKey >= columnFilters.dateFrom)
            && (!columnFilters.dateTo || dateKey <= columnFilters.dateTo);
    });
    const hasAnyFilter = Boolean(columnFilters.category || columnFilters.type || columnFilters.dateFrom || columnFilters.dateTo);
    const dateFilterLabel = columnFilters.dateFrom && columnFilters.dateTo
        ? `${movementDateLabel.format(new Date(`${columnFilters.dateFrom}T00:00:00`))} – ${movementDateLabel.format(new Date(`${columnFilters.dateTo}T00:00:00`))}`
        : columnFilters.dateFrom
            ? `Desde ${movementDateLabel.format(new Date(`${columnFilters.dateFrom}T00:00:00`))}`
            : columnFilters.dateTo
                ? `Hasta ${movementDateLabel.format(new Date(`${columnFilters.dateTo}T00:00:00`))}`
                : 'Todos';
    const dateFilterValue = columnFilters.dateFrom && columnFilters.dateTo
        ? `${columnFilters.dateFrom}|${columnFilters.dateTo}`
        : columnFilters.dateFrom || columnFilters.dateTo;
    const filterDefinitions = [
        {
            title: 'Categoría',
            value: columnFilters.category,
            options: categoryOptions,
            onSelect: (category: string) => setColumnFilters((filters) => ({ ...filters, category })),
        },
        {
            title: 'Tipo',
            value: columnFilters.type,
            options: [
                { value: 'entrada', label: 'Entrada' },
                { value: 'salida', label: 'Salida' },
            ],
            onSelect: (type: string) => setColumnFilters((filters) => ({ ...filters, type })),
        },
        {
            title: 'Fecha',
            value: dateFilterValue,
            displayValue: dateFilterLabel,
            content: (
                <div className="table-filter-date-range">
                    <label>
                        Desde
                        <input
                            type="date"
                            aria-label="Fecha inicial"
                            value={columnFilters.dateFrom}
                            onChange={(event) => {
                                const nextDate = event.target.value;
                                setColumnFilters((filters) => ({
                                    ...filters,
                                    dateFrom: nextDate,
                                    dateTo: filters.dateTo && nextDate && nextDate > filters.dateTo ? '' : filters.dateTo,
                                }));
                            }}
                        />
                    </label>
                    <label>
                        Hasta
                        <input
                            type="date"
                            aria-label="Fecha final"
                            value={columnFilters.dateTo}
                            onChange={(event) => {
                                const nextDate = event.target.value;
                                setColumnFilters((filters) => nextDate && filters.dateFrom && nextDate < filters.dateFrom
                                    ? { ...filters, dateFrom: nextDate, dateTo: filters.dateFrom }
                                    : { ...filters, dateTo: nextDate });
                            }}
                        />
                    </label>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="movement-shortcuts">
                <button className="shortcut-card" onClick={() => onNew('entrada')}>
                    <span className="shortcut-icon entry-shortcut">↓</span>
                    <span><strong>Registrar entrada</strong><small>Agregar mercadería al inventario</small></span>
                    <b>→</b>
                </button>
                <button className="shortcut-card" onClick={() => onNew('salida')}>
                    <span className="shortcut-icon exit-shortcut">↑</span>
                    <span><strong>Registrar salida</strong><small>Descontar mercadería disponible</small></span>
                    <b>→</b>
                </button>
            </div>
            <section className="panel table-panel movement-history-panel">
                <TableFilterMenu
                    idPrefix="movements"
                    filters={filterDefinitions}
                    onClear={() => setColumnFilters({ category: '', type: '', dateFrom: '', dateTo: '' })}
                />
                <div className="table-meta">
                    <span>Historial de movimientos</span>
                    <span>{filteredMovements.length} registros</span>
                </div>
                <MovementTable
                    movements={filteredMovements}
                    hasFilters={hasAnyFilter}
                />
            </section>
        </>
    );
}

interface MovementTableProps {
    movements: Movement[];
    hasFilters: boolean;
}

type MovementSortColumn = 'productName' | 'type' | 'quantity' | 'createdAt';

export function MovementTable({ movements, hasFilters }: MovementTableProps) {
    const [sort, setSort] = useState<{ column: MovementSortColumn; direction: SortDirection } | null>(null);
    const sortedMovements = sort
        ? [...movements].sort((a, b) => {
            const comparison = sort.column === 'productName' || sort.column === 'type'
                ? a[sort.column].localeCompare(b[sort.column], 'es', { sensitivity: 'base', numeric: true })
                : sort.column === 'quantity'
                    ? a.quantity - b.quantity
                    : (getMovementDate(a.createdAt)?.getTime() ?? 0) - (getMovementDate(b.createdAt)?.getTime() ?? 0);
            return sort.direction === 'ascending' ? comparison : -comparison;
        })
        : movements;
    const pagination = usePagination(sortedMovements);

    function cycleSort(column: MovementSortColumn) {
        setSort((current) => {
            if (current?.column !== column) return { column, direction: 'ascending' };
            if (current.direction === 'ascending') return { column, direction: 'descending' };
            return null;
        });
    }

    return (
        <>
            <Table className="mobile-card-table movements-card-table">
                <table>
                    <thead>
                        <tr>
                            <th aria-sort={sort?.column === 'productName' ? sort.direction : 'none'}>
                                <TableSortButton label="Producto" direction={sort?.column === 'productName' ? sort.direction : null} onClick={() => cycleSort('productName')} />
                            </th>
                            <th aria-sort={sort?.column === 'type' ? sort.direction : 'none'}>
                                <TableSortButton label="Tipo" direction={sort?.column === 'type' ? sort.direction : null} onClick={() => cycleSort('type')} />
                            </th>
                            <th aria-sort={sort?.column === 'quantity' ? sort.direction : 'none'}>
                                <TableSortButton label="Cantidad" direction={sort?.column === 'quantity' ? sort.direction : null} onClick={() => cycleSort('quantity')} />
                            </th>
                            <th aria-sort={sort?.column === 'createdAt' ? sort.direction : 'none'}>
                                <TableSortButton label="Fecha" direction={sort?.column === 'createdAt' ? sort.direction : null} onClick={() => cycleSort('createdAt')} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagination.items.length
                            ? pagination.items.map((movement) => {
                                const date = getMovementDate(movement.createdAt);
                                return (
                                    <tr key={movement.id}>
                                        <td data-label="Producto">
                                            <div className="product-cell">
                                                <div className="product-avatar">{movement.productName.slice(0, 1).toUpperCase()}</div>
                                                <div><strong>{movement.productName}</strong></div>
                                            </div>
                                        </td>
                                        <td data-label="Tipo">
                                            <span className={`movement-type ${movement.type}`}>
                                                {movement.type === 'entrada' ? '↓ Entrada' : '↑ Salida'}
                                            </span>
                                        </td>
                                        <td data-label="Cantidad">
                                            <strong className={movement.type === 'entrada' ? 'positive-quantity' : 'negative-quantity'}>
                                                {movement.type === 'entrada' ? '+' : '−'}{movement.quantity}
                                            </strong>
                                        </td>
                                        <td data-label="Fecha">{date ? movementDateTime.format(date) : '—'}</td>
                                    </tr>
                                );
                            })
                            : (
                                <tr>
                                    <td colSpan={4}>
                                        {hasFilters
                                            ? <EmptyState title="No hay movimientos para estos filtros" detail="Cambia o limpia los filtros para consultar otros movimientos." />
                                            : <EmptyState title="Aún no hay movimientos" detail="Cuando registres una entrada o salida aparecerá aquí." />}
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </Table>
            <Pagination
                totalItems={movements.length}
                page={pagination.page}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
            />
        </>
    );
}
