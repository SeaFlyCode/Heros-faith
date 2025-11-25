# 🎮 Workflow Backend - Heros Faith

## Diagramme complet du système

```mermaid
graph TD
    Start([Utilisateur]) --> Auth{Authentification}
    
    Auth -->|Non authentifié| Login[POST /api/users/login]
    Auth -->|Pas de compte| Register[POST /api/users]
    Auth -->|Authentifié| MainMenu{Action principale}
    
    Login --> JWTToken["✅ Obtenir JWT Token"]
    Register --> JWTRegister["✅ Créer compte + JWT Token"]
    
    JWTToken --> MainMenu
    JWTRegister --> MainMenu
    
    MainMenu -->|Créer une histoire| StoryFlow["📖 STORY FLOW"]
    MainMenu -->|Jouer une histoire| PartyFlow["🎲 PARTY FLOW"]
    MainMenu -->|Signaler un contenu| ReportFlow["⚠️ REPORT FLOW"]
    MainMenu -->|Laisser un avis| RatingFlow["⭐ RATING FLOW"]
    MainMenu -->|Consulter les stories| ViewStories["GET /api/stories"]
    
    %% ========== STORY FLOW ==========
    StoryFlow --> CreateStory["POST /api/stories<br/>auth: required"]
    CreateStory --> StoryValidation{Validation}
    StoryValidation -->|Title missing| StoryError["❌ 400 - Title requis"]
    StoryValidation -->|Valid| SaveStory["💾 Sauvegarde en DB"]
    SaveStory --> StoryCreated["✅ Story créée (draft)"]
    
    StoryCreated --> StoryActions{Actions Story}
    StoryActions -->|Lire| GetStory["GET /api/stories/:id"]
    StoryActions -->|Modifier| UpdateStory["PATCH /api/stories/:id<br/>auth: admin"]
    StoryActions -->|Supprimer| DeleteStory["DELETE /api/stories/:id<br/>auth: admin"]
    StoryActions -->|Ajouter des pages| PageFlow
    
    %% ========== PAGE & NOEUD FLOW ==========
    PageFlow --> CreatePage["POST /api/pages<br/>auth: required"]
    CreatePage --> PageValidation{Validation}
    PageValidation -->|story_id/content missing| PageError["❌ 400 - Données manquantes"]
    PageValidation -->|Valid| SavePage["💾 Sauvegarde Page"]
    SavePage --> PageCreated["✅ Page créée"]
    
    PageCreated --> ChoiceFlow["Ajouter des choix/nœuds"]
    ChoiceFlow --> CreateChoice["POST /api/choices"]
    CreateChoice --> SaveChoice["💾 Sauvegarde Choix"]
    SaveChoice --> ChoiceCreated["✅ Choix lié à la Page"]
    
    %% ========== PARTY FLOW ==========
    PartyFlow --> StartParty["POST /api/parties<br/>auth: required"]
    StartParty --> PartyValidation{Validation}
    PartyValidation -->|story_id missing| PartyError["❌ 400 - story_id requis"]
    PartyValidation -->|Valid| CreatePartyDB["💾 Créer partie"]
    CreatePartyDB --> PartyStarted["✅ Partie lancée"]
    
    PartyStarted --> PlayGame{Navigation}
    PlayGame -->|Lire page| ReadPage["GET /api/pages/:id"]
    PlayGame -->|Faire un choix| ChooseNoeud["POST /api/noeuds<br/>type: choice"]
    ChooseNoeud --> UpdatePath["📍 Ajouter à path"]
    UpdatePath --> NextPage["➡️ Aller à la page suivante"]
    
    NextPage --> IsEnding{Est une fin?}
    IsEnding -->|Non| PlayGame
    IsEnding -->|Oui| EndParty["PATCH /api/parties/:id<br/>end_date + ending_id"]
    EndParty --> PartyEnded["✅ Partie terminée"]
    
    %% ========== REPORT FLOW ==========
    ReportFlow --> CheckReport{Quoi signaler?}
    CheckReport -->|Une histoire| ReportStory["POST /api/reports<br/>auth: required"]
    CheckReport -->|Un contenu| ReportContent["POST /api/noeuds<br/>type: report"]
    
    ReportStory --> ReportValidation{Validation}
    ReportValidation -->|story_id/reason missing| ReportError["❌ 400 - Données manquantes"]
    ReportValidation -->|Valid| SaveReport["💾 Sauvegarde Report"]
    SaveReport --> ReportCreated["✅ Signalement enregistré"]
    
    ReportCreated --> AdminReview["👨‍💼 Admin révise"]
    AdminReview --> AdminAction{Decision}
    AdminAction -->|Approuvé| DeleteContent["DELETE - Contenu supprimé"]
    AdminAction -->|Rejeté| ArchiveReport["PATCH - Report archivé"]
    
    %% ========== RATING FLOW ==========
    RatingFlow --> CreateRating["POST /api/ratings<br/>auth: required"]
    CreateRating --> RatingValidation{Validation}
    RatingValidation -->|score/story_id missing| RatingError["❌ 400 - Données manquantes"]
    RatingValidation -->|Valid| SaveRating["💾 Sauvegarde Rating"]
    SaveRating --> RatingCreated["✅ Avis enregistré"]
    
    RatingCreated --> UpdateAverage["📊 Calcul moyenne"]
    UpdateAverage --> StoryUpdated["✅ Story mise à jour"]
    
    %% ========== NOEUD FLOW (Comments) ==========
    CreateComment["POST /api/noeuds<br/>type: comment<br/>auth: required"]
    CreateComment --> CommentValidation{Validation}
    CommentValidation -->|content/story_id missing| CommentError["❌ 400 - Données manquantes"]
    CommentValidation -->|Valid| SaveComment["💾 Sauvegarde Commentaire"]
    SaveComment --> CommentCreated["✅ Commentaire ajouté"]
    
    StoryActions -.->|Voir commentaires| GetComments["GET /api/noeuds?story_id=..."]
    
    %% Styles
    classDef auth fill:#ff6b6b,stroke:#c92a2a,color:#fff
    classDef success fill:#51cf66,stroke:#2f9e44,color:#fff
    classDef create fill:#4dabf7,stroke:#1971c2,color:#fff
    classDef validate fill:#ffd43b,stroke:#f08c00,color:#000
    classDef error fill:#ff8787,stroke:#d63031,color:#fff
    classDef admin fill:#b197fc,stroke:#7950f2,color:#fff
    
    class Login,Register,JWTToken,JWTRegister auth
    class StoryCreated,PageCreated,PartyStarted,ChoiceCreated,ReportCreated,RatingCreated,CommentCreated,PartyEnded success
    class CreateStory,CreatePage,CreateChoice,StartParty,ReportStory,ReportContent,CreateRating,CreateComment create
    class StoryValidation,PageValidation,PartyValidation,ReportValidation,RatingValidation,CommentValidation,IsEnding,CheckReport validate
    class StoryError,PageError,PartyError,ReportError,RatingError,CommentError error
    class UpdateStory,DeleteStory,DeleteContent,ArchiveReport,AdminAction admin
```

