import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { FIREBASE_CONFIG } from './_firebase-config';

firebase.initializeApp(FIREBASE_CONFIG);

import { InjectionToken } from '@angular/core';

export type Firestore = firebase.firestore.Firestore;
const store = firebase.firestore();
export const FIRESTORE = new InjectionToken('Firestore DI', {
  providedIn: 'root',
  factory: () => store
});


export type FirebaseAuth = firebase.auth.Auth;
const auth = firebase.auth();
export const FIREBASE_AUTH = new InjectionToken('Firestore DI', {
  providedIn: 'root',
  factory: () => auth
});
