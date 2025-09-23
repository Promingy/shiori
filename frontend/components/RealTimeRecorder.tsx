import { Button, View } from 'react-native';
import { WavRecorder } from '@/wavtools';
import { useState } from 'react';
import RealtimeAudioPlayer from './RealtimeAudioPlayer';
import { Buffer } from 'buffer';
import useAIStore from '@/store/OpenAiStore';
import { Audio } from 'expo-av'


export default function RealtimeRecorder() {
    const { sendAudio } = useAIStore()
    const [wavRecorder, setWavRecorder] = useState<WavRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [finalAudio, setFinalAudio] = useState<string | null>(null);

    // Initialize the recorder
    const initRecorder = async () => {
        const recorder = new WavRecorder({sampleRate: 24000});
        await recorder.begin();
        setWavRecorder(recorder);
    };

    // Start recording
    const startRecording = async () => {
        if (!wavRecorder) await initRecorder();

        if (wavRecorder) {
            await wavRecorder.clear();
            await wavRecorder.record();

            setIsRecording(true);
        }
    };

    // Stop recording
    const stopRecording = async () => {
        if (!wavRecorder) return;

        await wavRecorder.pause();
        const audio = await wavRecorder.end();

        setIsRecording(false);
        setWavRecorder(null);

        const encodedAudio = await blobToBase64(audio.blob)

        console.log(audio)

        setFinalAudio(encodedAudio);
    };

    // Toggle recording
    const toggleRecording = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
    }
    };

    async function handleSubmit() {
        if(finalAudio){
            await sendAudio(finalAudio);
        }
    }

    return (
        <View>
            <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={toggleRecording} />
            { finalAudio &&
                <>
                    <RealtimeAudioPlayer delta={[finalAudio]} sampleRate={48000} />
                    <Button title="Send Audio" onPress={handleSubmit} />
                </>
            }
        </View>
    );
}

// encode final audio blob to base64 to send to ai
/// Curr Working ( just not being processed by ai )
// async function blobToBase64(blob: Blob) {
//     const buffer = await blob.arrayBuffer();

//     return Buffer.from(buffer).toString('base64');
// }

async function blobToBase64(blob: Blob): Promise<string> {
    // If blob is a WAV file, we might want to strip the header
    const buffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Log WAV header details
    console.log('WAV Header:', {
        riff: String.fromCharCode(...uint8Array.slice(0, 4)),
        format: String.fromCharCode(...uint8Array.slice(8, 12)),
        channels: uint8Array[22] | (uint8Array[23] << 8),
        sampleRate: uint8Array[24] | (uint8Array[25] << 8) | (uint8Array[26] << 16) | (uint8Array[27] << 24),
        bitsPerSample: uint8Array[34] | (uint8Array[35] << 8)
    });

    // Optionally extract just the audio data (skip WAV header)
    const audioDataStart = 44;  // Typical WAV header length
    const audioData = uint8Array.slice(audioDataStart);

    return Buffer.from(audioData).toString('base64');
}