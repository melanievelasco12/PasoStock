import { Icon } from '../Icon';

const pageSizeOptions = [10, 50, 100] as const;

interface PaginationProps {
    totalItems: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({ totalItems, page, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="table-pagination" aria-label="Paginación">
            <label className="pagination-page-size">
                Filas por página
                <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                    {pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
            </label>
            <span className="pagination-range">Mostrando {firstItem}–{lastItem} de {totalItems}</span>
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
