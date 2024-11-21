import { Button, View } from 'react-native';
import { WavRecorder } from '@/wavtools';
import { useState } from 'react';
import RealtimeAudioPlayer from './RealtimeAudioPlayer';
import { Buffer } from 'buffer';
import useAIStore from '@/store/OpenAiStore';


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
            await sendAudio(finalAudio)
        }
    }

    return (
        <View>
            <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={toggleRecording} />
            { finalAudio &&
                <>
                    <RealtimeAudioPlayer delta={[finalAudio]} sampleRate={44100} />
                    <Button title="Send Audio" onPress={handleSubmit} />
                </>
            }
        </View>
    );
}

// encode final audio blob to base64 to send to ai
async function blobToBase64(blob: Blob) {
    const buffer = await blob.arrayBuffer();

    return Buffer.from(buffer).toString('base64');
}