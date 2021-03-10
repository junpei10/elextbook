import { inject, InjectionToken } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export type UrlChanges = Observable<NavigationEnd>;
export const URL_CHANGES = new InjectionToken('It Can detects route changes', {
  providedIn: 'root',
  factory: () => inject(Router).events
    .pipe(filter((event) => event instanceof NavigationEnd))
});



export type RouteChanges = Observable<NavigationEnd>;
export const ROUTE_CHANGES = new InjectionToken('It Can detects route changes', {
  providedIn: 'root',
  factory: () => {
    const subject = new Subject();
    const locationRef = location;
    let prevPathname: string;

    inject(URL_CHANGES).subscribe((event) => {
      const prev = prevPathname;
      const current = locationRef.pathname;
      if (prev !== current) {
        subject.next(event);
      }

      prevPathname = current;
    });

    return subject.asObservable();
  }
});
