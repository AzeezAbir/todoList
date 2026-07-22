import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { PaperProvider, Appbar, TextInput, Button, Text, HelperText } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import TodoList from "./TodoList";

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem("SESSION_USER");
        if (session) {
          setUser(session);
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleAuth = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      if (isSignUp) {
        const response = await axios.post(`${API_URL}/auth/register`, {
          email: email.toLowerCase().trim(),
          password: password,
        });
        const userEmail = response.data.email;
        await AsyncStorage.setItem("SESSION_USER", userEmail);
        setUser(userEmail);
      } else {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: email.toLowerCase().trim(),
          password: password,
        });
        const userEmail = response.data.email;
        await AsyncStorage.setItem("SESSION_USER", userEmail);
        setUser(userEmail);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Network error. Make sure your server is running.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("SESSION_USER");
      setUser(null);
      setEmail("");
      setPassword("");
      setError("");
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Appbar.Header elevation={2}>
            <Appbar.Content title="Todo App" />
            {user && <Appbar.Action icon="logout" onPress={handleLogout} />}
          </Appbar.Header>

          {user ? (
            <TodoList userEmail={user} />
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.authContainer}
            >
              <ScrollView contentContainerStyle={styles.authContent}>
                <Text variant="headlineMedium" style={styles.authTitle}>
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </Text>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                />

                {error ? <HelperText type="error" visible={true}>{error}</HelperText> : null}

                <Button mode="contained" onPress={handleAuth} style={styles.authButton}>
                  {isSignUp ? "Register" : "Login"}
                </Button>

                <Button onPress={() => { setIsSignUp(!isSignUp); setError(""); }} style={styles.switchButton}>
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Button>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
          <StatusBar style="auto" />
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
  },
  authContent: {
    padding: 20,
    justifyContent: "center",
    flexGrow: 1,
  },
  authTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 10,
  },
  authButton: {
    marginTop: 15,
    paddingVertical: 4,
  },
  switchButton: {
    marginTop: 10,
  },
});
