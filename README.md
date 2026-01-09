# Rotōs - Q&A Platform

Uma plataforma de perguntas e respostas construída com Next.js 14, MongoDB, e Clerk Authentication.

## Features

- Post questions
- Voting system
- Collections (salvar perguntas)
- Global data search
- AI generated answers (Gemini)
- Light/dark mode
- Sistema de badges e reputação

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **MongoDB** - Banco de dados
- **Clerk Auth** - Autenticação
- **Gemini AI** - Respostas com IA
- **TinyMCE** - Editor de texto rico
- **Shadcn/ui** - Componentes UI
- **Zod** - Validação de schemas

---

## Deploy na Vercel (Passo a Passo Completo)

### 1. Preparar Repositório

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

### 2. Configurar MongoDB Atlas (Banco de Dados)

> **Importante:** o Prisma **não hospeda MongoDB**. O app usa **Mongoose** e precisa de um cluster MongoDB real (ex.: MongoDB Atlas). O site do Prisma é ótimo para **documentação**, mas a criação do banco MongoDB continua sendo feita no Atlas. Use o Prisma apenas como referência de integração se desejar.

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta ou faça login
3. Clique em **"Build a Database"**
4. Escolha **"M0 FREE"** (gratuito)
5. Selecione a região (ex: São Paulo - `sa-east-1`)
6. Clique em **"Create"**

#### Configurar Acesso ao Banco:

**Database Access (Usuário):**
1. Vá em **Security** → **Database Access**
2. Clique em **"Add New Database User"**
3. Preencha:
   - Username: `rotos_admin`
   - Password: (gere uma senha segura, anote!)
   - Role: `Atlas Admin`
4. Clique em **"Add User"**

**Network Access (IP):**
1. Vá em **Security** → **Network Access**
2. Clique em **"Add IP Address"**
3. Clique em **"Allow Access from Anywhere"**
4. Isso adiciona `0.0.0.0/0` (necessário para Vercel)
5. Clique em **"Confirm"**

#### Obter Connection String:

1. Vá em **Deployment** → **Database**
2. Clique em **"Connect"** no seu cluster
3. Escolha **"Connect your application"**
4. Driver: `Node.js`, Version: `5.5 or later`
5. Copie a string:
```
mongodb+srv://rotos_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. **IMPORTANTE:** Substitua `<password>` pela senha que você criou

---

### 3. Configurar Clerk (Autenticação)

1. Acesse [Clerk Dashboard](https://dashboard.clerk.com/)
2. Clique em **"Create application"**
3. Dê um nome (ex: "Rotos")
4. Selecione os métodos de login (Google, Email, etc.)
5. Clique em **"Create application"**

#### Obter Chaves de API:

1. No dashboard do app, vá em **"API Keys"**
2. Copie:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (começa com `pk_`)
   - `CLERK_SECRET_KEY` (começa com `sk_`)

#### Configurar Webhook:

1. Vá em **"Webhooks"** no menu lateral
2. Clique em **"Add Endpoint"**
3. **Endpoint URL:** `https://SEU-DOMINIO.vercel.app/api/webhook`
   - (você vai atualizar isso depois do deploy)
4. **Subscribe to events:**
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Clique em **"Create"**
6. Copie o **"Signing Secret"** (começa com `whsec_`)

---

### 4. Configurar TinyMCE (Editor)

