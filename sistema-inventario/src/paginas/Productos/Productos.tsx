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
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onSetActive: (product: Product, active: boolean) => void;
}

export default function Products({ products, hasSearch, onEdit, onDelete, onSetActive }: ProductsProps) {
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
    const visibleProducts = products.filter((product) => product.active === (statusFilter === 'active'));
    const activeCount = products.filter((product) => product.active).length;
    const inactiveCount = products.length - activeCount;
    const pagination = usePagination(visibleProducts);

    return (
        <section className="panel table-panel products-table-panel">
            <div className="table-meta">
                <span>{visibleProducts.length} {statusFilter === 'active' ? 'productos activos' : 'productos inactivos'}</span>
                <span>Las existencias se actualizan con cada movimiento</span>
                <label className="product-status-filter">
                    Mostrar
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value === 'inactive' ? 'inactive' : 'active')}>
                        <option value="active">Activos ({activeCount})</option>
                        <option value="inactive">Inactivos ({inactiveCount})</option>
                    </select>
                </label>
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
                        {visibleProducts.length
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
                                                    : statusFilter === 'active' ? 'No hay productos activos' : 'No hay productos inactivos'}
                                            </strong>
                                            <p>
                                                {hasSearch
                                                    ? 'Prueba con otro término de búsqueda.'
                                                    : statusFilter === 'active'
                                                        ? 'Registra un producto o consulta la lista de inactivos.'
                                                        : 'Los productos desactivados aparecerán aquí para que puedas reactivarlos.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </Table>
            <Pagination
                totalItems={visibleProducts.length}
                page={pagination.page}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
            />
        </section>
    );
}
