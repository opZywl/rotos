

### It's a questionnaire platform.


#### Features
- Post questions
- Voting system
- Collections
- Global data search
- AI generated answers
- Light/dark mode 


#### Technologies Used
-  ***Next.js 14***
-  ***TypeScript*** 
-  ***TailwindCSS*** 
-  ***MongoDB*** 
- ***Clerk Auth***
- ***GeminiAi*** 
- ***Zod*** 
- ***ESLint*** 
- ***Prettier*** 
- ***Shadcn***



## Contributing

Contributions are welcome! If you encounter any bugs, have feature requests, or want to contribute improvements, please open an issue or submit a pull request.

## Configuração local

### Pré-requisitos
- Node.js (recomendado: LTS)
- npm
- Conta no MongoDB Atlas (ou MongoDB local)
- Conta no Clerk (autenticação)
- Conta no Google AI Studio (Gemini)
- Conta no TinyMCE (Editor)

### Passo a passo
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env.local` na raiz do projeto (mesmo nível do `package.json`).
3. Preencha as variáveis de ambiente conforme abaixo.
4. Inicie o servidor:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000`.

### Variáveis de ambiente (.env.local)

```bash
# Banco de dados
MONGODB_URL="mongodb+srv://<usuario>:<senha>@<cluster>/<db>?retryWrites=true&w=majority"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_CLERK_WEBHOOK_SECRET="whsec_..."

# TinyMCE
NEXT_PUBLIC_TINY_EDITOR_API_KEY="your-tinymce-api-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# URL pública do app (usada no client para chamar a API)
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

### Como obter as chaves

**MongoDB**
1. Crie um cluster no MongoDB Atlas.
2. Crie um usuário de banco e libere o IP da sua máquina.
3. Copie a string de conexão e substitua em `MONGODB_URL`.

**Clerk**
1. Crie uma aplicação no painel do Clerk.
2. Copie `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY`.
3. Configure o webhook de `user.created`, `user.updated` e `user.deleted`.
4. Copie o `Signing Secret` do webhook e preencha `NEXT_CLERK_WEBHOOK_SECRET`.

**Gemini**
1. Acesse o Google AI Studio.
2. Gere uma API key e preencha `GEMINI_API_KEY`.

**TinyMCE**
1. Crie uma conta no TinyMCE.
2. Gere a API key e preencha `NEXT_PUBLIC_TINY_EDITOR_API_KEY`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
