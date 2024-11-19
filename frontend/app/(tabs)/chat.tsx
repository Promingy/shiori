import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View, TextInput, ScrollView } from 'react-native';
import useAIStore from '@/store/OpenAiStore';
import { Text } from '@/components/Themed';
import Audio from '@/audio.json'
import RealtimeAudioPlayer from '@/components/RealtimeAudioPlayer';
import RealtimeRecorder from '@/components/RealTimeRecorder';

const audioChunk = [Audio["1"], Audio["2"]]

export default function Chat() {
    const { testRequest, initializeWebSocket, cleanup, transcript, receivedAudio } = useAIStore();
    const [aiText, setAiText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    const handleSubmit = async (content: string) => {
        setIsLoading(true);
        setMessages(prev => [...prev, {type: 'user', content}])
        await testRequest(content);
        
        setAiText(""); // Clear input after sending
        // setTimeout(() => {
        //     setMessages(prev => [...prev, {type: 'ai', content: `Test response to ${content}`}])
        //     setIsLoading(false)
        // }, 5000)
    };

    useEffect(() => {
        initializeWebSocket();
        return () => cleanup();
    }, []);

    useEffect(() => {
        if (transcript && receivedAudio) {
            setMessages(prev => [...prev, {type: 'ai', content: transcript, audioArr: receivedAudio}])
        }
        else if (transcript) {
            setMessages(prev => [...prev, {type: 'ai', content: transcript}])
        }
    }, [transcript])

    console.log('audio length', receivedAudio.length)

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Chat</Text>
            
            {/* Response Display Section */}
            <ScrollView style={styles.responseContainer}>
                {messages.map((message, index: number) => (
                    <View key={index} style={styles.messageContainer}>
                        {message.type === 'user' ? (
                            <View style={styles.userMessage}>
                                <Text style={styles.messageLabel}>You:</Text>
                                <Text style={styles.messageText}>{message.content}</Text>
                            </View>
                        ) : (
                            <View style={styles.aiMessage}>
                                <View style={styles.aiMessageHeaderContainer}>
                                    <Text style={styles.messageLabel}>AI:</Text>
                                    {(message && message.audioArr) && (
                                        <RealtimeAudioPlayer delta={message.audioArr} />
                                    )}
                                </View>
                                <View style={styles.messageTextContainer}>
                                    <Text style={styles.messageText}>{message.content}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
            
            {/* Input Section */}
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.textArea}
                    multiline={true}
                    numberOfLines={4}
                    placeholder="Send Message to AI"
                    value={aiText}
                    onChangeText={setAiText}
                />
                <Button 
                    disabled={!aiText || isLoading} 
                    title={isLoading ? "Sending..." : "Send"} 
                    onPress={() => handleSubmit(aiText)} 
                    color="#FFC0CB" 
                />
                <RealtimeRecorder />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFF0',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    responseContainer: {
        flex: 1,
        marginBottom: 20,
    },
    messageContainer: {
        marginBottom: 16,
    },
    userMessage: {
        marginBottom: 8,
    },
    aiMessageHeaderContainer: {
        display: "flex", 
        flexDirection: "row", 
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    aiMessage: {
        backgroundColor: '#B3B3B3',
        borderRadius: 8,
        padding: 12,
    },
    messageLabel: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1C1C1C',
    },
    messageTextContainer: {
        backgroundColor: "#D9D9D6",
        padding: 10,
        borderRadius: 10,
    },
    messageText: {
        color: '#333',
        lineHeight: 20,
    },
    audioPlayer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#A0C1D1',
        borderRadius: 4,
    },
    inputContainer: {
        marginTop: 'auto',
    },
    textArea: {
        height: 100,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 20,
        backgroundColor: 'white',
    },
});