// Ce fichier réexporte storyPages pour la compatibilité
// Utiliser storyPagesApi directement est recommandé

export { 
  storyPagesApi as pagesApi,
  type StoryPage,
  type CreateStoryPageRequest as CreatePageRequest,
  type UpdateStoryPageRequest as UpdatePageRequest
} from './storyPages';

