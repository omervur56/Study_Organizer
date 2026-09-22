import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/app/index.styles';

interface CountdownBannerProps {
  nextImportant: { eventId: string; type: string; title: string } | null;
  timeLeft: string;
  onPress?: (eventId: string) => void;
  onGoToEvent?: (eventId: string) => void;
}

export function CountdownBanner({ nextImportant, timeLeft, onPress, onGoToEvent }: CountdownBannerProps) {
  if (!nextImportant) return null;

  return (
    <View
      style={[styles.countdownContainer, nextImportant.type === 'project' && styles.countdownProject, nextImportant.type === 'task' && styles.countdownTask]}
    >
      <Text style={styles.countdownLabel}>
        {nextImportant.type === 'project' ? 'Nächste Abgabe:' : nextImportant.type === 'task' ? 'Nächste Aufgabe:' : 'Nächste Prüfung:'}
      </Text>
      <Text style={styles.countdownTitle} numberOfLines={1}>
        {nextImportant.title}
      </Text>
      <Text style={styles.countdownTimer}>{timeLeft}</Text>

      <View style={styles.countdownButtonRow}>
        {onPress && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(nextImportant.eventId)} style={styles.countdownEditButton}>
            <Text style={styles.countdownEditButtonText}>✏️ Bearbeiten</Text>
          </TouchableOpacity>
        )}
        {onGoToEvent && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => onGoToEvent(nextImportant.eventId)} style={styles.countdownGoToButton}>
            <Text style={styles.countdownGoToButtonText}>Zum Termin ↓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

