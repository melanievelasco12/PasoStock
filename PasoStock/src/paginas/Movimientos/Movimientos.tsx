import { useState } from 'react';
import { Icon } from '../../componentes/Icon';
import Table from '../../componentes/Table/Table';
import Pagination from '../../componentes/Table/Pagination';
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
    product: string;
    type: string;
    dateFrom: string;
    dateTo: string;
}

interface FilterChoice {
    value: string;
    label: string;
}

interface MovementFilterOptionProps {
    title: string;
    value: string;
    options: FilterChoice[];
    onSelect: (value: string) => void;
}

function MovementFilterOption({ title, value, options, onSelect }: MovementFilterOptionProps) {
    const selectedLabel = options.find((option) => option.value === value)?.label ?? 'Todos';

    return (
        <details className="movement-filter-option">
            <summary>
                <span>{title}</span>
                <span className="movement-filter-option-value">{selectedLabel}</span>
                <span className="movement-filter-option-chevron" aria-hidden="true" />
            </summary>
            <div className="movement-filter-option-list" role="group" aria-label={`Opciones de ${title.toLocaleLowerCase('es')}`}>
                <button type="button" aria-pressed={!value} onClick={() => onSelect('')}>Todos</button>
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={value === option.value}
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </details>
    );
}

interface MovementDateRangeFilterProps {
    dateFrom: string;
    dateTo: string;
    onChange: (dateFrom: string, dateTo: string) => void;
}

function MovementDateRangeFilter({ dateFrom, dateTo, onChange }: MovementDateRangeFilterProps) {
    const rangeLabel = dateFrom && dateTo
        ? `${movementDateLabel.format(new Date(`${dateFrom}T00:00:00`))} – ${movementDateLabel.format(new Date(`${dateTo}T00:00:00`))}`
        : dateFrom
            ? `Desde ${movementDateLabel.format(new Date(`${dateFrom}T00:00:00`))}`
            : dateTo
                ? `Hasta ${movementDateLabel.format(new Date(`${dateTo}T00:00:00`))}`
                : 'Todos';

    return (
        <details className="movement-filter-option movement-date-range-filter">
            <summary>
                <span>Fecha</span>
                <span className="movement-filter-option-value">{rangeLabel}</span>
                <span className="movement-filter-option-chevron" aria-hidden="true" />
            </summary>
            <div className="movement-date-range-calendar">
                <div className="movement-date-range-inputs">
                    <label>
                        Desde
                        <input
                            type="date"
                            value={dateFrom}
                            aria-label="Fecha inicial"
                            onChange={(event) => {
                                const nextDate = event.target.value;
                                onChange(nextDate, dateTo && nextDate && nextDate > dateTo ? '' : dateTo);
                            }}
                        />
                    </label>
                    <label>
                        Hasta
                        <input
                            type="date"
                            value={dateTo}
                            aria-label="Fecha final"
                            onChange={(event) => {
                                const nextDate = event.target.value;
                                if (nextDate && dateFrom && nextDate < dateFrom) {
                                    onChange(nextDate, dateFrom);
                                } else {
                                    onChange(dateFrom, nextDate);
                                }
                            }}
                        />
                    </label>
                </div>
            </div>
        </details>
    );
}

