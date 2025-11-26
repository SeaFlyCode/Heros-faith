/**
 * Point d'entrée centralisé pour toutes les API
 */

export { apiClient, ApiClient, type ApiError } from './client';
export { usersApi, type User, type LoginRequest, type LoginResponse, type CreateUserRequest, type UpdateUserRequest } from './users';
export { storiesApi, getAuthorDisplayName, type Story, type StoryAuthor, type CreateStoryRequest, type UpdateStoryRequest } from './stories';
export { storyPagesApi, type StoryPage, type CreateStoryPageRequest, type UpdateStoryPageRequest } from './storyPages';
export { storyChoicesApi, type StoryChoice, type CreateStoryChoiceRequest, type UpdateStoryChoiceRequest } from './storyChoices';
export { partiesApi, type Party, type CreatePartyRequest, type UpdatePartyRequest } from './parties';
export { noeudsApi, type Noeud, type CreateNoeudRequest, type UpdateNoeudRequest } from './noeuds';
export { pagesApi, type Page, type CreatePageRequest, type UpdatePageRequest } from './pages';
export { choicesApi, type Choice, type CreateChoiceRequest, type UpdateChoiceRequest } from './choices';
export { ratingsApi, type Rating, type CreateRatingRequest, type UpdateRatingRequest } from './ratings';
export { reportsApi, type Report, type CreateReportRequest, type UpdateReportRequest } from './reports';
export { useApi, useAuth } from './hooks';