---

## 📊 Modèle de données relationnel

```mermaid
erDiagram
    USER {
        string _id PK
        string name
        string email UK
        string password
        date createdAt
    }
    
    STORY {
        string _id PK
        string title
        string description
        string author FK
        string status "draft|published"
        boolean censored
        date createdAt
        date updatedAt
    }
    
    PAGE {
        string _id PK
        string story_id FK
        string content
        boolean is_ending
        string ending_label
        string illustration
    }
    
    CHOICE {
        string _id PK
        string from_page_id FK
        string to_page_id FK
        string label
        string story_id FK
    }
    
    PARTY {
        string _id PK
        string user_id FK
        string story_id FK
        date start_date
        date end_date
        array path
        string ending_id FK
    }
    
    NOEUD {
        string _id PK
        string type "comment|report|rating"
        string user_id FK
        string story_id FK
        string content
        date createdAt
    }
    
    REPORT {
        string _id PK
        string story_id FK
        string user_id FK
        string reason
        date createdAt
    }
    
    RATING {
        string _id PK
        string story_id FK
        string user_id FK
        integer score
        string review
        date createdAt
    }
    
    USER ||--o{ STORY : "creates"
    USER ||--o{ PARTY : "plays"
    USER ||--o{ NOEUD : "creates"
    USER ||--o{ REPORT : "submits"
    USER ||--o{ RATING : "leaves"
    
    STORY ||--o{ PAGE : "contains"
    STORY ||--o{ CHOICE : "has"
    STORY ||--o{ PARTY : "in"
    STORY ||--o{ NOEUD : "receives"
    STORY ||--o{ REPORT : "receives"
    STORY ||--o{ RATING : "receives"
    
    PAGE ||--o{ CHOICE : "from/to"
    PAGE ||--o{ PARTY : "tracks path"
    
    PARTY ||--o{ PAGE : "ends at"
```

