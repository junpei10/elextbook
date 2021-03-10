export * from './insert-style-element';
export * from './listen';
export * from './noop';
export * from './divided-zone';
export * from './token.service';
export * from './class-animate';

import { Observable, Observer, Subject, Subscription } from 'rxjs';


export type Class<T, A extends any[] = any[]> = new (...arg: A) => T;

interface OverwriteObservable<T> extends Observable<T> { subscribe: any; }
export interface NoCompleteObservable<T> extends OverwriteObservable<T> {
  subscribe(observer?: Observer<T>): Subscription;
  subscribe(next: null | undefined, error: null | undefined): Subscription;
  subscribe(next: null | undefined, error: (error: any) => void): Subscription;
  subscribe(next: (value: T) => void, error: null | undefined): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void): Subscription;
}

interface OverwriteSubjectBase<T> extends Subject<T> { complete: never; asObservable(): any; }
type OverwriteSubject<T> = OverwriteSubjectBase<T> & OverwriteObservable<T>;
export interface NoCompleteSubject<T> extends OverwriteSubject<T> {
  complete: never;
  asObservable(): NoCompleteObservable<T>;
}


