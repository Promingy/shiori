import AudioFile from '../audio.json';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Platform } from 'react-native'

export let audioChunks = [AudioFile["1"], AudioFile["2"]];

// When a delta is received
/// different for react native
export async function handleAudioDelta(deltaBase64: string) {
    const decodedAudio = Buffer.from(deltaBase64, 'base64');
    return decodedAudio;
}

export async function handleAudioDone(audioArr: Buffer[]) {
    const fullAudioBuffer = Buffer.concat(audioArr);

    if (Platform.OS == 'web') {
        const blob = new Blob([fullAudioBuffer], { type: 'audio/mpeg'});
        const audioURL = URL.createObjectURL(blob);
        return audioURL;
    }

    else {
        const fileUri = `${FileSystem.cacheDirectory}generated-audio.mp3`
        await FileSystem.writeAsStringAsync(fileUri, fullAudioBuffer.toString('base64'), {
            encoding: FileSystem.EncodingType.Base64,
        });

        return fileUri
    }
}
