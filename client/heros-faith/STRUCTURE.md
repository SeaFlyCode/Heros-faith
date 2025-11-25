# Structure du projet Hero's Faith - Frontend

## Organisation des dossiers

```
client/heros-faith/
├── app/                    # Dossier principal Next.js (App Router)
│   ├── components/         # Tous les composants React
│   │   └── NavBar/        # Composant NavBar
│   ├── styles/            # Fichiers CSS globaux
│   ├── (auth)/            # Groupe de routes pour l'authentification
│   ├── (dashboard)/       # Groupe de routes pour le dashboard
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── public/                # Fichiers statiques (images, fonts, etc.)
├── lib/                   # Utilitaires et helpers
├── utils/                 # Fonctions utilitaires
├── types/                 # Types TypeScript personnalisés
└── tailwind.config.js     # Configuration Tailwind CSS
```

## Alias de chemins configurés

Grâce au `tsconfig.json`, tu peux maintenant utiliser ces alias :

### Au lieu de :
```typescript
import NavBar from '../../../components/NavBar/NavBar';
import { someUtil } from '../../utils/helpers';
```

### Tu peux écrire :
```typescript
import NavBar from '@/components/NavBar/NavBar';
import { someUtil } from '@/utils/helpers';
```

## Alias disponibles

| Alias | Chemin réel | Usage |
|-------|-------------|-------|
| `@/*` | `./*` | Racine du projet |
| `@/components/*` | `./app/components/*` | Composants React |
| `@/styles/*` | `./app/styles/*` | Styles CSS |
| `@/app/*` | `./app/*` | Dossier app |
| `@/public/*` | `./public/*` | Fichiers statiques |
| `@/types/*` | `./types/*` | Types TypeScript |
| `@/utils/*` | `./utils/*` | Fonctions utilitaires |
| `@/lib/*` | `./lib/*` | Bibliothèques/helpers |

## Exemples d'utilisation

### Importer un composant
```typescript
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
```

### Importer des styles
```typescript
import '@/styles/globals.css';
import '@/styles/custom.css';
```

### Importer des types
```typescript
import type { User } from '@/types/user';
import type { Story } from '@/types/story';
```

### Importer des utils
```typescript
import { formatDate } from '@/utils/date';
import { apiClient } from '@/lib/api';
```

## Configuration Tailwind

Tailwind cherche automatiquement les classes dans :
- `./app/**/*.{js,ts,jsx,tsx,mdx}`
- `./app/components/**/*.{js,ts,jsx,tsx,mdx}`
- `./pages/**/*.{js,ts,jsx,tsx,mdx}`
- `./components/**/*.{js,ts,jsx,tsx,mdx}`
- `./lib/**/*.{js,ts,jsx,tsx}`
- `./utils/**/*.{js,ts,jsx,tsx}`

## Bonnes pratiques

1. **Toujours utiliser les alias** pour les imports
2. **Organiser les composants** dans `app/components/` avec un dossier par composant
3. **Créer des types** dans le dossier `types/` pour la réutilisabilité
4. **Mettre les utilitaires** dans `utils/` ou `lib/` selon leur complexité
5. **Utiliser des groupes de routes** comme `(auth)` ou `(dashboard)` pour organiser les pages

## Prochaines étapes

Tu peux maintenant créer tes dossiers et fichiers selon cette structure :

```bash
# Créer les dossiers manquants
mkdir -p app/components app/styles types utils lib

# Exemple : créer une page
mkdir -p app/about
touch app/about/page.tsx
```

