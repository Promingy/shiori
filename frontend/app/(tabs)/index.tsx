import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/store/AuthStore';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ csrfToken, setCsrfToken] = useState('');

  const { signup, isLoading, user} = useAuthStore();

  // Fetch the CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/csrf-token/');
        const data = await response.json();
        setCsrfToken(data.csrf_token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleSignup = () => {
    if (firstName && lastName && email && password) {
      // Call signup function from auth store
      signup(firstName, lastName, email, password, csrfToken);

      // Reset fields after successful signup
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } else {
      Alert.alert('Error', 'Please fill out all fields');
    }
  };

  useEffect(() => {
    console.log('test', user) 
  }, [user])

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.first_name}!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={isLoading ? 'Signing Up...' : 'Sign Up'} onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
});
