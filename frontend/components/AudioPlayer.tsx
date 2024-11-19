import React, { useState, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Button, View } from 'react-native';
import { WavRecorder } from '@/wavtools/index.js';

interface AudioPlayerProps {
    fileName: string;
}

export default function AudioPlayer({ fileName }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        return () => {
        // Unload the sound when the component is unmounted
        if (sound) {
            sound.unloadAsync();
        }
        };
    }, [sound]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            // Check if audio is finished playing
            if (status.didJustFinish) {
                setIsPlaying(false);
            }
        }
    };

    const playAudio = async (uri: string) => {
        try {
            if (sound && sound._loaded) {
                sound.playAsync();
            } else {
                const { sound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true },
                    handlePlaybackStatusUpdate
                );
                setSound(sound);
            }
            setIsPlaying(true);
        }
        catch (error) {
            console.error('Failed to play audio:', error)
        }
    };

    const stopAudio = async () => {
        if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        }
    };

    return (
        <View>
        <Button
            title={isPlaying ? 'Stop' : 'Play'}
            onPress={() => {
                if (isPlaying) {
                    stopAudio();
                } else {
                    playAudio(`${process.env.EXPO_PUBLIC_S3_BUCKET}${fileName}`); // Replace with your audio file URI
                }
            }}
        />
        </View>
    );
}
