export type ClassAnimateType = 'leave' | 'enter';

export class ClassAnimation {
  private _timeout: number;
  private _previousBaseClassName: string;

  get animateRef(): this['animate'] {
    return this.animate.bind(this);
  }

  constructor(private _targetClassList: DOMTokenList) {}

  animate(type: ClassAnimateType, className: string, duration: number): Promise<void> {
    const classList = this._targetClassList;

    const timeout = this._timeout;
    if (timeout) {
      clearTimeout(timeout);
      this._timeout = 0; // いらないかも

      const prevNameBase = this._previousBaseClassName;
      classList.remove(prevNameBase + '-action', prevNameBase + '-to');
    }

    const baseClass = className + '-' + type;
    const toClass = baseClass + '-to';
    const activeClass = baseClass + '-active';

    this._previousBaseClassName = baseClass;

    // add [.ex] and [.ex-active]
    classList.add(baseClass, activeClass);

    return new Promise(resolve =>
      setTimeout(() => {
        classList.remove(baseClass);
        classList.add(toClass);

        this._timeout = setTimeout(() => {
          // remove [.ex-to] and [.ex-active]
          classList.remove(toClass, activeClass);
          this._timeout = 0;
          resolve();
        }, duration) as any;
      }, 10)
    );
  }
}

