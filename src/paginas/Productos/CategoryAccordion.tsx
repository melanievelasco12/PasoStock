import { useRef } from 'react';
import type { Category } from '../../types';

interface CategoryAccordionProps {
    categories: Category[];
    error: string;
    value: string;
    onChange: (value: string) => void;
}

export default function CategoryAccordion({ categories, error, value, onChange }: CategoryAccordionProps) {
    const accordion = useRef<HTMLDetailsElement>(null);

    return (
        <div className="field category-picker-field">
            <label htmlFor="product-category">Categoría</label>
            <div className="category-picker-control">
                <input
                    id="product-category"
                    name="category"
                    type="text"
                    required
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    autoComplete="off"
                    placeholder={categories.length ? 'Selecciona o escribe una categoría' : 'Escribe una categoría'}
                    aria-describedby="product-category-hint"
                />
                <details ref={accordion} className="category-picker-accordion">
                    <summary aria-label="Mostrar categorías guardadas">
                        <span className="category-picker-chevron" aria-hidden="true" />
                    </summary>
                    <div
                        className={`category-picker-options${categories.length >= 3 ? ' category-picker-options-scrollable' : ''}`}
                        role="group"
                        aria-label="Categorías guardadas"
                    >
                        {categories.length ? categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                aria-pressed={value === category.name}
                                onClick={() => {
                                    onChange(category.name);
                                    accordion.current?.removeAttribute('open');
                                }}
                            >
                                {category.name}
                            </button>
                        )) : <span className="category-picker-empty">No hay categorías guardadas.</span>}
                    </div>
                </details>
            </div>
            <small id="product-category-hint">
                {error || 'Elige una categoría guardada o escribe una nueva.'}
            </small>
        </div>
    );
}
