import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View, TextInput, ScrollView } from 'react-native';
import useAIStore from '@/store/OpenAiStore';
import { Text } from '@/components/Themed';
import { audioChunks, handleAudioDelta, handleAudioDone } from '@/helpers/decodeAudio';
import AudioPlayer from '@/components/AudioPlayer';

export default function Chat() {
    const { testRequest, initializeWebSocket, cleanup, transcript } = useAIStore();
    const [aiText, setAiText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [audioUri, setAudioUri] = useState("")

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
        if (transcript) {
            setMessages(prev => [...prev, {type: 'ai', content: transcript}])
        }
    }, [transcript])

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
                                <Text style={styles.messageLabel}>AI:</Text>
                                <Text style={styles.messageText}>{message.content}</Text>
                                {/* Audio player placeholder - we can implement this once you share the audio response structure */}
                                {message && (
                                    <View style={styles.audioPlayer}>
                                        <Text>Audio Available</Text>
                                        {/* Audio player component will go here */}
                                    </View>
                                )}
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
                {/* <Button 
                    disabled={!aiText || isLoading} 
                    title={isLoading ? "Sending..." : "Send"} 
                    onPress={() => handleSubmit(aiText)} 
                    color="#FFC0CB" 
                /> */}
                <Button 
                    title={"Decode Audio"} 
                    onPress={async () => {
                        // let decodedAudio = []
                        // for (let audio of audioChunks) {
                        //     decodedAudio.push(handleAudioDelta(audio))
                        // }

                        const decodedAudio = await Promise.all(
                            audioChunks.map((chunk) => handleAudioDelta(chunk))
                        )

                        const uri = await handleAudioDone(decodedAudio)
                        setAudioUri(uri)
                    }} 
                    color="#000000" 
                />
                {audioUri &&
                    <AudioPlayer fileName={audioUri} fromAi={true}/>
                }
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
    aiMessage: {
        backgroundColor: '#D9D9D6',
        borderRadius: 8,
        padding: 12,
    },
    messageLabel: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1C1C1C',
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
    }
});