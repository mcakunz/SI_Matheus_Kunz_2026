# Prática Profissional — ERP

Sistema de gestão ERP desenvolvido com **Next.js**, **React**, **MUI DataGrid** e **Supabase**.

---

## Pré-requisitos

- **[Node.js](https://nodejs.org/)** v20.9 ou superior
- **[Git](https://git-scm.com)**

---

## Passo 1 — Clonar e instalar

```bash
git clone https://github.com/mcakunz/SI_Matheus_Kunz_2026
cd pratica-profissional
npm install
```

---

## Passo 2 — Configurar as variáveis de ambiente

Na raiz do projeto, crie um arquivo chamado **`.env.local`** com as credenciais abaixo:

```env
NEXT_PUBLIC_SUPABASE_URL=<URL_FORNECIDA>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<CHAVE_FORNECIDA>
```

## Passo 3 — Rodar o projeto

```bash
npm run dev
```

Acesse em: **http://localhost:3000**

---

## Inspecionar o banco de dados

Há duas formas de visualizar e consultar os dados diretamente:

### Via Supabase Studio (navegador, sem instalar nada)

Após aceitar o convite recebido por e-mail, acesse:

```
https://supabase.com/dashboard
```

Selecione o projeto **Prática Profissional** — todas as tabelas, dados e o editor SQL estarão disponíveis.

---

### Via DBeaver, DataGrip ou outro cliente SQL

<img width="1607" height="805" alt="image" src="https://github.com/user-attachments/assets/6e056593-c9f4-4166-8c83-7076d9cb5a5a" />


As credenciais de conexão direta ao banco estão no painel do Supabase:

**Project Settings → Database → Connection string**

Ou use os campos abaixo (também disponíveis no painel):

| Campo | Valor |
|---|---|
| Host | `<HOST_DO_PROJETO>.supabase.co` |
| Porta | `5432` |
| Database | `postgres` |
| Usuário | `postgres` |
| Senha | *( ******)* |

> No DBeaver: Nova conexão → PostgreSQL → preencha os campos acima → **Testar conexão**.
