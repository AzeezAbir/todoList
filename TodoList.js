import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Card, Checkbox, Text, TextInput, Button, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TodoList({ userEmail }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  const storageKey = `TODOS_${userEmail.toLowerCase().trim()}`;

  // Load todos from AsyncStorage on mount/user change
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          setTodos(JSON.parse(stored));
        } else {
          // Default initial items for new users
          // const initial = [
          //   { id: 1, text: "Sleep on Grass", completed: false },
          //   { id: 2, text: "Feed the Chicken", completed: true },
          //   { id: 3, text: "Go for a walk", completed: false },
          //   { id: 4, text: "Collect fresh eggs", completed: false }
          // ];
          // setTodos(initial);
          // await AsyncStorage.setItem(storageKey, JSON.stringify(initial));
        }
      } catch (e) {
        console.error("Failed to load todos", e);
      }
    };
    loadTodos();
  }, [userEmail]);

  // Save changes to AsyncStorage
  const saveTodos = async (updatedTodos) => {
    setTodos(updatedTodos);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedTodos));
    } catch (e) {
      console.error("Failed to save todos", e);
    }
  };

  const handleAddTodo = () => {
    if (newTodo.trim() === "") return;
    const item = {
      id: Date.now(),
      text: newTodo,
      completed: false,
    };
    const updated = [...todos, item];
    saveTodos(updated);
    setNewTodo("");
  };

  const handleToggleTodo = (id) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
  };

  const handleDeleteTodo = (id) => {
    const updated = todos.filter((todo) => todo.id !== id);
    saveTodos(updated);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Add a task..."
            value={newTodo}
            onChangeText={text => setNewTodo(text)}
            mode="outlined"
            style={styles.input}
          />
          <Button 
            mode="contained" 
            onPress={handleAddTodo}
            style={styles.button}
          >
            Add
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {todos.map((todo) => (
            <Card key={todo.id} style={styles.card} mode="outlined">
              <Card.Content style={styles.cardContent}>
                <Checkbox
                  status={todo.completed ? "checked" : "unchecked"}
                  onPress={() => handleToggleTodo(todo.id)}
                />
                
                <Text 
                  onPress={() => handleToggleTodo(todo.id)}
                  style={[styles.todoText, todo.completed && styles.completedText]}
                >
                  {todo.text}
                </Text>

                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#ff4d4f"
                  onPress={() => handleDeleteTodo(todo.id)}
                  style={styles.deleteButton}
                />
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  button: {
    height: 50,
    justifyContent: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  todoText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    paddingVertical: 10,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  deleteButton: {
    margin: 0,
  },
});
