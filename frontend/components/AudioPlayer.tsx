import React, { useState, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Button, View } from 'react-native';
import { S3_BUCKET } from '@env';

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
                console.log('Audio finished playing');
                setIsPlaying(false);
            }
        }
    };

    const playAudio = async (uri: string) => {
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
                playAudio(`${S3_BUCKET}${fileName}`); // Replace with your audio file URI
            }
            }}
        />
        </View>
    );
}
