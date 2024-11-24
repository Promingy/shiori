import React, { useState, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Button, View } from 'react-native';

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
                console.log(uri)
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
                    const uri = fileName.startsWith('blob:') 
                        ? fileName 
                        : `${process.env.EXPO_PUBLIC_S3_BUCKET}${fileName}`;
                    playAudio(uri);
                }
            }}
        />
        </View>
    );
}
