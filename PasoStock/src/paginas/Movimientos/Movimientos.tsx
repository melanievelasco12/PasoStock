import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import Pagination from '../../componentes/Table/Pagination';
import TableSortButton, { type SortDirection } from '../../componentes/Table/TableSortButton';
import { usePagination } from '../../componentes/Table/usePagination';
import { EmptyState } from '../../componentes/common';
import { Icon } from '../../componentes/Icon';
import type { Movement, MovementType, Product } from '../../types';

const movementDateTime = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});
function getMovementDate(value: string): Date | null {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

interface MovementsProps {
    movements: Movement[];
    allMovements: Movement[];
    products: Product[];
    onNew: (type: MovementType) => void;
}

export default function Movements({ movements, onNew }: MovementsProps) {
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
                <div className="table-meta movement-table-meta">
                    <span>Historial de movimientos</span>
                    <span>{movements.length} registros</span>
                    <button
                        type="button"
                        className="movement-refresh-button"
                        aria-label="Actualizar movimientos y existencias"
                        title="Actualizar movimientos y existencias"
                        onClick={() => window.dispatchEvent(new Event('pasostock:refresh-inventory'))}
                    >
                        <Icon name="refresh" />
                    </button>
                </div>
                <MovementTable movements={movements} />
            </section>
        </>
    );
}

interface MovementTableProps {
    movements: Movement[];
}

type MovementSortColumn = 'productName' | 'type' | 'quantity' | 'createdAt';

export function MovementTable({ movements }: MovementTableProps) {
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
                                        <EmptyState title="Aún no hay movimientos" detail="Cuando registres una entrada o salida aparecerá aquí." />
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
