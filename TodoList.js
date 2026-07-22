import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Card, Checkbox, Text, TextInput, Button, IconButton } from "react-native-paper";
import axios from "axios";

const API_URL = "http://10.178.151.211:5000/api/todos";

export default function TodoList({ userEmail }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Load todos from MongoDB on mount/user change
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(`${API_URL}?email=${userEmail}`);
        setTodos(response.data);
      } catch (e) {
        console.error("Failed to fetch todos from server", e);
      }
    };
    fetchTodos();
  }, [userEmail]);

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    try {
      const response = await axios.post(API_URL, {
        userEmail: userEmail.toLowerCase().trim(),
        text: newTodo,
      });
      // response.data contains the new todo object saved in MongoDB (including its _id)
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (e) {
      console.error("Failed to add todo", e);
    }
  };

  const handleToggleTodo = async (id) => {
    const todoToToggle = todos.find((todo) => todo._id === id);
    if (!todoToToggle) return;

    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        completed: !todoToToggle.completed,
      });
      // Update local state with the returned updated todo from server
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (e) {
      console.error("Failed to toggle todo", e);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      // Remove it locally from state after a successful server deletion
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (e) {
      console.error("Failed to delete todo", e);
    }
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
            <Card key={todo._id} style={styles.card} mode="outlined">
              <Card.Content style={styles.cardContent}>
                <Checkbox
                  status={todo.completed ? "checked" : "unchecked"}
                  onPress={() => handleToggleTodo(todo._id)}
                />
                
                <Text 
                  onPress={() => handleToggleTodo(todo._id)}
                  style={[styles.todoText, todo.completed && styles.completedText]}
                >
                  {todo.text}
                </Text>

                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#ff4d4f"
                  onPress={() => handleDeleteTodo(todo._id)}
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
