import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../service/firebase";

let currentUser: User | null = null;
let isReady = false;

const readyPromise: Promise<User | null> = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser = user;
    isReady = true;
    resolve(user);
    unsubscribe();
  });
});

// Mantém currentUser atualizado em mudanças futuras (login/logout/refresh).
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  isReady = true;
});

export function getCurrentUser() {
  return currentUser;
}

export async function waitForAuth(): Promise<User | null> {
  if (isReady) {
    return currentUser;
  }
  return readyPromise;
}

export function initAuthListener() {
  return readyPromise;
}
