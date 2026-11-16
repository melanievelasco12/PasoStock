import { useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import './TableFilterMenu.css';

export interface TableFilterChoice {
    value: string;
    label: string;
}

export interface TableFilterDefinition {
    title: string;
    value: string;
    options?: TableFilterChoice[];
    onSelect?: (value: string) => void;
    displayValue?: string;
    content?: ReactNode;
}

interface TableFilterMenuProps {
    idPrefix: string;
    filters: TableFilterDefinition[];
    onClear: () => void;
}

function FilterOption({ title, value, options = [], onSelect, displayValue, content }: TableFilterDefinition) {
    const selectedLabel = displayValue ?? options.find((option) => option.value === value)?.label ?? 'Todos';

    return (
        <details className="table-filter-option">
            <summary>
                <span>{title}</span>
                <span className="table-filter-option-value">{selectedLabel}</span>
                <span className="table-filter-option-chevron" aria-hidden="true" />
            </summary>
            {content
                ? <div className="table-filter-option-content">{content}</div>
                : (
                    <div className="table-filter-option-list" role="group" aria-label={`Opciones de ${title.toLocaleLowerCase('es')}`}>
                        <button type="button" aria-pressed={!value} onClick={() => onSelect?.('')}>Todos</button>
                        {options.filter((option) => option.value).map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={value === option.value}
                                onClick={() => onSelect?.(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
        </details>
    );
}

export function TableFilterMenu({ idPrefix, filters, onClear }: TableFilterMenuProps) {
    const [open, setOpen] = useState(false);
    const activeCount = filters.filter((filter) => Boolean(filter.value)).length;
    const toggleId = `${idPrefix}-filter-toggle`;
    const panelId = `${idPrefix}-filter-options`;

    return (
        <div className="table-filter-toolbar" aria-label="Filtros de tabla">
            {activeCount > 0 && (
                <button type="button" className="table-filter-clear" onClick={onClear}>
                    Limpiar filtros
                </button>
            )}
            <section className="table-filter-menu">
                <button
                    type="button"
                    id={toggleId}
                    className="table-filter-toggle"
                    aria-label={activeCount ? `Filtros, ${activeCount} activos` : 'Filtros'}
                    title="Filtros"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpen((isOpen) => !isOpen)}
                >
                    <span className="table-filter-icon">
                        <Icon name="filter" />
                        {activeCount > 0 && <span className="table-filter-badge">{activeCount}</span>}
                    </span>
                </button>
                <div
                    className="table-filter-popover"
                    id={panelId}
                    role="region"
                    aria-labelledby={toggleId}
                    hidden={!open}
                >
                    {filters.map((filter) => <FilterOption key={filter.title} {...filter} />)}
                </div>
            </section>
        </div>
    );
}
