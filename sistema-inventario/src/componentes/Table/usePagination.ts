import { useState } from 'react';

const pageSizeOptions = [10, 50, 100] as const;

export function usePagination<T>(items: T[]) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(pageSizeOptions[0]);
    const pageCount = Math.ceil(items.length / pageSize);
    const currentPage = Math.min(page, Math.max(1, pageCount));

    return {
        items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        page: currentPage,
        pageSize,
        pageCount,
        setPage: (nextPage: number) => setPage(Math.min(Math.max(1, nextPage), Math.max(1, pageCount))),
        setPageSize: (nextPageSize: number) => {
            setPageSize(nextPageSize);
            setPage(1);
        },
    };
}
