import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';

import { supabase } from '../../supabase';
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

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fehler beim Abrufen der Aufgaben:', error);
      return;
    }
    if (data) setTodos(data as TodoItem[]);
  }

  const addTodo = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setNewTitle('');

    const { data, error } = await supabase
      .from('todos')
      .insert({ title: trimmed, status: 'todo' })
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Hinzufügen der Aufgabe:', error);
      return;
    }
    setTodos((prev) => [...prev, data as TodoItem]);
  };

  const moveTodo = async (id: string, direction: -1 | 1) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    const nextIndex = STATUS_ORDER.indexOf(current.status) + direction;
    if (nextIndex < 0 || nextIndex >= STATUS_ORDER.length) return;
    const nextStatus = STATUS_ORDER[nextIndex];

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));

    const { error } = await supabase.from('todos').update({ status: nextStatus }).eq('id', id);
    if (error) console.error('Fehler beim Verschieben der Aufgabe:', error);
  };

  const removeTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) console.error('Fehler beim Löschen der Aufgabe:', error);
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
