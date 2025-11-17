import {categoriesTypes} from '@utils/categories';

export interface AudioData {
  id: string;
  title: string;
  about: string;
  category: categoriesTypes;
  file: string;
  poster?: string;
  owner: {
    name: string;
    id: string;
  };
}

export interface Playlist {
  id: string;
  title: string;
  itemsCount: number;
  visibility: 'public' | 'private';
}

export type historyAudio = {
  audioId: string;
  date: string;
  id: string;
  title: string;
};

export interface History {
  date: string;
  audios: historyAudio[];
}

export interface CompletePlaylist {
  id: string;
  title: string;
  audios: AudioData[];
}

export interface PublicProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string; // URL de l'image de profil
  bio?: string;    // description courte si disponible
  followersCount?: number;
  followingCount?: number;
  // tu peux ajouter d'autres champs selon ton backend
}
