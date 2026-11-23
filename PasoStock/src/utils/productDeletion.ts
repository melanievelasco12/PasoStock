import type { Movement, Product } from '../types';

export function canDeleteProduct(product: Product, movements: Movement[]): boolean {
    const productMovements = movements.filter((movement) => movement.productId === product.id);
    if (product.movementCount === 0) {
        return product.stock === 0 && productMovements.length === 0;
    }
    if (product.movementCount !== 1 || product.stock <= 0 || !product.lastMovementId || productMovements.length !== 1) {
        return false;
    }
    const [movement] = productMovements;
    return movement.id === product.lastMovementId
        && movement.type === 'entrada'
        && movement.note === 'Stock inicial'
        && movement.quantity === product.stock;
}
