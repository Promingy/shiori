import React, { useState, useEffect } from "react";
import { Button, View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { WavStreamPlayer } from "@/wavtools/index.js";
import { FontAwesome } from "@expo/vector-icons";

export default function RealtimeAudioPlayer({ delta }: { delta: string[] }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [wavStreamPlayer, setWavStreamPlayer] = useState<WavStreamPlayer | null>(null);

    // Initialize the player
    useEffect(() => {
        const initPlayer = async () => {
            const player = new WavStreamPlayer({ sampleRate: 24000 });
            await player.connect();
            setWavStreamPlayer(player);
        };

        initPlayer();

        return () => {
            wavStreamPlayer?.interrupt(); // Clean up on unmount
        };
    }, []);


    const decodeBase64ToPCM = (base64String: string): Int16Array => {

        if (Platform.OS === 'web'){
            const binaryString = atob(base64String); // Decode base64
            const len = binaryString.length;
            const buffer = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
                buffer[i] = binaryString.charCodeAt(i);
            }

            return new Int16Array(buffer.buffer); // Convert to Int16Array
        }
        else {
            const { Buffer } = require('buffer')
            const buffer = Buffer.from(base64String, 'base64')

            return new Int16Array(buffer.buffer)
        }
    };

    const playAudio = async () => {
        if (!wavStreamPlayer) return;
        
        try {
            setIsPlaying(true)
            for (let [index, value] of delta.entries()) {
                const pcmData = decodeBase64ToPCM(value)
                
                wavStreamPlayer.add16BitPCM(pcmData, `track-${index}`)
            }

            const checkStreamingStatus = () => {
                if (!wavStreamPlayer.stream) {
                    console.log("Finished streaming all audio.");
                    setIsPlaying(false);
                } else {
                    setTimeout(checkStreamingStatus, 100); // Poll every 100ms
                }
            };

            checkStreamingStatus();
        } 
        
        catch (error) {
            console.error("Error decoding or playing audio:", error);
        }
    };

    const stopAudio = async () => {
        if (!wavStreamPlayer) return;

        await wavStreamPlayer.interrupt();
        setIsPlaying(false);
    };

    const togglePlayback = async () => {
        if (isPlaying) {
            await stopAudio();
        } 
        
        else {
            await playAudio();
        }
    };

    return (
        <TouchableOpacity 
            style={styles.container}
                
            onPress={togglePlayback}
        >
            <FontAwesome  name={isPlaying ? "pause" : "play"} size={15} color="#C8A2D0" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth:1,
        borderColor:'rgba(0,0,0,0.2)',
        alignItems:'center',
        justifyContent:'center',
        width:30,
        height:30,
        backgroundColor:'#D9D9D6',
        borderRadius:50,
    },
});