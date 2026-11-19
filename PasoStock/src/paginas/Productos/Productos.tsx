import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import Pagination from '../../componentes/Table/Pagination';
import { TableFilterMenu } from '../../componentes/Table/TableFilterMenu';
import { usePagination } from '../../componentes/Table/usePagination';
import { Icon } from '../../componentes/Icon';
import { formatUnitAmount, productPrice } from '../../utils/formatters';
import type { Product } from '../../types';

interface ProductsProps {
    products: Product[];
    hasSearch: boolean;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onSetActive: (product: Product, active: boolean) => void;
}

export default function Products({ products, hasSearch, onEdit, onDelete, onSetActive }: ProductsProps) {
    const [filters, setFilters] = useState({ status: 'active', category: '', price: '' });
    const visibleProducts = products.filter((product) => !filters.status || product.active === (filters.status === 'active'));
    const activeCount = products.filter((product) => product.active).length;
    const inactiveCount = products.length - activeCount;
    const categories = [...new Set(products.map((product) => product.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'))
        .map((category) => ({ value: category, label: category }));
    const filteredProducts = visibleProducts.filter((product) =>
        (!filters.category || product.category === filters.category)
        && (!filters.price || (filters.price === 'above' ? product.price > 1 : product.price < 1)));
    const hasProductFilters = Object.values(filters).some(Boolean);
    const pagination = usePagination(filteredProducts);
    const filterDefinitions = [
        {
            title: 'Estado',
            value: filters.status,
            options: [
                { value: 'active', label: `Activos (${activeCount})` },
                { value: 'inactive', label: `Inactivos (${inactiveCount})` },
            ],
            onSelect: (status: string) => setFilters((current) => ({ ...current, status })),
        },
        {
            title: 'Categoría',
            value: filters.category,
            options: categories,
            onSelect: (category: string) => setFilters((current) => ({ ...current, category })),
        },
        {
            title: 'Precio',
            value: filters.price,
            options: [
                { value: 'above', label: 'Mayor a $1' },
                { value: 'below', label: 'Menor a $1' },
            ],
            onSelect: (price: string) => setFilters((current) => ({ ...current, price })),
        },
    ];

    return (
        <section className="panel table-panel products-table-panel">
            <TableFilterMenu
                idPrefix="products"
                filters={filterDefinitions}
                onClear={() => setFilters({ status: '', category: '', price: '' })}
            />
            <div className="table-meta">
                <span>{filteredProducts.length} de {visibleProducts.length} {filters.status === 'active' ? 'productos activos' : filters.status === 'inactive' ? 'productos inactivos' : 'productos'}</span>
                <span>Las existencias se actualizan con cada movimiento</span>
            </div>
            <Table>
                <table>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Nombre</th>
                            <th>Precio ($)</th>
                            <th>Stock Actual</th>
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
                                                        : filters.status === 'active'
                                                            ? 'No hay productos activos'
                                                            : filters.status === 'inactive'
                                                                ? 'No hay productos inactivos'
                                                                : 'No hay productos registrados'}
                                            </strong>
                                            <p>
                                                {hasSearch
                                                    ? 'Prueba con otro término de búsqueda.'
                                                    : hasProductFilters && visibleProducts.length > 0
                                                        ? 'Prueba con otras opciones o limpia los filtros.'
                                                        : filters.status === 'active'
                                                            ? 'Registra un producto o consulta la lista de inactivos.'
                                                            : filters.status === 'inactive'
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
            />
        </section>
    );
}
