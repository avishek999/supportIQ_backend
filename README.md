# 🚀 SupportIQ — AI-Powered RAG Document & Website Assistant

**SupportIQ** is a full-stack, enterprise-ready Retrieval-Augmented Generation (RAG) platform that allows users to upload documents (PDF, CSV, TXT) or paste website URLs and engage in interactive, multi-turn AI conversations grounded strictly in the provided content.

Powered by **Groq (Llama 3.3 70B)**, **MongoDB Atlas Vector Search**, and **Hugging Face Embeddings**.

---

## ✨ Key Features

- 📄 **Multi-Format File Ingestion**: Upload `.pdf`, `.csv`, or `.txt` files with in-memory parsing and text sanitization.
- 🌐 **Live Website URL Ingestion**: Paste any webpage link to automatically scrape HTML, extract clean main body content, and index it into vector embeddings.
- 🔍 **Hybrid Vector Search Pipeline**:
  - Uses local feature extraction (`bge-small-en-v1.5`) via `@huggingface/transformers` (384-dimensional vectors).
  - MongoDB Atlas `$search` with `knnBeta` vector indexing.
  - **Smart Adaptive Context Window**: Automatically provides full-document context for short documents while running filtered vector search for large documents.
- ⚡ **Grounded LLM Generation**: Powered by **Groq Llama 3.3 70B** with strict anti-hallucination rules to ensure answers are factual and directly cited from context.
- 💬 **ChatGPT-Style Conversations**:
  - Document-linked persistent chat sessions.
  - Context-aware multi-turn memory (remembers prior messages).
  - Paginated conversation list & cursor-based infinite scroll for message history.
- 🔐 **Secure Authentication**: JWT stored in secure `HTTP-only` cookies, `bcrypt` password hashing, and `Zod` DTO input validation.

---

## 🛠 Tech Stack

### **Backend**
- **Runtime & Language**: Node.js, TypeScript, Express.js
- **Database & Vector Store**: MongoDB Atlas (Mongoose ODM) with Vector Search Indexing
- **AI / LLM Orchestration**: Groq SDK (`llama-3.3-70b-versatile`)
- **Embeddings**: `@huggingface/transformers` (`Xenova/bge-small-en-v1.5`)
- **Scraping & Parsing**: `pdf-parse`, `axios`, `cheerio`
- **Security & Validation**: JWT, `cookie-parser`, `cors`, `zod`, `bcrypt`

### **Frontend**
- Next.js (React), TypeScript, TailwindCSS, Axios

---

## 🚀 API Endpoints

### 🔑 Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login & set HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Clear auth token cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### 📁 Document Ingestion (`/api/documents`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload PDF/CSV/TXT file (`multipart/form-data`) |
| `POST` | `/api/documents/link` | Scrape and ingest website URL (`{ "url": "https://..." }`) |

### 💬 Conversations (`/api/conversations`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/conversations` | Start new chat linked to a document ID |
| `GET` | `/api/conversations` | List user's conversations (paginated) |
| `GET` | `/api/conversations/:id/messages` | Fetch message history (cursor-based infinite scroll) |
| `POST` | `/api/conversations/:id/messages` | Send user message & receive grounded AI answer |

---

## ⚙️ Environment Variables

Create a `.env` file in `supportIq_backend/`:

```env
PORT=5001
NODE_ENV=development
DB_NAME=supportIq
MONGODB_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:3000