export default function Movements({ movements, allMovements, products, onNew }: MovementsProps) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState<MovementColumnFilters>({
        category: '',
        product: '',
        type: '',
        dateFrom: '',
        dateTo: '',
    });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const movementProducts = [...new Map(allMovements.map((movement) => [
        movement.productId,
        {
            value: movement.productId,
            label: movement.productName,
            category: productsById.get(movement.productId)?.category ?? '',
        },
    ] as const)).values()];
    const categoryOptions = [...new Set(movementProducts.map((product) => product.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'))
        .map((category) => ({ value: category, label: category }));
    const productOptions = movementProducts
        .filter((product) => !columnFilters.category || product.category === columnFilters.category)
        .sort((a, b) => a.label.localeCompare(b.label, 'es'))
        .map(({ value, label }) => ({ value, label }));
    const filteredMovements = movements.filter((movement) => {
        const date = getMovementDate(movement.createdAt);
        const dateKey = date ? getDateKey(date) : '';
        return (!columnFilters.category || productsById.get(movement.productId)?.category === columnFilters.category)
            && (!columnFilters.product || movement.productId === columnFilters.product)
            && (!columnFilters.type || movement.type === columnFilters.type)
            && (!columnFilters.dateFrom || dateKey >= columnFilters.dateFrom)
            && (!columnFilters.dateTo || dateKey <= columnFilters.dateTo);
    });
    const hasAnyFilter = Boolean(columnFilters.category || columnFilters.product || columnFilters.type || columnFilters.dateFrom || columnFilters.dateTo);
    const activeColumnFilterCount = [
        columnFilters.category,
        columnFilters.product,
        columnFilters.type,
        columnFilters.dateFrom || columnFilters.dateTo,
    ].filter(Boolean).length;

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
                <div className="movement-date-filters" aria-label="Filtros de movimientos">
                    {hasAnyFilter && (
                        <button
                            type="button"
                            className="movement-filter-clear"
                            onClick={() => {
                                setColumnFilters({ category: '', product: '', type: '', dateFrom: '', dateTo: '' });
                            }}
                        >
                            Limpiar filtros
                        </button>
                    )}
                    <section className="movement-filter-accordion">
                        <button
                            type="button"
                            id="movement-filter-toggle"
                            className="movement-more-filters"
                            aria-label={activeColumnFilterCount ? `Filtros, ${activeColumnFilterCount} activos` : 'Filtros'}
                            title="Filtros"
                            aria-expanded={filtersOpen}
                            aria-controls="movement-extra-filters"
                            onClick={() => setFiltersOpen((open) => !open)}
                        >
                            <span className="movement-filter-title">
                                <Icon name="filter" />
                                {activeColumnFilterCount > 0 && <span className="movement-filter-badge">{activeColumnFilterCount}</span>}
                            </span>
                        </button>
                        <div
                            className="movement-extra-filters"
                            id="movement-extra-filters"
                            role="region"
                            aria-labelledby="movement-filter-toggle"
                            hidden={!filtersOpen}
                        >
                            <MovementFilterOption
                                title="Categoría"
                                value={columnFilters.category}
                                options={categoryOptions}
                                onSelect={(value) => setColumnFilters((filters) => ({ ...filters, category: value, product: '' }))}
                            />
                            <MovementFilterOption
                                title="Producto"
                                value={columnFilters.product}
                                options={productOptions}
                                onSelect={(value) => setColumnFilters((filters) => ({ ...filters, product: value }))}
                            />
                            <MovementFilterOption
                                title="Tipo"
                                value={columnFilters.type}
                                options={[{ value: 'entrada', label: 'Entrada' }, { value: 'salida', label: 'Salida' }]}
                                onSelect={(value) => setColumnFilters((filters) => ({ ...filters, type: value }))}
                            />
                            <MovementDateRangeFilter
                                dateFrom={columnFilters.dateFrom}
                                dateTo={columnFilters.dateTo}
                                onChange={(dateFrom, dateTo) => setColumnFilters((filters) => ({ ...filters, dateFrom, dateTo }))}
                            />
                        </div>
                    </section>
                </div>
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

export function MovementTable({ movements, hasFilters }: MovementTableProps) {
    const pagination = usePagination(movements);

    return (
        <>
            <Table>
                <table>
                    <thead>
                        <tr>
                            <th>
                                Producto
                            </th>
                            <th>
                                Tipo
                            </th>
                            <th>
                                Cantidad
                            </th>
                            <th>
                                Fecha
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagination.items.length
                            ? pagination.items.map((movement) => {
                                const date = getMovementDate(movement.createdAt);
                                return (
                                    <tr key={movement.id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-avatar">{movement.productName.slice(0, 1).toUpperCase()}</div>
                                                <div><strong>{movement.productName}</strong></div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`movement-type ${movement.type}`}>
                                                {movement.type === 'entrada' ? '↓ Entrada' : '↑ Salida'}
                                            </span>
                                        </td>
                                        <td>
                                            <strong className={movement.type === 'entrada' ? 'positive-quantity' : 'negative-quantity'}>
                                                {movement.type === 'entrada' ? '+' : '−'}{movement.quantity}
                                            </strong>
                                        </td>
                                        <td>{date ? movementDateTime.format(date) : '—'}</td>
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
