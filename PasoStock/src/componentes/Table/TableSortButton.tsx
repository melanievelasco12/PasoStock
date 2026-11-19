export type SortDirection = 'ascending' | 'descending';

interface TableSortButtonProps {
    label: string;
    direction: SortDirection | null;
    onClick: () => void;
    iconOnly?: boolean;
}

export default function TableSortButton({ label, direction, onClick, iconOnly = false }: TableSortButtonProps) {
    const indicator = direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '⇅';

    return (
        <button
            type="button"
            className={`table-sort-button${iconOnly ? ' table-sort-button-icon-only' : ''}`}
            aria-label={iconOnly ? `Ordenar por ${label}` : undefined}
            title={iconOnly ? `Ordenar por ${label}` : undefined}
            onClick={onClick}
        >
            {!iconOnly && label}
            <span aria-hidden="true">{indicator}</span>
        </button>
    );
}
