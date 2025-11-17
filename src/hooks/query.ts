import { getFromAsyncStorage, Keys } from '@utils/asyncStorage';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { AudioData, CompletePlaylist, History, Playlist, PublicProfile } from 'src/@types/audio';
import { getClient } from 'src/api/client';

// --- Latest Audios ---
const fetchLatest = async (): Promise<AudioData[]> => {
  const client = await getClient();
  const { data } = await client('/audio/latest');
  return data?.audios ?? [];
};

export const useFetchLatestAudios = () => {
  return useQuery({
    queryKey: ['latest-uploads'],
    queryFn: fetchLatest,
  });
};

// --- Recommended Audios ---
const fetchRecommended = async (): Promise<AudioData[]> => {
  const client = await getClient();
  const { data } = await client('/profile/recommended');
  return data?.audios ?? [];
};

export const useFetchRecommendedAudios = () => {
  return useQuery({
    queryKey: ['recommended'],
    queryFn: fetchRecommended,
  });
};

// --- Playlists ---
const fetchPlaylist = async (): Promise<Playlist[]> => {
  const client = await getClient();
  const { data } = await client('/playlist/by-profile');
  return data?.playlist ?? [];
};

export const useFetchPlaylist = () => {
  return useQuery({
    queryKey: ['playlist'],
    queryFn: fetchPlaylist,
  });
};

// --- Uploads by Profile ---
const fetchUploadsByProfile = async (): Promise<AudioData[]> => {
  const client = await getClient();
  const { data } = await client('/profile/uploads');

  return data?.audios ?? []; // <-- ne jamais renvoyer undefined
};


export const useFetchUploadsByProfile = () => {
  return useQuery({
    queryKey: ['uploads-by-profile'],
    queryFn: fetchUploadsByProfile,
  });
};

// --- Favorites ---
const fetchFavorites = async (): Promise<AudioData[]> => {
  const client = await getClient();
  const { data } = await client('/favorite');
  return data?.audios ?? [];
};

export const useFetchFavorite = () => {
  return useQuery({
    queryKey: ['favorite'],
    queryFn: fetchFavorites,
  });
};

// --- Histories ---
const fetchHistories = async (): Promise<History[]> => {
  const client = await getClient();
  const { data } = await client('/history');
  return data?.histories ?? [];
};

export const useFetchHistories = () => {
  return useQuery({
    queryKey: ['histories'],
    queryFn: fetchHistories,
  });
};

// --- Recently Played ---
const fetchRecentlyPlayed = async (): Promise<AudioData[]> => {
  const client = await getClient();
  const { data } = await client('/history/recently-played');
  return data?.audios ?? [];
};

export const useFetchRecentlyPlayed = () => {
  return useQuery({
    queryKey: ['recently-played'],
    queryFn: fetchRecentlyPlayed,
  });
};

// --- Recommended Playlist ---
const fetchRecommendedPlaylist = async (): Promise<Playlist[]> => {
  const client = await getClient();
  const { data } = await client('/profile/auto-generated-playlist');
  return data?.playlist ?? [];
};

export const useFetchRecommendedPlaylist = () => {
  return useQuery({
    queryKey: ['recommended-playlist'],
    queryFn: fetchRecommendedPlaylist,
  });
};

// --- Is Favorite ---
const fetchIsFavorite = async (id: string): Promise<boolean> => {
  const client = await getClient();
  const { data } = await client('/favorite/is-fav?audioId=' + id);
  return data?.result ?? [];
};

export const useFetchIsFavorite = (id: string) => {
  return useQuery({
    queryKey: ['favorite', id],
    queryFn: () => fetchIsFavorite(id),
    enabled: !!id,
  });
};

// --- Public Profile ---
const fetchPublicProfile = async (id: string): Promise<PublicProfile> => {
  const client = await getClient();
  const { data } = await client('/profile/info/' + id);
  return data?.profile ?? [];
};

export const useFetchPublicProfile = (id: string) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchPublicProfile(id),
    enabled: !!id,
  });
};

// --- Public Uploads ---
const fetchPublicUploads = async (id: string): Promise<AudioData[]> => {
  const client = await getClient();
  const { data } = await client('/profile/uploads/' + id);
  return data?.audios ?? [];
};

export const useFetchPublicUploads = (id: string) => {
  return useQuery({
    queryKey: ['uploads', id],
    queryFn: () => fetchPublicUploads(id),
    enabled: !!id,
  });
};

// --- Public Playlist ---
const fetchPublicPlaylist = async (id: string): Promise<Playlist[]> => {
  const client = await getClient();
  const { data } = await client('/profile/playlist/' + id);
  return data?.playlist ?? [];
};

export const useFetchPublicPlaylist = (id: string) => {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: () => fetchPublicPlaylist(id),
    enabled: !!id,
  });
};

// --- Playlist Audios ---
const fetchPlaylistAudios = async (id: string): Promise<CompletePlaylist> => {
  const client = await getClient();
  const { data } = await client('/profile/playlist-audios/' + id);
  return data?.list ?? [];
};

export const useFetchPlaylistAudios = (id: string) => {
  return useQuery({
    queryKey: ['playlist-audios', id],
    queryFn: () => fetchPlaylistAudios(id),
    enabled: !!id,
  });
};

// --- Is Following ---
const fetchIsFollowing = async (id: string): Promise<boolean> => {
  const client = await getClient();
  const { data } = await client('/profile/is-following/' + id);
  return data?.status ?? [];
};

export const useFetchIsFollowing = (id: string) => {
  return useQuery({
    queryKey: ['is-following', id],
    queryFn: () => fetchIsFollowing(id),
    enabled: !!id,
  });
};
