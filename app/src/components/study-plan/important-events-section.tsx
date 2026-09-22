import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '@/app/index.styles';
import { formatDate } from '@/utils/study-events';
import type { ImportantEntry } from '@/types/study-event';

interface ImportantEventsSectionProps {
  items: ImportantEntry[];
}

export function ImportantEventsSection({ items }: ImportantEventsSectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.examSection}>
      <Text style={styles.sectionHeader}>⚠️ Wichtige Termine</Text>
      {items.map(item => (
        <View key={item.id} style={[styles.examMiniCard, item.type === 'project' && styles.projectMiniCard, item.type === 'task' && styles.taskMiniCard]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.examMiniTitle, item.type === 'project' && styles.projectMiniTitle, item.type === 'task' && styles.taskMiniTitle]}>
              {item.title}
            </Text>
            <Text style={[styles.examMiniTime, item.type === 'project' && styles.projectMiniTime, item.type === 'task' && styles.taskMiniTime]}>
              {formatDate(item.start_time)}
            </Text>
          </View>
          <View style={[styles.examBadge, item.type === 'project' && styles.projectBadge, item.type === 'task' && styles.taskBadge]}>
            <Text style={styles.examBadgeText}>
              {item.type === 'project' ? 'Projekt' : item.type === 'task' ? 'Einzelaufgabe' : 'Prüfung'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
