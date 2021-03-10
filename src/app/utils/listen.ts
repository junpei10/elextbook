type AddEventListener = EventTarget['addEventListener'];
type RemoveEventListener = EventTarget['removeEventListener'];

export interface ListenTarget {
  addEventListener: AddEventListener;
  removeEventListener: RemoveEventListener;
}

export function listen(target: ListenTarget, eventName: string, callback: (event: any) => any): () => void {
  target.addEventListener(eventName, callback);
  return () => target.removeEventListener(eventName, callback);
}

export function createListenTarget(base: ListenTarget): ListenTarget {
  return {
    addEventListener: base.addEventListener.bind(base),
    removeEventListener: base.removeEventListener.bind(base)
  };
}
