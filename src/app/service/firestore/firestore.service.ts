import { InjectionToken } from '@angular/core';

import firebase from 'firebase/app';
import 'firebase/firestore';

export type Firestore = firebase.firestore.Firestore;

const store = firebase.firestore();
export const FIRESTORE = new InjectionToken('Firestore DI', {
  providedIn: 'root',
  factory: () => store
});


