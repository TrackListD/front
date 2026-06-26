import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../service/firebase";

let currentUser: User | null = null;
let readyPromise: Promise<User | null>;

export function initAuthListener() {
  readyPromise = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      resolve(user);
    });
  });

  return readyPromise;
}

export function getCurrentUser() {
  return currentUser;
}

export function waitForAuth() {
  return readyPromise;
}
