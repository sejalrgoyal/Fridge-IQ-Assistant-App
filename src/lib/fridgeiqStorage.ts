export const FRIDGEIQ_STORAGE_EVENT = 'fridgeiq-storage-updated';

type StorageChangeDetail = { key: string };

const isBrowser = typeof window !== 'undefined';

export const setFridgeiqItem = (key: string, value: string) => {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
  window.dispatchEvent(
    new CustomEvent<StorageChangeDetail>(FRIDGEIQ_STORAGE_EVENT, {
      detail: { key },
    }),
  );
};

export const subscribeFridgeiqKeys = (keys: string[], onChange: () => void) => {
  if (!isBrowser) return () => undefined;

  const keySet = new Set(keys);

  const handleStorage = (event: StorageEvent) => {
    if (event.key && keySet.has(event.key)) onChange();
  };

  const handleCustom = (event: Event) => {
    const customEvent = event as CustomEvent<StorageChangeDetail>;
    const changedKey = customEvent.detail?.key;
    if (changedKey && keySet.has(changedKey)) onChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(FRIDGEIQ_STORAGE_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(FRIDGEIQ_STORAGE_EVENT, handleCustom as EventListener);
  };
};