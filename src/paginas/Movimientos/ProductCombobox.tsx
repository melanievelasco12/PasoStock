import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Product } from '../../types';
import { formatUnitAmount } from '../../utils/formatters';
import styles from './ProductCombobox.module.css';

interface ProductComboboxProps {
    products: Product[];
}

function normalizeSearchValue(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

function getProductPresentation(product: Product): string {
    return formatUnitAmount(product.unitAmount, product.unit);
}

export default function ProductCombobox({ products }: ProductComboboxProps) {
    const [selectedProductId, setSelectedProductId] = useState('');
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedProduct = products.find((product) => product.id === selectedProductId);
    const filteredProducts = useMemo(() => {
        const normalizedQuery = normalizeSearchValue(query.trim());
        if (!normalizedQuery) return products;

        return products.filter((product) => normalizeSearchValue([
            product.name,
            product.code,
            getProductPresentation(product),
        ].join(' ')).includes(normalizedQuery));
    }, [products, query]);

    useEffect(() => {
        if (!isOpen) return;

        function closeOnOutsideClick(event: PointerEvent) {
            if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', closeOnOutsideClick);
        return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
    }, [isOpen]);

    function selectProduct(product: Product) {
        setSelectedProductId(product.id);
        setQuery('');
        setIsOpen(false);
        setActiveIndex(0);
        inputRef.current?.setCustomValidity('');
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
                setQuery('');
                setIsOpen(true);
                setActiveIndex(0);
                return;
            }
            if (filteredProducts.length) {
                setActiveIndex((index) => (index + 1) % filteredProducts.length);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!isOpen) {
                setQuery('');
                setIsOpen(true);
                setActiveIndex(Math.max(filteredProducts.length - 1, 0));
                return;
            }
            if (filteredProducts.length) {
                setActiveIndex((index) => (index - 1 + filteredProducts.length) % filteredProducts.length);
            }
        } else if (event.key === 'Enter' && isOpen) {
            event.preventDefault();
            const product = filteredProducts[activeIndex];
            if (product) selectProduct(product);
        } else if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setIsOpen(false);
            setQuery('');
        }
    }

    const visibleValue = isOpen
        ? query
        : selectedProduct?.name ?? query;

    return (
        <div className={styles.container} ref={containerRef}>
            <input
                ref={inputRef}
                className={styles.input}
                type="text"
                role="combobox"
                aria-label="Producto"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="movement-product-listbox"
                aria-activedescendant={isOpen && filteredProducts.length
                    ? `movement-product-option-${activeIndex}`
                    : undefined}
                autoComplete="off"
                required
                value={visibleValue}
                placeholder="Buscar por nombre, código o presentación..."
                onFocus={() => {
                    if (!isOpen) {
                        setQuery('');
                        setIsOpen(true);
                        setActiveIndex(0);
                    }
                }}
                onChange={(event) => {
                    setSelectedProductId('');
                    setQuery(event.target.value);
                    setIsOpen(true);
                    setActiveIndex(0);
                    inputRef.current?.setCustomValidity('Selecciona un producto de la lista.');
                }}
                onKeyDown={handleKeyDown}
            />
            {selectedProduct && !isOpen && (
                <button
                    type="button"
                    className={styles.clearButton}
                    aria-label="Limpiar producto seleccionado"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        setSelectedProductId('');
                        setQuery('');
                        setIsOpen(true);
                        setActiveIndex(0);
                        inputRef.current?.setCustomValidity('Selecciona un producto de la lista.');
                        inputRef.current?.focus();
                    }}
                >
                    ×
                </button>
            )}
            {isOpen && (
                <div
                    className={styles.listbox}
                    id="movement-product-listbox"
                    role="listbox"
                >
                    {filteredProducts.length
                        ? filteredProducts.map((product, index) => (
                            <div
                                key={product.id}
                                id={`movement-product-option-${index}`}
                                className={`${styles.option}${index === activeIndex ? ` ${styles.activeOption}` : ''}`}
                                role="option"
                                aria-selected={product.id === selectedProductId}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => selectProduct(product)}
                            >
                                <span className={styles.productName}>{product.name}</span>
                                <span className={styles.productDetails}>
                                    {product.stock} unidades disponibles <span aria-hidden="true">•</span> {getProductPresentation(product)} por producto
                                </span>
                            </div>
                        ))
                        : (
                            <div className={styles.emptyOption} role="option" aria-disabled="true">
                                No se encontraron productos
                            </div>
                        )}
                </div>
            )}
            <input type="hidden" name="productId" value={selectedProductId} />
        </div>
    );
}
