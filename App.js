import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { PaperProvider, Appbar, TextInput, Button, Text, HelperText } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TodoList from "./TodoList";

export default function App() {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists on app load
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

    const emailKey = `USER_${email.toLowerCase().trim()}`;

    try {
      if (isSignUp) {
        // Sign Up
        const existingUser = await AsyncStorage.getItem(emailKey);
        if (existingUser) {
          setError("User already exists!");
          return;
        }
        await AsyncStorage.setItem(emailKey, password);
        await AsyncStorage.setItem("SESSION_USER", email);
        setUser(email);
      } else {
        // Sign In
        const storedPassword = await AsyncStorage.getItem(emailKey);
        if (storedPassword === password) {
          await AsyncStorage.setItem("SESSION_USER", email);
          setUser(email);
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (e) {
      setError("Authentication failed. Please try again.");
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
    return null; // Don't render until checking session is complete
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
              behavior={Platform.OS === "ios" ? "padding" : "height"}
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
