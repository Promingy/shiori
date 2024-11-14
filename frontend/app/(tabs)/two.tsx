import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/store';
import { Text } from '@/components/Themed';
import { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import AudioPlayer from '@/components/AudioPlayer';

export default function TabTwoScreen() {
  const { randomCard, getRandomCard } = useAuthStore();
  const [flipped, setFlipped] = useState(false);

  // card field order - Word, Pronunciation, Definition, Sentence (Japanese), Sentence (English), IMG, arr of media, arr of media
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [definition, setDefinition] = useState('');
  const [sentenceJP, setSentenceJP] = useState('');
  const [sentenceEN, setSentenceEN] = useState('');
  const [wordSoundFile, setWordSoundFile] = useState('');
  const [sentenceSoundFile, setSentenceSoundFile] = useState('');
  const [imageFile, setImageFile] = useState('');


  useEffect(() => {
    // Fetch the first random card when the component mounts
    getRandomCard();
  }, []);

  useEffect(() => {
    if (randomCard.notes) { 
      const fields = randomCard.notes[0];

      setWord( fields.word || '');
      setPronunciation( fields.word_in_kana || '');
      setDefinition( fields.definition || '');
      setSentenceJP( fields.sentence_jp || '');
      setSentenceEN( fields.sentence_en || '');
      setWordSoundFile( fields.word_audio || '');
      setSentenceSoundFile( fields.sentence_audio || '');
      setImageFile( fields.word_img || '');
    }
  }, [randomCard]); // Ensure this runs when randomCard changes

  console.log(randomCard)
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

  console.log("word", wordSoundFile,"sentence", sentenceSoundFile);

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
                  <Text style={styles.cardTitle}>{word}</Text>
                </View>
              ) : (
                <View style={[styles.cardContent, backAnimatedStyle]}>
                  <Text style={styles.cardTitle}>{word}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.cardPronunciation}>{pronunciation}</Text>
                  <Text style={styles.cardDescription}>{definition}</Text>
                  <Text style={styles.cardSentenceJPContainer}>
                    <RenderHTML tagsStyles={{ p: styles.cardSentenceJP, b: {fontWeight: "400"} }} contentWidth={300} source={{ html: `<p>${sentenceJP}</p>` }} />
                  </Text>
                  <Text style={styles.cardSentenceEN}>{sentenceEN}</Text>
                  <View style={styles.divider} />
                  <View style={styles.audioContainer}>
                    <AudioPlayer fileName={wordSoundFile}/>
                    <AudioPlayer fileName={sentenceSoundFile}/>
                    </View>
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
      <Button title="Get Another Random Card" onPress={() => {getRandomCard(); setFlipped(false)}} />
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
    fontWeight: 300,
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
    fontSize: 25,
    color: '#333',
    fontWeight: 200,
  },
  boldText: {
    fontWeight: 300,
  },
  cardSentenceEN: {
    fontSize:20,
    color: '#333',
    marginVertical: 5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 20,
  },
});