---

## 🔐 Matrice d'authentification & autorisation

| Endpoint | Méthode | Auth | Rôle | Description |
|----------|---------|------|------|-------------|
| `/users` | POST | ❌ | - | Créer un compte |
| `/users/login` | POST | ❌ | - | Se connecter |
| `/users` | GET | ✅ | admin | Lister tous les utilisateurs |
| `/users/:id` | GET | ✅ | - | Voir un utilisateur |
| `/stories` | POST | ✅ | - | Créer une story |
| `/stories` | GET | ❌ | - | Lister toutes les stories |
| `/stories/:id` | GET | ❌ | - | Voir une story |
| `/stories/:id` | PATCH | ✅ | admin | Modifier une story |
| `/stories/:id` | DELETE | ✅ | admin | Supprimer une story |
| `/pages` | POST | ✅ | - | Créer une page |
| `/pages/:id` | GET | ❌ | - | Voir une page |
| `/pages/:id` | PATCH | ✅ | - | Modifier une page |
| `/choices` | POST | ✅ | - | Créer un choix |
| `/noeuds` | POST | ✅ | - | Créer un nœud (comment/report/rating) |
| `/parties` | POST | ✅ | - | Créer une partie |
| `/parties/:id` | GET | ✅ | - | Voir une partie |
| `/parties/:id` | PATCH | ✅ | - | Mettre à jour une partie |
| `/reports` | POST | ✅ | - | Créer un signalement |
| `/reports` | GET | ✅ | admin | Voir tous les signalements |
| `/ratings` | POST | ✅ | - | Laisser un avis |

---

## 🎯 Cas d'usage principaux

### 1️⃣ Créer et publier une histoire
```
1. Créer Story (title, description)
2. Créer Pages (contenu, fin?)
3. Créer Choices (relier pages)
4. Mettre en draft/published
5. Les utilisateurs peuvent jouer
```

### 2️⃣ Jouer une histoire
```
1. Créer Party (user_id, story_id)
2. Naviguer Pages via Choices
3. Chaque choix ajoute à path
4. Terminer Party quand ending atteint
```

### 3️⃣ Commenter une story
```
1. Créer Noeud (type: comment)
2. Contient: user_id, story_id, content
3. Visible pour tous
```

### 4️⃣ Signaler un contenu
```
1. Créer Report (story_id, user_id, reason)
2. Admin révise
3. Admin supprime ou archive
```

### 5️⃣ Laisser un avis
```
1. Créer Rating (story_id, user_id, score)
2. Moyenne calculée
3. Affichée sur la story
```

---

## 🚀 Flux complet d'une partie

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    
    User->>API: POST /api/parties {story_id}
    API->>DB: Créer Party (user_id, story_id, start_date)
    DB-->>API: Party créée
    API-->>User: ✅ Partie lancée (path: [])
    
    User->>API: GET /api/pages/{firstPageId}
    API->>DB: Récupérer Page
    DB-->>API: Page data
    API-->>User: Contenu page + choices
    
    User->>API: POST /api/choices/{choiceId}
    API->>DB: Récupérer Choice (to_page_id)
    API->>DB: PATCH Party (ajouter à path)
    DB-->>API: Path mis à jour
    API-->>User: ✅ Choix enregistré
    
    User->>API: GET /api/pages/{nextPageId}
    API->>DB: Récupérer Page
    DB-->>API: {is_ending: true}
    API-->>User: Page de fin
    
    User->>API: PATCH /api/parties/{partyId} {ending_id, end_date}
    API->>DB: Partie terminée
    DB-->>API: Partie mise à jour
    API-->>User: ✅ Partie terminée
```