1. Acesse [TinyMCE](https://www.tiny.cloud/)
2. Crie uma conta gratuita
3. Vá em **"Dashboard"**
4. Copie sua **API Key**
5. Em **"Approved Domains"**, adicione:
   - `localhost`
   - `*.vercel.app`
   - Seu domínio personalizado (se tiver)

---

### 5. Configurar Gemini AI (Opcional)

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Clique em **"Get API Key"**
3. Crie uma nova API Key
4. Copie a chave

---

### 6. Deploy na Vercel

1. Acesse [Vercel](https://vercel.com/)
2. Faça login com GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione seu repositório `rotos`
5. **Framework Preset:** Next.js (automático)

#### Configurar Environment Variables:

Clique em **"Environment Variables"** e adicione:

| Name | Value |
|------|-------|
| `MONGODB_URL` | `mongodb+srv://rotos_admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxx...` |
| `CLERK_SECRET_KEY` | `sk_live_xxxx...` |
| `NEXT_CLERK_WEBHOOK_SECRET` | `whsec_xxxx...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |
| `NEXT_PUBLIC_TINY_EDITOR_API_KEY` | `sua-tinymce-api-key` |
| `GEMINI_API_KEY` | `sua-gemini-api-key` |
| `NEXT_PUBLIC_SERVER_URL` | `https://seu-dominio.vercel.app` |

6. Clique em **"Deploy"**
7. Aguarde o build (2-5 minutos)

---

### 7. Atualizar Webhook URL no Clerk

Após o deploy bem-sucedido:

1. Copie a URL do seu app (ex: `https://rotos-abc123.vercel.app`)
2. Volte ao **Clerk Dashboard** → **Webhooks**
3. Edite o endpoint criado
4. Atualize a URL para:
```
https://rotos-abc123.vercel.app/api/webhook
```
5. Clique em **"Save"**

---

### 8. Testar o Deploy

1. Acesse sua URL da Vercel
2. Tente criar uma conta
3. Verifique se o usuário aparece no MongoDB Atlas
4. Tente criar uma pergunta

---

## Guia 100% Online (via Prisma + MongoDB Atlas)

Este passo a passo é **totalmente online** e usa o **site do Prisma** apenas como referência de documentação.

### 1. Abrir documentação oficial do Prisma (referência)

1. Acesse https://www.prisma.io/
2. Clique em **Docs**
3. Procure por **MongoDB** para entender conceitos de conexão e boas práticas

> Dica: este projeto não usa Prisma ORM, mas a documentação ajuda a entender strings de conexão e ambiente.

### 2. Criar o MongoDB no Atlas (100% online)

1. Acesse https://www.mongodb.com/atlas
2. Crie um **cluster gratuito (M0)**
3. Crie usuário e senha em **Database Access**
4. Libere IP em **Network Access** com `0.0.0.0/0`
5. Copie a **connection string** do driver **Node.js**

### 3. Colocar a URL do MongoDB na Vercel

1. Acesse o projeto na **Vercel**
2. Em **Settings → Environment Variables**, adicione:
   - `MONGODB_URL` = `mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster0.../`
3. Salve e **redeploy** o projeto

---

## Troubleshooting: "Application error: a server-side exception has occurred"

Esse erro costuma indicar **variáveis de ambiente faltando** ou **erro de conexão com o banco**.

### Checklist rápido

1. **Verifique os logs na Vercel**
   - Projeto → **Deployments** → abra o último deploy → **View Logs**
2. **Confirme as variáveis obrigatórias**
   - `MONGODB_URL`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `NEXT_CLERK_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SERVER_URL`
3. **Confirme o MongoDB Atlas**
   - IP liberado `0.0.0.0/0`
   - Usuário e senha corretos
4. **Force redeploy**
   - Após atualizar envs, clique em **Redeploy**

Se o erro persistir, verifique nos logs da Vercel qual variável está ausente ou qual endpoint falhou.

---

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+ (recomendado: LTS)
- npm ou yarn
- Conta no MongoDB Atlas
- Conta no Clerk
- Conta no TinyMCE

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/rotos.git
cd rotos

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas chaves

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Arquivo .env.local

```env
# MongoDB Atlas
MONGODB_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/?retryWrites=true&w=majority"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_CLERK_WEBHOOK_SECRET="whsec_..."

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# TinyMCE Editor
NEXT_PUBLIC_TINY_EDITOR_API_KEY="sua-api-key"

# Gemini AI
GEMINI_API_KEY="sua-api-key"

# Server URL
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

### Webhook Local (ngrok)

Para testar webhooks localmente:

```bash
# Instale ngrok
npm install -g ngrok

# Exponha sua porta local
ngrok http 3000
```

Use a URL do ngrok no Clerk Webhook durante desenvolvimento.

---

## Estrutura do Projeto

```
rotos/
├── app/                      # App Router (Next.js 14)
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/              # Páginas principais
│   │   ├── ask-question/    # Criar pergunta
│   │   ├── collection/      # Perguntas salvas
│   │   ├── community/       # Lista de usuários
│   │   ├── onboarding/      # Setup de username
│   │   ├── profile/         # Perfil do usuário
│   │   ├── question/        # Detalhes da pergunta
│   │   └── tags/            # Perguntas por tag
│   └── api/
│       └── webhook/         # Webhook do Clerk
├── components/
│   ├── cards/              # Cards (Question, User, Answer)
│   ├── forms/              # Formulários
│   ├── shared/             # Componentes compartilhados
│   └── ui/                 # Componentes Shadcn
├── database/               # Modelos Mongoose
├── lib/
│   ├── actions/           # Server Actions
│   ├── validations.ts     # Schemas Zod
│   └── mongoose.ts        # Conexão MongoDB
├── hooks/                  # React Hooks customizados
├── constants/             # Constantes e configurações
├── types/                 # TypeScript types
└── public/                # Assets estáticos
```

---

## Troubleshooting

### "MongoDB connection failed"
- ✅ Verifique se `0.0.0.0/0` está na Network Access
- ✅ Confirme que a senha não tem caracteres especiais não escapados
- ✅ Teste a connection string no MongoDB Compass

### "Clerk webhook failed"
- ✅ Verifique se a URL termina com `/api/webhook`
- ✅ Confirme que `NEXT_CLERK_WEBHOOK_SECRET` está correto
- ✅ Veja os logs em Clerk Dashboard → Webhooks → Logs

### "Usuários não sincronizam com MongoDB"
- ✅ Webhook não está configurado ou URL está errada
- ✅ Verifique os eventos selecionados no webhook

### "Editor não carrega"
- ✅ Domínio não está aprovado no TinyMCE
- ✅ API Key incorreta ou expirada

### "Build failed na Vercel"
- ✅ Verifique se todas as env vars estão configuradas
- ✅ Veja os logs de build na Vercel

---

## Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar produção
npm run lint     # Verificar linting
```

---

## Links Úteis

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [TinyMCE Docs](https://www.tiny.cloud/docs/)

---

## Contributing

Contributions are welcome! If you encounter any bugs, have feature requests, or want to contribute improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
