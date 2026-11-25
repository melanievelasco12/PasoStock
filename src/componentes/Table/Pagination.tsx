import { Icon } from '../Icon';

const defaultPageSizeOptions = [10, 50, 100] as const;
const productPageSizeOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: -1, label: 'Todos' },
] as const;

interface PaginationProps {
    totalItems: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    showAllOption?: boolean;
    itemLabel?: string;
}

export default function Pagination({
    totalItems,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    showAllOption = false,
    itemLabel = 'elementos',
}: PaginationProps) {
    const totalPages = Math.max(1, pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize));
    const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = pageSize === -1 ? totalItems : Math.min(page * pageSize, totalItems);
    const rangeText = showAllOption
        ? pageSize === -1 || totalPages === 1
            ? `Mostrando los ${totalItems} ${itemLabel}`
            : `Viendo ${firstItem} a ${lastItem} de ${totalItems} ${itemLabel}`
        : `Mostrando ${firstItem}–${lastItem} de ${totalItems}`;

    return (
        <div className="table-pagination" aria-label="Paginación">
            <label className="pagination-page-size">
                Filas por página
                <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                    {showAllOption
                        ? productPageSizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))
                        : defaultPageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
            </label>
            <span className="pagination-range">{rangeText}</span>
            <div className="pagination-controls">
                <button
                    type="button"
                    aria-label="Página anterior"
                    title="Página anterior"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <Icon name="arrowRight" />
                </button>
                <span aria-live="polite">Página {page} de {totalPages}</span>
                <button
                    type="button"
                    aria-label="Página siguiente"
                    title="Página siguiente"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <Icon name="arrowRight" />
                </button>
            </div>
        </div>
    );
}
