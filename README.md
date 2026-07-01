# TrackListD — App Mobile

Aplicativo mobile do TrackListD, construído com **React Native** + **Expo Router**, usando **Firebase Auth** para login e consumindo a API do TrackListD (repositório separado) para os feeds de avaliações musicais.

Este documento explica:

1. [Como rodar o projeto pela primeira vez](#1-como-rodar-o-projeto-pela-primeira-vez)
2. [Como rodar o projeto no dia a dia](#2-como-rodar-o-projeto-no-dia-a-dia)
3. [Variáveis de ambiente](#3-variáveis-de-ambiente)
4. [Como funciona o roteamento (Expo Router)](#4-como-funciona-o-roteamento-expo-router)
5. [Estrutura de pastas](#5-estrutura-de-pastas)

---

## 1. Como rodar o projeto pela primeira vez

### Pré-requisitos

- **Node.js** (versão LTS mais recente — recomendado usar [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões)
- **npm** (já vem instalado junto com o Node)
- **Expo Go** instalado no celular ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) — ou um emulador Android/iOS configurado, se preferir testar em simulador
- Acesso ao repositório do **backend** (separado deste), rodando localmente ou já implantado, já que o app depende dele para os feeds (`/feed/global`, `/feed/me`)

### Passo a passo

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd <pasta-do-projeto>
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure o `.env` com as credenciais do Firebase.**

   Crie um arquivo `.env` na raiz do projeto com as chaves do Firebase — veja exatamente quais na seção [Variáveis de ambiente](#3-variáveis-de-ambiente). Sem isso, o login não funciona. Peça os valores a quem administra o projeto Firebase.

4. **Confira a porta esperada pela API.**

   A URL da API é resolvida automaticamente (sem `.env` — veja a seção [Variáveis de ambiente](#3-variáveis-de-ambiente) para entender como). Você só precisa garantir que o backend, quando rodando localmente, esteja escutando na porta **8080** — é essa porta que o app espera por padrão (`http://<host>:8080/api`).

5. **Inicie o backend** (no repositório separado), seguindo as instruções do README dele. Confirme que ele está escutando na porta `8080`, conforme o passo anterior. Se estiver testando em um celular físico, garanta que ele esteja na **mesma rede Wi-Fi** do computador.

6. **Inicie o projeto Expo:**

   ```bash
   npx expo start
   ```

7. **Abra o app:**
   - **No celular físico:** escaneie o QR Code exibido no terminal com o app **Expo Go**.
   - **No emulador Android:** com o emulador já aberto, pressione `a` no terminal.
   - **No simulador iOS** (somente macOS): pressione `i` no terminal.

Se tudo estiver certo, a landing page do TrackListD deve aparecer.

---

## 2. Como rodar o projeto no dia a dia

Depois da primeira configuração, o fluxo do dia a dia é mais simples:

```bash
# 1. Atualize sua branch com a main/develop
git pull

# 2. Sempre que o package.json mudar (alguém adicionou uma lib nova), reinstale
npm install

# 3. Garanta que o backend está rodando (repositório separado)

# 4. Suba o projeto
npx expo start
```

### Comandos úteis

| Comando | O que faz |
|---|---|
| `npx expo start` | Inicia o servidor de desenvolvimento (Metro Bundler) |
| `npx expo start -c` | Mesma coisa, mas limpa o cache — use se algo "estranho" estiver acontecendo (erros de import sem motivo aparente, mudanças que não refletem no app) |
| `npx expo start --android` | Abre direto no emulador Android |
| `npx expo start --ios` | Abre direto no simulador iOS (somente macOS) |

### Dica
Se você alterar arquivos de configuração nativos (`app.json`, plugins, etc.) ou instalar uma lib que tenha código nativo, pode ser necessário rodar `npx expo start -c` ou até reconstruir o app, dependendo do caso.

---

## 3. Variáveis de ambiente

O projeto depende de duas frentes de configuração externa: **Firebase** (autenticação) e a **URL da API** do backend. Diferente do que se vê em muitos projetos Expo, a URL da API **não** vem de um `.env` — ela é resolvida automaticamente em tempo de execução. Veja como funciona cada uma.

### 3.1. URL da API (resolução automática — não precisa configurar nada)

O arquivo `src/service/api.ts` (nome de exemplo) resolve o host da API automaticamente, sem precisar de `.env`:

```ts
function resolveHost(): string {
  if (Platform.OS === "web") {
    return "localhost";
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  const fallback = Platform.OS === "android" ? "10.0.2.2" : "localhost";

  return debuggerHost
    ? (debuggerHost.split(":").shift() ?? fallback)
    : fallback;
}

export const API_BASE_URL = `http://${resolveHost()}:8080/api`;
```

O que isso faz, na prática:

- **Web:** sempre usa `localhost`.
- **Celular físico ou emulador, rodando via Expo Go:** o Expo expõe o IP da sua máquina de desenvolvimento em `Constants.expoConfig.hostUri` (é o mesmo IP que aparece no QR Code do `npx expo start`). O `resolveHost` extrai esse IP automaticamente — por isso você **não precisa digitar o IP da sua máquina manualmente**, mesmo testando em um celular físico na mesma rede Wi-Fi.
- **Emulador Android, se por algum motivo `hostUri` não estiver disponível:** cai no fallback `10.0.2.2`, que é o endereço especial que o emulador Android usa para apontar para o `localhost` da máquina host.

Isso significa que, **para rodar localmente, basta garantir que**:
1. O backend esteja rodando na porta `8080` (`http://<seu-ip-ou-localhost>:8080/api`).
2. Seu celular (se for físico) esteja na **mesma rede Wi-Fi** que o computador rodando o Expo — já que é assim que o `hostUri` consegue apontar para o IP certo.

> Se no futuro o backend for implantado em produção (ex.: atrás de um domínio HTTPS), essa lógica de `resolveHost` precisará ser revisada — hoje ela está pensada para desenvolvimento local apenas (sempre monta a URL como `http://...:8080`, sem suporte a HTTPS ou a uma URL fixa de produção).

### 3.2. Autenticação nas chamadas à API

O arquivo de API também expõe `authFetch`, que deve ser usado para **qualquer chamada à API** (autenticada ou não):

```ts
export async function authFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  const currentUser = auth.currentUser;
  if (currentUser) {
    const idToken = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${idToken}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}
```

Como funciona:

- Se houver um usuário logado no Firebase, `authFetch` busca o **ID Token** atual dele e injeta automaticamente no header `Authorization: Bearer <token>`.
- Se não houver usuário logado, a requisição é enviada **sem** esse header, e o backend trata como uma chamada anônima (é assim que `/feed/global` funciona sem exigir login).
- **Importante:** `authFetch` não bloqueia nem valida nada — quem chama é responsável por garantir que existe um usuário logado quando a rota exige autenticação (ex.: antes de chamar `toggleLike`, certifique-se de que `auth.currentUser` não é `null`).

Exemplo de uso (curtir uma publicação):

```ts
export async function toggleLike(publicationId: number): Promise<LikeResponse> {
  const response = await authFetch(`/publications/${publicationId}/like`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Falha ao curtir publicação: ${response.status}`);
  }

  return response.json();
}
```

### 3.3. Firebase (configuração do projeto)

O arquivo `src/service/firebase.ts` inicializa o Firebase Auth (login com Google, logout, emissão do ID Token usado pelo `authFetch`). As credenciais do projeto Firebase (`apiKey`, `projectId`, etc.) vêm de variáveis de ambiente, usando o prefixo `EXPO_PUBLIC_` exigido pelo Expo para expor a variável ao código do app:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Crie um arquivo `.env` na raiz do projeto com essas chaves preenchidas (confirme que `.env` está no `.gitignore` — ele nunca deve ser commitado). Peça os valores reais a quem administra o projeto Firebase, ou pegue no [Firebase Console](https://console.firebase.google.com/), em **Configurações do projeto → Geral → Seus apps**.

> Depois de criar ou alterar o `.env`, **reinicie o Expo com cache limpo** (`npx expo start -c`) — variáveis de ambiente só são lidas quando o bundler reinicia.

---

## 4. Como funciona o roteamento (Expo Router)

O projeto usa **Expo Router**, que segue o modelo de **roteamento baseado em arquivos** (igual ao Next.js): a estrutura de pastas e arquivos dentro de `app/` define as rotas do app automaticamente. Não existe um arquivo central de configuração de rotas — a própria organização de pastas *é* a configuração.

### Conceitos principais

- **Cada arquivo dentro de `app/` é uma tela/rota.**
  Exemplo: `app/login.tsx` vira a rota `/login`. `app/index.tsx` vira a rota raiz (`/`).

- **`_layout.tsx` define como as rotas daquela pasta se organizam.**
  Não é uma rota navegável — é um componente "molde" que envolve as rotas-filhas. Pode ser um `Stack` (telas empilhadas, com transição de "entrar/voltar"), um `Tabs` (abas inferiores), um `Drawer`, etc.

- **Pastas criam agrupamento e podem ter rotas dinâmicas.**
  `app/feed/global.tsx` vira `/feed/global`. Arquivos entre colchetes como `app/post/[id].tsx` criam rotas dinâmicas (ex.: `/post/123`, onde `123` fica disponível via `useLocalSearchParams()`).

- **`index.tsx` é o "padrão" de uma pasta.**
  Assim como em endereços web, `index` representa a raiz daquele nível. `app/index.tsx` → `/`. `app/feed/index.tsx` (se existisse) → `/feed`.

### Como está organizado neste projeto

```
app/
├── _layout.tsx          → Layout raiz (Stack). Define o ThemeProvider e quais
│                           telas existem no nível mais alto: index, login, feed.
│
├── index.tsx             → Rota "/" — landing page do app (pública, antes do login)
│
├── login.tsx             → Rota "/login" — tela de autenticação (Google via Firebase)
│
└── feed/
    ├── _layout.tsx       → Layout do grupo "feed" (Tabs). Define as abas inferiores:
    │                        "Global" e "Para Você".
    ├── global.tsx        → Rota "/feed/global" — feed público, visível a qualquer usuário
    └── me.tsx            → Rota "/feed/me" — feed personalizado, exige login
```

### Navegação entre telas

A navegação programática é feita com o hook `useRouter`, do próprio Expo Router:

```ts
import { useRouter } from "expo-router";

const router = useRouter();

router.push("/login");      // navega para /login (login.tsx)
router.push("/feed/global"); // navega para /feed/global (feed/global.tsx)
```

### Headers

O `headerShown: false` controla se aparece (ou não) aquele cabeçalho automático do Stack Navigator (a barrinha com seta de voltar e o nome do arquivo como título). No `_layout.tsx` raiz, isso é configurado por tela:

```tsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="feed" options={{ headerShown: false }} />
</Stack>
```

Cada tela dentro de `app/` que **não** estiver listada (ou que não tenha `headerShown: false`) vai usar o header padrão do React Navigation, com o nome do arquivo como título — por isso é importante adicionar toda nova rota de topo nessa lista, caso não se queira esse header.

### Resumo mental

> Se você quer adicionar uma tela nova, normalmente **não precisa configurar rota nenhuma** — basta criar o arquivo no lugar certo dentro de `app/`. O Expo Router cuida do resto. As únicas configurações manuais necessárias são: header (mostrar/esconder) e, se for o caso, agrupar a tela em um `_layout.tsx` (Stack, Tabs, Drawer) caso ela precise de navegação irmã.

---

## 5. Estrutura de pastas

```
.
├── app/                  → Rotas (Expo Router) — ver seção 4
├── src/
│   ├── components/       → Componentes reutilizáveis (ex.: FeedList)
│   ├── service/          → Integrações externas (ex.: firebase.ts, api.ts)
│   └── hooks/             → Hooks customizados (ex.: use-color-scheme)
├── app.json              → Configuração do app Expo (nome, ícone, splash, plugins)
├── package.json
└── .env                  → Credenciais do Firebase (não commitado — ver seção 3.3)
```

> A URL da API **não** depende do `.env` — ela é resolvida automaticamente em tempo de execução (ver seção 3.1). O `.env` existe apenas para as credenciais do Firebase.

---

## Dúvidas frequentes

**O login com Google não funciona / app trava na tela de login.**
Confirme se o `.env` existe na raiz do projeto com todas as chaves `EXPO_PUBLIC_FIREBASE_*` preenchidas corretamente (seção 3.3). Depois de criar ou editar o `.env`, reinicie com `npx expo start -c`.

**O app não conecta com a API.**
Confirme se o backend está rodando na porta `8080`. Se estiver testando em celular físico, confirme que ele está na **mesma rede Wi-Fi** do computador — é assim que o `resolveHost` consegue descobrir o IP correto via `Constants.expoConfig.hostUri`. Reiniciar o Expo (`npx expo start -c`) também ajuda, já que esse `hostUri` é capturado quando o bundler inicia.

**Estou recebendo erro 401/403 em rotas que deveriam exigir login.**
Confirme se há um usuário logado (`auth.currentUser`) antes de chamar a rota. `authFetch` só envia o token se já existir um usuário autenticado — ele não bloqueia nem avisa se não houver.

**Apareceu um header com o nome de um arquivo que eu não queria.**
Verifique o `app/_layout.tsx` (ou o `_layout.tsx` da pasta correspondente) e adicione `headerShown: false` para aquela rota.
