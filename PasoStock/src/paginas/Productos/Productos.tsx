import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import Pagination from '../../componentes/Table/Pagination';
import { usePagination } from '../../componentes/Table/usePagination';
import { Icon } from '../../componentes/Icon';
import { formatUnitAmount, productPrice } from '../../utils/formatters';
import type { Product } from '../../types';

interface ProductsProps {
    products: Product[];
    hasSearch: boolean;
    onClearSearch: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onSetActive: (product: Product, active: boolean) => void;
}

type SortColumn = 'name' | 'price' | 'stock';
type SortDirection = 'ascending' | 'descending';

export default function Products({ products, hasSearch, onClearSearch, onEdit, onDelete, onSetActive }: ProductsProps) {
    const [status, setStatus] = useState<'active' | 'inactive' | ''>('active');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sort, setSort] = useState<{ column: SortColumn; direction: SortDirection } | null>(null);
    const visibleProducts = products.filter((product) => !status || product.active === (status === 'active'));
    const activeCount = products.filter((product) => product.active).length;
    const inactiveCount = products.length - activeCount;
    const categories = [...new Set(products.map((product) => product.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'))
    const filteredProducts = visibleProducts.filter((product) =>
        selectedCategories.length === 0 || selectedCategories.includes(product.category));
    const sortedProducts = sort
        ? [...filteredProducts].sort((a, b) => {
            const comparison = sort.column === 'name'
                ? a.name.localeCompare(b.name, 'es', { sensitivity: 'base', numeric: true })
                : a[sort.column] - b[sort.column];
            return sort.direction === 'ascending' ? comparison : -comparison;
        })
        : filteredProducts;
    const hasProductFilters = selectedCategories.length > 0;
    const hasActiveControls = hasSearch || hasProductFilters || Boolean(sort) || Boolean(status);
    const pagination = usePagination(sortedProducts);

    function toggleCategory(category: string) {
        setSelectedCategories((current) => current.includes(category)
            ? current.filter((selected) => selected !== category)
            : [...current, category]);
    }

    function cycleSort(column: SortColumn) {
        setSort((current) => {
            if (current?.column !== column) {
                return { column, direction: 'ascending' };
            }
            if (current.direction === 'ascending') {
                return { column, direction: 'descending' };
            }
            return null;
        });
    }

    function sortIcon(column: SortColumn) {
        if (sort?.column !== column) return '⇅';
        return sort.direction === 'ascending' ? '↑' : '↓';
    }

    function clearFilters() {
        onClearSearch();
        setSelectedCategories([]);
        setSort(null);
        setStatus('');
    }

    return (
        <section className="panel table-panel products-table-panel">
            <div className="products-table-toolbar" aria-label="Filtros de la tabla">
                <div className="products-status-tabs" role="group" aria-label="Filtrar por estado">
                    <button type="button" aria-pressed={!status} onClick={() => setStatus('')}>Todos</button>
                    <button type="button" aria-pressed={status === 'active'} onClick={() => setStatus('active')}>
                        Activos <span>{activeCount}</span>
                    </button>
                    <button type="button" aria-pressed={status === 'inactive'} onClick={() => setStatus('inactive')}>
                        Inactivos <span>{inactiveCount}</span>
                    </button>
                </div>
                {hasActiveControls && (
                    <button type="button" className="products-clear-filters" onClick={clearFilters}>
                        Limpiar filtros
                    </button>
                )}
            </div>
            <div className="table-meta">
                <span>{filteredProducts.length} de {visibleProducts.length} {status === 'active' ? 'productos activos' : status === 'inactive' ? 'productos inactivos' : 'productos'}</span>
                <span>Las existencias se actualizan con cada movimiento</span>
            </div>
            <Table>
                <table>
                    <thead>
                        <tr>
                            <th aria-label="Filtrar por categoría">
                                <details className="products-category-filter">
                                    <summary aria-label={`Categoría${selectedCategories.length ? ` (${selectedCategories.length})` : ''}`}>
                                        <span>Categoría{selectedCategories.length ? ` (${selectedCategories.length})` : ''}</span>
                                        <Icon name="filter" />
                                        <span className="products-category-chevron" aria-hidden="true">⌄</span>
                                    </summary>
                                    <div className="products-category-menu" role="group" aria-label="Categorías">
                                        {categories.length
                                            ? categories.map((category) => (
                                                <label key={category}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category)}
                                                        onChange={() => toggleCategory(category)}
                                                    />
                                                    <span>{category}</span>
                                                </label>
                                            ))
                                            : <span className="products-category-empty">No hay categorías</span>}
                                        <button type="button" onClick={() => setSelectedCategories([])} disabled={!selectedCategories.length}>
                                            Limpiar selección
                                        </button>
                                    </div>
                                </details>
                            </th>
                            <th aria-sort={sort?.column === 'name' ? sort.direction : 'none'}>
                                <button type="button" className="products-sort-button" onClick={() => cycleSort('name')}>
                                    Nombre <span aria-hidden="true">{sortIcon('name')}</span>
                                </button>
                            </th>
                            <th aria-sort={sort?.column === 'price' ? sort.direction : 'none'}>
                                <button type="button" className="products-sort-button" onClick={() => cycleSort('price')}>
                                    Precio ($) <span aria-hidden="true">{sortIcon('price')}</span>
                                </button>
                            </th>
                            <th aria-sort={sort?.column === 'stock' ? sort.direction : 'none'}>
                                <button type="button" className="products-sort-button" onClick={() => cycleSort('stock')}>
                                    Stock Actual <span aria-hidden="true">{sortIcon('stock')}</span>
                                </button>
                            </th>
                            <th className="actions-col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length
                            ? pagination.items.map((product) => (
                                <tr
                                    key={product.id}
                                    className={product.active && product.stock <= product.minStock ? 'low-stock-row' : undefined}
                                >
                                    <td><span className="category-pill">{product.category}</span></td>
                                    <td>
                                        <div className="catalog-product">
                                            <strong>{product.name}</strong>
                                            {product.brand && <span className="catalog-brand">{product.brand}</span>}
                                            {product.code && <span>{product.code}</span>}
                                        </div>
                                    </td>
                                    <td><strong className="product-price">{productPrice.format(product.price)}</strong></td>
                                    <td>
                                        <strong className={`catalog-stock${product.stock <= product.minStock ? ' low' : ''}`}>{product.stock}</strong>{' '}
                                        <span className="muted-unit">
                                            {product.unit === 'unidad' && product.unitAmount === 1
                                                ? 'unidades'
                                                : `${formatUnitAmount(product.unitAmount, product.unit)} por producto`}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button aria-label={`Editar ${product.name}`} title="Editar" onClick={() => onEdit(product)}>
                                                <Icon name="edit" />
                                            </button>
                                            {product.movementCount > 0 && (
                                                <button
                                                    aria-label={`${product.active ? 'Desactivar' : 'Reactivar'} ${product.name}`}
                                                    title={product.active ? 'Desactivar y conservar historial' : 'Reactivar producto'}
                                                    onClick={() => onSetActive(product, !product.active)}
                                                >
                                                    <Icon name={product.active ? 'archive' : 'check'} />
                                                </button>
                                            )}
                                            <button
                                                aria-label={`Eliminar ${product.name}`}
                                                title={product.movementCount > 0 ? 'No se puede borrar un producto con historial' : 'Eliminar producto'}
                                                disabled={product.movementCount > 0 || product.stock > 0}
                                                onClick={() => onDelete(product)}
                                            >
                                                <Icon name="trash" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            : (
                                <tr>
                                    <td className="catalog-empty-cell" colSpan={5}>
                                        <div className="catalog-empty" role="status">
                                            <strong>
                                                {hasSearch
                                                    ? 'No encontramos productos'
                                                    : hasProductFilters && visibleProducts.length > 0
                                                        ? 'No hay productos que coincidan con los filtros'
                                                        : status === 'active'
                                                            ? 'No hay productos activos'
                                                            : status === 'inactive'
                                                                ? 'No hay productos inactivos'
                                                                : 'No hay productos registrados'}
                                            </strong>
                                            <p>
                                                {hasSearch
                                                    ? 'Prueba con otro término de búsqueda.'
                                                    : hasProductFilters && visibleProducts.length > 0
                                                        ? 'Prueba con otras opciones o limpia los filtros.'
                                                        : status === 'active'
                                                            ? 'Registra un producto o consulta la lista de inactivos.'
                                                            : status === 'inactive'
                                                                ? 'Los productos desactivados aparecerán aquí para que puedas reactivarlos.'
                                                                : 'Registra un producto para que aparezca en esta lista.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </Table>
            <Pagination
                totalItems={filteredProducts.length}
                page={pagination.page}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                showAllOption
                itemLabel="productos"
            />
        </section>
    );
}
