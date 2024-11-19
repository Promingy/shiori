import { Button, View } from 'react-native';
import { WavRecorder } from '@/wavtools';
import { useState } from 'react';
import AudioPlayer from './AudioPlayer';


export default function RealtimeRecorder() {
    const [wavRecorder, setWavRecorder] = useState<WavRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [finalAudio, setFinalAudio] = useState<string | null>(null);

    // Initialize the recorder
    const initRecorder = async () => {
        const recorder = new WavRecorder();
        await recorder.begin();
        setWavRecorder(recorder);
    }

    // Start recording
    const startRecording = async () => {
        if (!wavRecorder) await initRecorder();

        if (wavRecorder) {
            await wavRecorder.clear();
            
            await wavRecorder.record()
            
            setIsRecording(true);
            
            console.log('Status', wavRecorder.getStatus())
        }
    }

    // Stop recording
    const stopRecording = async () => {
        if (!wavRecorder) return;

        await wavRecorder.pause();
    
        const audio = await wavRecorder.end()

        setWavRecorder(null)
        setIsRecording(false)

        setFinalAudio(audio.url)
        console.log(audio)

        console.log('Status', wavRecorder.getStatus())
    }

    // Toggle Recording
    const toggleRecording = async () => {
        // if (!wavRecorder) initRecorder();

        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }

    return (
        <View>
            <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={toggleRecording} />
            { finalAudio &&
                <AudioPlayer fileName={finalAudio} />
            }
        </View>
    )
}