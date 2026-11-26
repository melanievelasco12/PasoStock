import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import Pagination from '../../componentes/Table/Pagination';
import TableSortButton, { type SortDirection } from '../../componentes/Table/TableSortButton';
import { usePagination } from '../../componentes/Table/usePagination';
import { Icon } from '../../componentes/Icon';
import { formatUnitAmount, productPrice } from '../../utils/formatters';
import type { Product } from '../../types';

interface ProductsProps {
    products: Product[];
    deletableProductIds: ReadonlySet<string>;
    hasSearch: boolean;
    onClearSearch: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onSetActive: (product: Product, active: boolean) => void;
}

type SortColumn = 'category' | 'name' | 'price' | 'stock';

export default function Products({ products, deletableProductIds, hasSearch, onClearSearch, onEdit, onDelete, onSetActive }: ProductsProps) {
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
                : sort.column === 'category'
                    ? a.category.localeCompare(b.category, 'es', { sensitivity: 'base', numeric: true })
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
            <Table className="mobile-card-table products-card-table">
                <table>
                    <thead>
                        <tr>
                            <th aria-label="Filtrar y ordenar por categoría" aria-sort={sort?.column === 'category' ? sort.direction : 'none'}>
                                <div className="products-category-heading">
                                    <span>Categoría</span>
                                    <TableSortButton
                                        label="Categoría"
                                        direction={sort?.column === 'category' ? sort.direction : null}
                                        onClick={() => cycleSort('category')}
                                        iconOnly
                                    />
                                    <details className={`products-category-filter${selectedCategories.length ? ' has-active-filter' : ''}`}>
                                        <summary aria-label={`Filtrar por categoría${selectedCategories.length ? ` (${selectedCategories.length} seleccionadas)` : ''}`}>
                                            <Icon name="filter" />
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
                                </div>
                            </th>
                            <th aria-sort={sort?.column === 'name' ? sort.direction : 'none'}>
                                <TableSortButton label="Producto" direction={sort?.column === 'name' ? sort.direction : null} onClick={() => cycleSort('name')} />
                            </th>
                            <th aria-sort={sort?.column === 'price' ? sort.direction : 'none'}>
                                <TableSortButton label="Precio ($)" direction={sort?.column === 'price' ? sort.direction : null} onClick={() => cycleSort('price')} />
                            </th>
                            <th aria-sort={sort?.column === 'stock' ? sort.direction : 'none'}>
                                <TableSortButton label="Stock Actual" direction={sort?.column === 'stock' ? sort.direction : null} onClick={() => cycleSort('stock')} />
                            </th>
                            <th className="actions-col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length
                            ? pagination.items.map((product) => (
                                <tr
                                    key={product.id}
                                    className={product.active && product.stock < product.minStock ? 'low-stock-row' : undefined}
                                >
                                    <td data-label="Categoría"><span className="category-pill">{product.category}</span></td>
                                    <td data-label="Producto">
                                        <div className="catalog-product">
                                            <strong>{product.name}</strong>
                                            {product.brand && <span className="catalog-brand">{product.brand}</span>}
                                            {product.code && <span>{product.code}</span>}
                                        </div>
                                    </td>
                                    <td data-label="Precio"><strong className="product-price">{productPrice.format(product.price)}</strong></td>
                                    <td className="catalog-stock-cell" data-label="Stock actual">
                                        <strong className={`catalog-stock${product.stock < product.minStock ? ' low' : ''}`}>{product.stock}</strong>{' '}
                                        <span className="muted-unit catalog-stock-unit">
                                            {product.unit === 'unidad' && product.unitAmount === 1
                                                ? 'unidades'
                                                : `${formatUnitAmount(product.unitAmount, product.unit)} por producto`}
                                        </span>
                                    </td>
                                    <td data-label="Acciones">
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
                                                aria-label={deletableProductIds.has(product.id)
                                                    ? `Eliminar ${product.name}`
                                                    : product.movementCount > 0
                                                        ? `No se puede eliminar ${product.name} porque tiene historial`
                                                        : product.stock > 0
                                                            ? `No se puede eliminar ${product.name} porque tiene existencias`
                                                            : `No se puede eliminar ${product.name} porque tiene movimientos asociados`}
                                                title={deletableProductIds.has(product.id)
                                                    ? 'Eliminar producto'
                                                    : product.movementCount > 0
                                                        ? 'No se puede borrar un producto con otros movimientos en su historial'
                                                        : product.stock > 0
                                                            ? 'No se puede eliminar un producto con existencias'
                                                            : 'No se puede eliminar un producto con movimientos asociados'}
                                                disabled={!deletableProductIds.has(product.id)}
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
