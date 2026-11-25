import { describe, expect, it } from 'vitest';
import type { Movement, Product } from '../types';
import { canDeleteProduct } from './productDeletion';

const product: Product = {
    id: 'product-1',
    code: '',
    name: 'Producto',
    brand: '',
    category: 'General',
    price: 0,
    unit: 'unidad',
    unitAmount: 1,
    active: true,
    stock: 0,
    minStock: 0,
    movementCount: 0,
    lastMovementId: null,
    updatedAt: '',
};

const initialStockMovement: Movement = {
    id: 'movement-1',
    productId: product.id,
    productName: product.name,
    type: 'entrada',
    quantity: 5,
    note: 'Stock inicial',
    createdBy: 'user-1',
    createdAt: '',
};

describe('canDeleteProduct', () => {
    it('allows deleting a product with no movements and no stock', () => {
        expect(canDeleteProduct(product, [])).toBe(true);
    });

    it('allows deleting a product when its only movement is its initial stock', () => {
        expect(canDeleteProduct({
            ...product,
            stock: initialStockMovement.quantity,
            movementCount: 1,
            lastMovementId: initialStockMovement.id,
        }, [initialStockMovement])).toBe(true);
    });

    it('keeps products with later movements or unrecorded stock protected', () => {
        const laterMovement = { ...initialStockMovement, id: 'movement-2', note: 'Reposición' };
        expect(canDeleteProduct({
            ...product,
            stock: initialStockMovement.quantity,
            movementCount: 2,
            lastMovementId: laterMovement.id,
        }, [initialStockMovement, laterMovement])).toBe(false);
        expect(canDeleteProduct({ ...product, stock: 5 }, [])).toBe(false);
    });
});
