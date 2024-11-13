import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/store';
import { Text } from '@/components/Themed';
import { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';

export default function TabTwoScreen() {
  const { randomCard, getRandomCard } = useAuthStore();
  const [flipped, setFlipped] = useState(false);

  // card field order - Word, Pronunciation, Definition, Sentence (Japanese), Sentence (English), empty, arr of media, arr of media
  const [title, setTitle] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [description, setDescription] = useState('');
  const [sentenceJP, setSentenceJP] = useState('');
  const [sentenceEN, setSentenceEN] = useState('');

  useEffect(() => {
    // Fetch the first random card when the component mounts
    getRandomCard();
  }, []);

  useEffect(() => {
    const noteFields = randomCard?.notes[0]?.fields;
    const cleanedFields = eval(noteFields); // Safely eval if it's an array
      if (Array.isArray(cleanedFields)) {
        setTitle(cleanedFields[0] || '');
        setPronunciation(cleanedFields[1] || '');
        setDescription(cleanedFields[2] || '');
        setSentenceJP(cleanedFields[3] || '');
        setSentenceEN(cleanedFields[4] || '');
    }
  }, [randomCard]); // Ensure this runs when randomCard changes

  const flipCard = () => {
    setFlipped(!flipped);
  };

  const rotateY = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withSpring(flipped ? 180 : 0);
  }, [flipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg`}],
      opacity: interpolate(rotateY.value, [0, 90], [1, 0]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg`}],
      opacity: interpolate(rotateY.value, [90, 180], [0, 1]),
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Random Card</Text>
      
      {/* Card container with animated flip */}
      <TouchableOpacity onPress={flipCard}>
        <View style={styles.card}>
          {randomCard ? (
            <>
              {!flipped ? (
                <View style={[styles.cardContent, frontAnimatedStyle]}>
                  <Text style={styles.cardTitle}>{title}</Text>
                </View>
              ) : (
                <View style={[styles.cardContent, backAnimatedStyle]}>
                  <Text style={styles.cardTitle}>{title}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.cardPronunciation}>{pronunciation}</Text>
                  <Text style={styles.cardDescription}>{description}</Text>
                  <Text style={styles.cardSentenceJPContainer}>
                    <RenderHTML defaultTextProps={{ style: styles.cardSentenceJP }} contentWidth={300} source={{ html: sentenceJP }} />
                  </Text>
                  <Text style={styles.cardSentenceEN}>{sentenceEN}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.cardContent, frontAnimatedStyle]}>
              <Text>Loading...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
  
      {/* Button to fetch a new random card */}
      <Button title="Get Another Random Card" onPress={getRandomCard} />
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 20,
    width: 300,  // Adjusted the width to make the card wider
    height: 400,  // Adjusted the height for better visibility
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden', // Hide the back side when flipped
    transformStyle: 'preserve-3d', // Maintain 3D transformation
  },
  cardContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardTitle: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    width: '100%',
  },
  cardDescription: {
    fontSize: 20,
    color: '#666',
    marginTop: 10,
  },
  cardPronunciation: {
    fontSize: 30,
    color: '#666',
    marginVertical: 5,
  },
  cardSentenceJPContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  cardSentenceJP: {
    fontSize: 20,
    color: '#333',
    fontStyle: 'italic',
  },
  cardSentenceEN: {
    fontSize:20,
    color: '#333',
    marginVertical: 5,
  },
});
