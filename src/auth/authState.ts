import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../service/firebase";

let currentUser: User | null = null;

// A Promise é criada já na importação do módulo, então não depende
// de ninguém chamar uma função de init antes de usar waitForAuth().
const readyPromise: Promise<User | null> = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser = user;
    resolve(user);
    unsubscribe(); // só precisamos da primeira resolução aqui
  });
});

// Mantém currentUser atualizado em mudanças futuras (login/logout/refresh).
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

export function getCurrentUser() {
  return currentUser;
}

export function waitForAuth() {
  return readyPromise;
}

export function initAuthListener() {
  return readyPromise;
}
