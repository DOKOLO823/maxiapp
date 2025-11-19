import { useEffect, useRef, useState } from "react";
import Sound from "react-native-sound";
import { useDispatch, useSelector } from "react-redux";
import { AudioData } from "src/@types/audio";
import {
  getPlayerState,
  updateOnGoingAudio,
  updateOnGoingList,
} from "src/store/player";

// Permet audio streaming et lecture continue
Sound.setCategory("Playback");

let currentSound: Sound | null = null;

const useAudioController = () => {
  const dispatch = useDispatch();
  const playerState = useSelector(getPlayerState) || {};

  const onGoingAudio = playerState.onGoingAudio || null;
  const onGoingList = playerState.onGoingList || [];

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // --- PLAY AUDIO ---
  const playAudio = async (audio: AudioData, list: AudioData[]) => {
    try {
      setIsBusy(true);

      // Stop old audio
      if (currentSound) {
        currentSound.stop();
        currentSound.release();
        currentSound = null;
      }

      // Load new audio
      currentSound = new Sound(audio.file, undefined, (error) => {
        if (error) {
          console.log("❌ Error loading audio:", error);
          setIsBusy(false);
          return;
        }

        // Update redux
        dispatch(updateOnGoingAudio(audio));
        dispatch(updateOnGoingList(list));

        // Play
        currentSound?.play((success) => {
          if (!success) console.log("❌ Playback failed");
          setIsPlaying(false);
        });

        setIsPlaying(true);
        setIsBusy(false);
      });
    } catch (err) {
      console.log("PLAY ERROR:", err);
    }
  };

  // --- PAUSE / RESUME ---
  const togglePlayPause = async () => {
    if (!currentSound) return;

    if (isPlaying) {
      currentSound.pause();
      setIsPlaying(false);
    } else {
      currentSound.play();
      setIsPlaying(true);
    }
  };

  // --- SEEK ---
  const seekTo = (sec: number) => {
    if (!currentSound) return;
    currentSound.setCurrentTime(sec);
  };

  // --- SKIP +10 / -10 ---
  const skipTo = async (seconds: number) => {
    if (!currentSound) return;

    currentSound.getCurrentTime((pos) => {
      currentSound?.setCurrentTime(pos + seconds);
    });
  };

  // --- NEXT AUDIO ---
  const onNextPress = async () => {
    if (!onGoingList || onGoingList.length === 0) return;
    const index = onGoingList.findIndex((a) => a.id === onGoingAudio?.id);

    if (index < onGoingList.length - 1) {
      playAudio(onGoingList[index + 1], onGoingList);
    }
  };

  // --- PREVIOUS AUDIO ---
  const onPreviousPress = async () => {
    if (!onGoingList || onGoingList.length === 0) return;
    const index = onGoingList.findIndex((a) => a.id === onGoingAudio?.id);

    if (index > 0) {
      playAudio(onGoingList[index - 1], onGoingList);
    }
  };

  // Triggered when clicking audio card
  const onAudioPress = (item: AudioData, data: AudioData[]) => {
    // If same audio is already playing → toggle pause
    if (onGoingAudio?.id === item.id) {
      return togglePlayPause();
    }

    // Else load and play new one
    playAudio(item, data);
  };

  return {
    onAudioPress,
    togglePlayPause,
    seekTo,
    skipTo,
    onNextPress,
    onPreviousPress,
    isPlaying,
    isBusy,
  };
};

export default useAudioController;
