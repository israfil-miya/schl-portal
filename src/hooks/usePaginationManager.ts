// usePaginationManager.ts
import { useEffect, useRef } from 'react';

export interface PaginationOpts {
  page: number;
  itemPerPage: number;
  pageCount: number;
  setPage: (n: number) => void;
  triggerFetch: () => void;
}

export function usePaginationManager({
  page,
  itemPerPage,
  pageCount,
  setPage,
  triggerFetch,
}: PaginationOpts) {
  const didMountRef = useRef(false);

  // track previous values
  const prevPageRef = useRef(page);
  const prevIPPRef = useRef(itemPerPage);
  const prevPageCountRef = useRef(pageCount);

  // flags to suppress duplicate fetches
  const ippChangedRef = useRef(false);
  const skipNextPageCountFetchRef = useRef(false);

  // 1) Initial mount → fetch once
  useEffect(() => {
    triggerFetch();
    didMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once

  // 5) Changing items-per-page → reset to page 1
  useEffect(() => {
    if (prevIPPRef.current !== itemPerPage) {
      ippChangedRef.current = true;
      skipNextPageCountFetchRef.current = true; // suppress the pageCount effect
      setPage(1);
    }
  }, [itemPerPage, setPage]);

  // 5b) After we reset page to 1 for the new IPP → fire exactly one fetch
  useEffect(() => {
    if (!didMountRef.current) return;

    if (ippChangedRef.current && page === 1) {
      triggerFetch();
      // sync our refs
      prevIPPRef.current = itemPerPage;
      prevPageRef.current = 1;
      ippChangedRef.current = false;
    }
  }, [page, itemPerPage, triggerFetch]);

  // 2,3,4) Page changes (inline, jump, first, last) → one fetch
  useEffect(() => {
    if (!didMountRef.current) return;

    // if we're already handling the ipp-reset above, bail out
    if (ippChangedRef.current) return;

    const pageChanged = prevPageRef.current !== page;
    if (pageChanged) {
      triggerFetch();
      prevPageRef.current = page;
      prevIPPRef.current = itemPerPage;
    }
  }, [page, itemPerPage, triggerFetch]);

  // // 6) pageCount changes → fetch once (unless skipped)
  // useEffect(() => {
  //   if (!didMountRef.current) return;

  //   if (prevPageCountRef.current !== pageCount) {
  //     if (skipNextPageCountFetchRef.current) {
  //       skipNextPageCountFetchRef.current = false;
  //     } else {
  //       triggerFetch();
  //     }
  //     prevPageCountRef.current = pageCount;
  //   }
  // }, [pageCount, triggerFetch]);
}
