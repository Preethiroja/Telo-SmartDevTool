# TELO — System Diagrams

## 1. Architecture Diagram

```mermaid
graph TB
    subgraph Client["Client (Vercel CDN)"]
        LP[Landing Page]
        AUTH[Auth Pages\nLogin / Register]
        DASH[Dashboard]
        RES[Results Page]
        GEN[Generator Page]
        CHAT[AI Chat]
        HIST[History Page]
    end

    subgraph Backend["Backend (Render — Node.js / Express)"]
        AUTH_RT[/api/auth]
        ANA_RT[/api/analyze]
        GEN_RT[/api/generate]
        CHAT_RT[/api/chat]
        MW[JWT Middleware]
    end

    subgraph AI["External Services"]
        GEMINI[Google Gemini API]
        SWAGGER[API Docs URLs\nSwagger / OpenAPI / HTML]
    end

    subgraph DB["MongoDB Atlas"]
        USERS[(users)]
        PROJECTS[(projects)]
        CHATS[(chatSessions)]
    end

    LP --> AUTH
    AUTH -->|JWT token| DASH
    DASH --> ANA_RT
    RES --> GEN_RT
    CHAT --> CHAT_RT

    AUTH_RT --> MW
    ANA_RT --> MW
    GEN_RT --> MW
    CHAT_RT --> MW

    MW --> USERS
    ANA_RT -->|scrape| SWAGGER
    ANA_RT -->|AI summary| GEMINI
    GEN_RT -->|code gen| GEMINI
    CHAT_RT -->|AI reply| GEMINI

    ANA_RT --> PROJECTS
    GEN_RT --> PROJECTS
    CHAT_RT --> CHATS
```

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string fullName
        string email
        string password
        string company
        string role
        string plan
        boolean isActive
        date lastLogin
        date createdAt
    }

    PROJECT {
        ObjectId _id PK
        ObjectId userId FK
        string documentationUrl
        string useCase
        string language
        string status
        string apiName
        string baseUrl
        string version
        string authType
        array endpoints
        number totalEndpoints
        string summary
        array generatedFiles
        date createdAt
    }

    CHAT_SESSION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId projectId FK
        string title
        array messages
        date createdAt
        date updatedAt
    }

    USER ||--o{ PROJECT : "owns"
    USER ||--o{ CHAT_SESSION : "has"
    PROJECT ||--o{ CHAT_SESSION : "context for"
```

---

## 3. Analysis Sequence Diagram

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant Scraper as Scraper Util
    participant Gemini as Gemini AI
    participant DB as MongoDB

    Dev->>FE: Paste URL + Select language
    FE->>BE: POST /api/analyze { url, language }
    BE->>DB: Create project { status: 'analyzing' }
    BE-->>FE: 202 { projectId }
    FE->>FE: Navigate to /results/:id, start polling

    BE->>Scraper: scrapeDocumentation(url)
    Scraper->>Scraper: Fetch URL
    alt OpenAPI/Swagger
        Scraper->>Scraper: parseOpenApiSpec()
    else HTML docs
        Scraper->>Gemini: extractEndpointsWithAI()
        Gemini-->>Scraper: { endpoints, authType }
    end
    Scraper-->>BE: { apiName, baseUrl, endpoints, authType }

    BE->>Gemini: generateApiSummary(apiData)
    Gemini-->>BE: AI summary text

    BE->>DB: Update project { status: 'complete', endpoints, summary }

    loop Every 3 seconds
        FE->>BE: GET /api/analyze/:id
        BE-->>FE: { project }
    end
    FE->>FE: status === 'complete' → render results
```

---

## 4. Code Generation Sequence Diagram

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant FE as Frontend
    participant BE as Backend
    participant Gemini as Gemini AI
    participant ZIP as ZIP Generator
    participant DB as MongoDB

    Dev->>FE: Click "Generate JavaScript client"
    FE->>BE: POST /api/generate/:projectId { language }
    BE->>DB: Fetch project endpoints + auth
    DB-->>BE: project data

    BE->>Gemini: generateClientCode(apiData, 'javascript', useCase)
    Note over Gemini: Writes ApiConfig.js, ApiClient.js,\nPaymentsService.js, README.md
    Gemini-->>BE: [ { filename, content }, ... ]

    BE->>DB: Save generatedFiles to project
    BE-->>FE: { files: [...] }

    FE->>FE: Display files with syntax highlighting

    Dev->>FE: Click "Download ZIP"
    FE->>BE: GET /api/generate/:projectId/download
    BE->>ZIP: generateZip(files, apiData)
    ZIP-->>BE: Buffer
    BE-->>FE: application/zip stream
    FE->>Dev: Save <api-name>-client.zip
```

---

## 5. Authentication Flow

```mermaid
flowchart TD
    A([User visits telo.dev]) --> B{JWT in localStorage?}
    B -->|Yes| C[Navigate to /dashboard]
    B -->|No| D[Show Landing Page]
    D --> E{User action}
    E -->|Get Started| F[Navigate to /register]
    E -->|Sign In| G[Navigate to /login]

    F --> H[Fill register form]
    H --> I[POST /api/auth/register]
    I --> J{Success?}
    J -->|Yes| K[Toast: Account created\nRedirect to /login]
    J -->|No| L[Show error message]

    G --> M[Fill login form]
    M --> N[POST /api/auth/login]
    N --> O{Success?}
    O -->|Yes| P[Store JWT in localStorage\nRedirect to /dashboard]
    O -->|No| Q[Toast: Invalid credentials]

    P --> C
    K --> G

    C --> R{Access protected route?}
    R -->|JWT valid| S[Render page]
    R -->|JWT missing/expired| T[Redirect to /login]
```

---

## 6. Use Case Diagram

```mermaid
graph LR
    U([Developer])

    U --> UC1[Register / Login]
    U --> UC2[Paste API Doc URL]
    U --> UC3[View Analysis Results]
    U --> UC4[Generate Client Code]
    U --> UC5[Download ZIP Package]
    U --> UC6[Chat with AI about API]
    U --> UC7[Browse Project History]
    U --> UC8[Update Profile]
    U --> UC9[Configure Settings]

    UC2 --> S1[Scrape & Parse Docs]
    S1 --> S2[Detect Auth Method]
    S2 --> S3[Extract Endpoints]
    S3 --> S4[Generate AI Summary]

    UC4 --> G1[Select Language\nJS / Python / Java]
    G1 --> G2[Gemini Generates Files]
    G2 --> G3[Syntax Highlighted View]

    UC5 --> Z1[Bundle Files + README]
    Z1 --> Z2[Stream ZIP Download]

    UC6 --> C1[Load Project Context]
    C1 --> C2[Gemini Answers with\nAPI-specific knowledge]
    C2 --> C3[Save Chat History]
```
