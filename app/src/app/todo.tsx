import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';

import { styles } from '@/app/todo.styles';
import type { TodoItem, TodoStatus } from '@/types/todo';

const STATUS_ORDER: TodoStatus[] = ['todo', 'inProgress', 'done'];

const COLUMNS: { key: TodoStatus; title: string }[] = [
  { key: 'todo', title: 'To Do' },
  { key: 'inProgress', title: 'In Progress' },
  { key: 'done', title: 'Erledigt' },
];

export default function TodoScreen() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const addTodo = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: Date.now().toString(), title: trimmed, status: 'todo' }]);
    setNewTitle('');
  };

  const moveTodo = (id: string, direction: -1 | 1) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextIndex = STATUS_ORDER.indexOf(t.status) + direction;
        if (nextIndex < 0 || nextIndex >= STATUS_ORDER.length) return t;
        return { ...t, status: STATUS_ORDER[nextIndex] };
      })
    );
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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

        <View style={styles.board}>
          {COLUMNS.map((column) => {
            const items = todos.filter((t) => t.status === column.key);
            const columnIndex = STATUS_ORDER.indexOf(column.key);

            return (
              <View key={column.key} style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>{column.title}</Text>
                  <View style={styles.columnCount}>
                    <Text style={styles.columnCountText}>{items.length}</Text>
                  </View>
                </View>

                <FlatList
                  data={items}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.columnListContent}
                  ListEmptyComponent={<Text style={styles.empty}>Keine Aufgaben</Text>}
                  renderItem={({ item }) => (
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <View style={styles.cardActions}>
                        <Pressable
                          style={[styles.moveButton, columnIndex === 0 && styles.moveButtonDisabled]}
                          disabled={columnIndex === 0}
                          onPress={() => moveTodo(item.id, -1)}>
                          <Text style={styles.moveButtonText}>←</Text>
                        </Pressable>
                        <Pressable style={styles.deleteButton} onPress={() => removeTodo(item.id)}>
                          <Text style={styles.deleteButtonText}>Löschen</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.moveButton, columnIndex === STATUS_ORDER.length - 1 && styles.moveButtonDisabled]}
                          disabled={columnIndex === STATUS_ORDER.length - 1}
                          onPress={() => moveTodo(item.id, 1)}>
                          <Text style={styles.moveButtonText}>→</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                />
              </View>
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
