interface ColumnFilterProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function ColumnFilter({ label, value, onChange }: ColumnFilterProps) {
    return (
        <input
            className="table-column-filter"
            type="search"
            aria-label={`Filtrar ${label}`}
            placeholder="Filtrar..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}
