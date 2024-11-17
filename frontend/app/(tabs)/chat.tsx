import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View, TextInput } from 'react-native';
import useAIStore from '@/store/OpenAiStore';
import { Text } from '@/components/Themed';

export default function Chat() {
    const { testRequest, initializeWebSocket, cleanup } = useAIStore();
    const [aiText, setAiText] = useState("")

    const handleSubmit = (content: string) => {
        testRequest(content);
    };

    useEffect(() => {
        initializeWebSocket();
        return () => cleanup();
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Chat</Text>
            <TextInput 
                style={styles.textArea}
                multiline={true}
                numberOfLines={4}
                placeholder="Send Mesasge to AI"
                value={aiText}
                onChangeText={setAiText}
            />
            <Button disabled={!aiText} title="Send" onPress={() => handleSubmit(aiText)} color="#FFC0CB" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFF0', // Light background
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333', // Neutral text color
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
    }
});
