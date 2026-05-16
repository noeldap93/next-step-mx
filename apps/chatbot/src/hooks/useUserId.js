import { useMemo } from 'react';

export default function useUserId() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('user_id') || params.get('userId');
    if (!id) return null;
    const trimmed = id.trim();
    if (!trimmed) return null;
    return trimmed;
  }, []);
}
