import { readFileSync } from 'node:fs';
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    it,
} from 'vitest';
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';

const projectId = 'demo-sistema-inventario-rules';
const collections = ['products', 'movements', 'categories', 'suppliers'] as const;
const documentIds: Record<(typeof collections)[number], string> = {
    products: 'product-1',
    movements: 'movement-1',
    categories: 'general',
    suppliers: 'supplier-1',
};
let testEnv: RulesTestEnvironment;

const categoryData = () => ({
    name: 'General',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
});

const supplierData = () => ({
    name: 'Proveedor',
    phone: '',
    email: '',
    address: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
});

const productData = (
    movementId: string | null = null,
    stock = 0,
    movementCount = 0,
    code = 'product-1',
) => ({
    code,
    name: 'Producto',
    category: 'General',
    price: 0,
    unit: 'unidad',
    unitAmount: 1,
    active: true,
    stock,
    minStock: 0,
    movementCount,
    lastMovementId: movementId,
    updatedAt: serverTimestamp(),
});

describe('firestore security rules', () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId,
            firestore: {
                rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'),
                host: '127.0.0.1',
                port: 8080,
            },
        });
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    it('denies unauthenticated document reads, collection reads, and writes everywhere', async () => {
        const db = testEnv.unauthenticatedContext().firestore();
        const checks = collections.flatMap((name) => {
            const path = `organizations/org-a/${name}/test-doc`;
            return [
                assertFails(getDoc(doc(db, path))),
                assertFails(getDocs(collection(db, `organizations/org-a/${name}`))),
                assertFails(setDoc(doc(db, path), { probe: true })),
            ];
        });

        await Promise.all(checks);
    });

    it('allows inventory access only within the authenticated user org', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await setDoc(doc(db, 'organizations/user-a/categories/general'), {
                name: 'General',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            await setDoc(doc(db, 'organizations/user-b/products/product-1'), {
                ...productData(null),
                updatedAt: Timestamp.now(),
            });
            await setDoc(doc(db, 'organizations/user-b/movements/movement-1'), {
                productId: 'product-1',
                productName: 'Producto',
                type: 'entrada',
                quantity: 1,
                note: 'Stock inicial',
                createdBy: 'user-b',
                createdAt: Timestamp.now(),
            });
            await setDoc(doc(db, 'organizations/user-b/categories/general'), {
                name: 'General',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            await setDoc(doc(db, 'organizations/user-b/suppliers/supplier-1'), {
                name: 'Proveedor',
                phone: '',
                email: '',
                address: '',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        });

        const db = testEnv.authenticatedContext('user-a').firestore();
        await assertSucceeds(getDoc(doc(db, 'organizations/user-a/categories/general')));

        const readChecks = collections.flatMap((name) => [
            assertFails(getDoc(doc(db, `organizations/user-b/${name}/${documentIds[name]}`))),
            assertFails(getDocs(collection(db, `organizations/user-b/${name}`))),
        ]);
        await Promise.all(readChecks);

        await assertFails(setDoc(doc(db, 'organizations/user-b/categories/new-category'), categoryData()));
        await assertFails(setDoc(doc(db, 'organizations/user-b/suppliers/new-supplier'), supplierData()));
        await assertFails(setDoc(
            doc(db, 'organizations/user-b/products/new-product'),
            productData(null, 0, 0, 'new-product'),
        ));

        const batch = writeBatch(db);
        const movementId = 'new-movement';
        batch.set(doc(db, `organizations/user-b/products/${movementId}`), productData(movementId, 2, 1, movementId));
        batch.set(doc(db, `organizations/user-b/movements/${movementId}`), {
            productId: movementId,
            productName: 'Producto',
            type: 'entrada',
            quantity: 2,
            note: 'Stock inicial',
            createdBy: 'user-a',
            createdAt: serverTimestamp(),
        });
        await assertFails(batch.commit());
    });

    it('denies a normal user access to undeclared restricted-role data', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
                doc(context.firestore(), 'organizations/user-a/restricted/private-records/records/secret'),
                { value: 'restricted' },
            );
        });

        const db = testEnv.authenticatedContext('user-a', { role: 'user' }).firestore();
        const restrictedDoc = doc(db, 'organizations/user-a/restricted/private-records/records/secret');
        await assertFails(getDoc(restrictedDoc));
        await assertFails(setDoc(restrictedDoc, { value: 'changed' }));
    });
});
