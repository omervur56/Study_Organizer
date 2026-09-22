import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';

import { styles } from '@/app/todo.styles';
import type { TodoItem } from '@/types/todo';

export default function TodoScreen() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const addTodo = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: Date.now().toString(), title: trimmed, completed: false }]);
    setNewTitle('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Neue Aufgabe hinzufügen..."
                  value={newTitle}
                  onChangeText={setNewTitle}
                  onSubmitEditing={addTodo}
                  returnKeyType="done"
                />
                <Pressable style={styles.addButton} onPress={addTodo}>
                  <Text style={styles.addButtonText}>+</Text>
                </Pressable>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>Keine Aufgaben</Text>
              <Text style={styles.emptySub}>Füge oben eine neue Aufgabe hinzu</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.item, item.completed && styles.itemDone]}>
              <Pressable
                style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                onPress={() => toggleTodo(item.id)}>
                {item.completed && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </Pressable>
              <Text style={[styles.itemTitle, item.completed && styles.itemTitleDone]}>
                {item.title}
              </Text>
              <Pressable style={styles.deleteButton} onPress={() => removeTodo(item.id)}>
                <Text style={styles.deleteButtonText}>Löschen</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
