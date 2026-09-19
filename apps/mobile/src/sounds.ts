import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Silent switch / ringer on silent or vibrate mutes these; they mix with music instead of pausing it.
setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});

// App-lifetime players, so they're never released.
const players = {
  message: createAudioPlayer(require('../assets/sounds/message.mp3')),
  post: createAudioPlayer(require('../assets/sounds/post.wav')),
};

export function playSound(name: keyof typeof players) {
  const player = players[name];
  player.seekTo(0).then(() => player.play()).catch(() => {});
}
