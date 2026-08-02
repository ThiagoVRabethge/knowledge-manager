# Knowledge Manager

Gerenciador de conhecimento minimalista em Markdown, inspirado no design da Apple.

## Tecnologias

- **Backend**: FastAPI + SQLModel + SQLite
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui

## Funcionalidades

- ✅ Criar, editar e excluir notas em Markdown
- ✅ Criar pastas aninhadas para organizar notas
- ✅ Wiki-links com sintaxe `[[Título da Nota]]`
- ✅ Backlinks automáticos (quem referencia esta nota)
- ✅ Busca full-text em tempo real
- ✅ Tema claro/escuro
- ✅ Auto-save a cada 2 segundos
- ✅ Exportar todas as notas como `.md` em ZIP
- ✅ Design minimalista inspirado na Apple

## Estrutura

```
knowledge-manager/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── routers/
│   │       ├── folders.py
│   │       ├── notes.py
│   │       └── export.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   ├── hooks/
    │   ├── types/
    │   └── lib/
    ├── package.json
    └── ...
```

## Instalação e Execução

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

O backend estará disponível em `http://localhost:8000`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Uso

- Crie pastas e notas pelo menu lateral
- Use `[[Título da Nota]]` para criar links entre notas
- Alterne entre edição e visualização com os botões no topo
- Exporte seu conhecimento com o botão de download no canto superior esquerdo
- Alterne tema claro/escuro com o botão de lua/sol
