import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/store/AuthStore';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  const { signup, isLoading, user, logout, login} = useAuthStore();

  const handleSignup = () => {
    
    if (firstName && lastName && email && password) {
      // Call signup function from auth store
      signup(firstName, lastName, email, password);

      // Reset fields after successful signup
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } 
    
    else {
      Alert.alert('Error', 'Please fill out all fields');
    }
  };

  const handleLogin = () => {
    if (email && password) {
      login(email, password);
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.first_name}!</Text>
        <Button title="Sign Out" onPress={handleLogout} />
      </View>
    );
  }

  if (isLogin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
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
        <View style={{ marginTop: 20, display: 'flex', flexDirection: 'row', gap: 25 }}>  
          <Button title={isLoading ? 'Logging In...' : 'Login'} onPress={handleLogin} />
          <Button title="Sign Up" onPress={() => setIsLogin(false)} /> 
        </View>
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
      <View style={{ marginTop: 20, display: 'flex', flexDirection: 'row', gap: 25 }}>
        <Button title={isLoading ? 'Signing Up...' : 'Sign Up'} onPress={handleSignup} />
        <Button title="Login" onPress={() => setIsLogin(true)} />

      </View>
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
