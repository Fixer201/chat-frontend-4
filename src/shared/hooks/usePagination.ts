import { useState } from 'react';

export function usePagination(initialPage = 1, pageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size] = useState(pageSize);

  return { page, size, setPage };
}
