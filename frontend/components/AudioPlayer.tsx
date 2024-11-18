import React, { useState, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Button, View } from 'react-native';
import { S3_BUCKET } from '@env';

interface AudioPlayerProps {
    fileName: string;
    fromAi: boolean
}

export default function AudioPlayer({ fileName, fromAi }: AudioPlayerProps) {
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
                    if (!fromAi){
                        playAudio(`${S3_BUCKET}${fileName}`); // Replace with your audio file URI
                    }
                    else {
                        console.log('test')
                        playAudio(fileName)
                    }
                }
            }}
        />
        </View>
    );
}
