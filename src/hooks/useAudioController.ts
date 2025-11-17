import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AudioData } from 'src/@types/audio';
import {
  getPlayerState,
  updateOnGoingAudio,
  updateOnGoingList,
} from 'src/store/player';

// --- MOCKS ET DÉFINITIONS LOCALES ---

// 1. Définition locale des Types et Constantes de 'react-native-track-player'
// Ceci supprime les erreurs de type checking (lignes rouges)
type Track = {
  id: string | number;
  url: string;
  title: string;
  artist?: string;
  artwork?: string;
  genre?: string;
  isLiveStream?: boolean;
};

const State = {
  None: 'none',
  Playing: 'playing',
  Paused: 'paused',
  Buffering: 'buffering',
  Connecting: 'connecting',
  Stopped: 'stopped',
};

const Capability = {
  Play: 'play',
  Pause: 'pause',
  SkipToNext: 'skipToNext',
  SkipToPrevious: 'skipToPrevious',
};

const AppKilledPlaybackBehavior = {
  StopPlaybackAndRemoveNotification: 'stop',
};

// 2. Hook factice pour usePlaybackState
// Utilise useState pour un mock d'état de base
const usePlaybackState = () => {
    // Simule un état "Paused" initial pour que isPalyerReady soit vrai
    const [state] = useState(State.Paused); 
    return { state };
};


// 3. Implémentation factice des méthodes de TrackPlayer (renommée)
const MockTrackPlayer = {
  setupPlayer: async () => console.log('Mock: setupPlayer'),
  updateOptions: async (options: any) => console.log('Mock: updateOptions'),
  add: async (lists: Track[]) => console.log(`Mock: add ${lists.length} tracks`),
  reset: async () => console.log('Mock: reset'),
  skip: async (index: number) => console.log(`Mock: skip to index ${index}`),
  skipToNext: async () => console.log('Mock: skipToNext'),
  skipToPrevious: async () => console.log('Mock: skipToPrevious'),
  play: async () => console.log('Mock: play'),
  pause: async () => console.log('Mock: pause'),
  seekTo: async (position: number) => console.log(`Mock: seekTo ${position}`),
  setRate: async (rate: number) => console.log(`Mock: setRate ${rate}`),
  getPosition: async () => 0,
  getCurrentTrack: async () => 0,
  getQueue: async () => [],
};

// Renommage pour utiliser les noms dans le code original
const TrackPlayer = MockTrackPlayer;


// 4. Fonction de remplacement pour deepEqual (simple vérification des IDs)
const simpleListEqual = (listA: AudioData[], listB: AudioData[]): boolean => {
  if (listA === listB) return true;
  if (!listA || !listB || listA.length !== listB.length) return false;

  // On compare les IDs pour simuler une comparaison de contenu de liste
  for (let i = 0; i < listA.length; i++) {
    if (listA[i].id !== listB[i].id) {
      return false;
    }
  }
  return true;
};

// --------------------------------------------------------
// --- LOGIQUE DU CODE UTILISANT LES MOCKS ET TYPES LOCAUX ---
// --------------------------------------------------------

let isReady = false;

const updateQueue = async (data: AudioData[]) => {
  // Utilisation du type Track localement défini
  const lists: Track[] = data.map(item => {
    return {
      id: item.id,
      title: item.title,
      url: item.file,
      artwork: item.poster || require('../assets/music.png'),
      artist: item.owner.name,
      genre: item.category,
      isLiveStream: true,
    };
  });
  await TrackPlayer.add([...lists]);
};

const useAudioController = () => {
  // Le hook factice retourne un objet avec une clé 'state'
  const { state: playbackState } = usePlaybackState(); 
  // const { onGoingAudio, onGoingList } = useSelector(getPlayerState);
  const playerState = useSelector(getPlayerState) || {};

const onGoingAudio = playerState.onGoingAudio || null;
const onGoingList = playerState.onGoingList || [];


  const dispatch = useDispatch();

  // Les comparaisons utilisent les constantes 'State' locales
  const isPalyerReady = playbackState !== State.None;
  const isPalying = playbackState === State.Playing;
  const isPaused = playbackState === State.Paused;
  const isBusy =
    playbackState === State.Buffering || playbackState === State.Connecting;

  const onAudioPress = async (item: AudioData, data: AudioData[]) => {
    if (!isPalyerReady) {
      // Playing audio for the first time.
      await updateQueue(data);
      dispatch(updateOnGoingAudio(item));
      const index = data.findIndex(audio => audio.id === item.id);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      return dispatch(updateOnGoingList(data));
    }

    if (playbackState === State.Playing && onGoingAudio?.id === item.id) {
      // same audio is already playing (handle pause)
      return await TrackPlayer.pause();
    }

    if (playbackState === State.Paused && onGoingAudio?.id === item.id) {
      // same audio no need to load handle resume
      return await TrackPlayer.play();
    }

    if (onGoingAudio?.id !== item.id) {
      // Utilisation du remplacement de deepEqual
      const fromSameList = simpleListEqual(onGoingList, data);

      await TrackPlayer.pause();
      const index = data.findIndex(audio => audio.id === item.id);

      if (!fromSameList) {
        // playing new audio from different list
        await TrackPlayer.reset();
        await updateQueue(data);
        dispatch(updateOnGoingList(data));
      }

      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      dispatch(updateOnGoingAudio(item));
    }
  };

  const togglePlayPause = async () => {
    if (isPalying) await TrackPlayer.pause();
    if (isPaused) await TrackPlayer.play();
  };

  const seekTo = async (position: number) => {
    await TrackPlayer.seekTo(position);
  };

  const skipTo = async (sec: number) => {
    const currentPosition = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(currentPosition + sec);
  };

  const onNextPress = async () => {
    const currentList = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getCurrentTrack();
    if (currentIndex === null) return;

    const nextIndex = currentIndex + 1;

    const nextAudio = currentList[nextIndex];
    if (nextAudio) {
      await TrackPlayer.skipToNext();
      // Ceci suppose que onGoingList et currentList sont synchronisés
      dispatch(updateOnGoingAudio(onGoingList[nextIndex]));
    }
  };

  const onPreviousPress = async () => {
    const currentList = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getCurrentTrack();
    if (currentIndex === null) return;

    const preIndex = currentIndex - 1;

    const nextAudio = currentList[preIndex];
    if (nextAudio) {
      await TrackPlayer.skipToPrevious();
      // Ceci suppose que onGoingList et currentList sont synchronisés
      dispatch(updateOnGoingAudio(onGoingList[preIndex]));
    }
  };

  const setPlaybackRate = async (rate: number) => {
    await TrackPlayer.setRate(rate);
  };

  useEffect(() => {
    const setupPlayer = async () => {
      if (isReady) return;

      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        progressUpdateEventInterval: 10,
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });
    };

    setupPlayer();
    isReady = true;
  }, []);

  return {
    onAudioPress,
    onNextPress,
    onPreviousPress,
    seekTo,
    togglePlayPause,
    setPlaybackRate,
    skipTo,
    isBusy,
    isPalyerReady,
    isPalying,
  };
};

export default useAudioController;