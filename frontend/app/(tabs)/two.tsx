import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/store/AuthStore';
import { useCardStore } from '@/store/FlashCardStore';
import { Text } from '@/components/Themed';
import { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import AudioPlayer from '@/components/AudioPlayer';
import { S3_BUCKET } from '@env';

export default function TabTwoScreen() {
  const { randomCard, getRandomCard } = useCardStore();
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
    if (randomCard && randomCard.notes) { 
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

  console.log(randomCard)

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
                  { imageFile && 
                    <Image source={{ uri: `${S3_BUCKET}${imageFile}` }} style={styles.cardImage} />
                  }
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
      <View style={styles.buttonContainer}>
        <Button 
          color="#D7003A" 
          disabled={!randomCard?.card} 
          title="Again" 
          onPress={() => {getRandomCard("PUT", randomCard?.card.card_id, "Again"); setFlipped(false)}} 
        />
        <Button 
          color="#E69B00" 
          disabled={!randomCard?.card} 
          title="Hard" 
          onPress={() => {getRandomCard("PUT", randomCard?.card.card_id, "Hard"); setFlipped(false)}} 
        />
        <Button 
          color="#6B8E23" 
          disabled={!randomCard?.card} 
          title="Good" 
          onPress={() => {getRandomCard("PUT", randomCard?.card.card_id, "Good"); setFlipped(false)}} 
        />
        <Button 
          color="#A0C1D1" 
          disabled={!randomCard?.card} 
          title="Easy" 
          onPress={() => {getRandomCard("PUT", randomCard?.card.card_id, "Easy"); setFlipped(false)}} 
        />
      </View>
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
    // transformStyle: 'preserve-3d', // Maintain 3D transformation
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
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 20,
  },
  cardImage: {
    width: 200,
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 25
    // justifyContent: 'space-around',
    // width: '100%',
  }
});
