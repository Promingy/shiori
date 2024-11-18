import React, { useState } from "react";
import { Button, View, StyleSheet } from "react-native";
import { WavStreamPlayer } from "@/wavtools/index.js";

export default function Test({ fileName }: {fileName: any}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [wavStreamPlayer, setWavStreamPlayer] = useState<WavStreamPlayer | null>(null);
    // Initialize the player and connect it to the audio context
    const initializePlayer = async () => {
        if (!wavStreamPlayer) {
            const player = new WavStreamPlayer({ sampleRate: 24000 });
            await player.connect();
            setWavStreamPlayer(player);
        }
    };

    // Handle play/stop logic
    const togglePlayback = async () => {
        if (isPlaying) {
            // Stop playback
            if (wavStreamPlayer) {
                await wavStreamPlayer.interrupt(); // Stop the audio
            }
            setIsPlaying(false);
        } else {
            // Start playback
            await initializePlayer(); // Ensure the player is initialized
            if (wavStreamPlayer) {
                // Example: Create 3 seconds of empty audio
                // const audio = new Int16Array(fileName);
                wavStreamPlayer.add16BitPCM(fileName, "my-track");
                wavStreamPlayer.add16BitPCM(audio, "my-track");
                wavStreamPlayer.add16BitPCM(audio, "my-track");
            }
            setIsPlaying(true);
        }
    };


    return (
        <View>
            <Button
                title={isPlaying ? "Stop" : "Play"}
                onPress={togglePlayback}
                color="#000000"
            />
        </View>
    );
}