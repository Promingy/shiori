import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import useAIStore from '@/store/OpenAiStore';
import { Text } from '@/components/Themed';

export default function Chat() {
    const { testRequest } = useAIStore();

    const handleSubmit = () => {
        testRequest("I'm a test");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Chat</Text>
            <Button title="Click Me" onPress={handleSubmit} color="#6200EE" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // Light background
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333', // Neutral text color
    },
});
