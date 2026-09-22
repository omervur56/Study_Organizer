import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '@/app/index.styles';

interface CountdownBannerProps {
  nextImportant: { type: string; title: string } | null;
  timeLeft: string;
}

export function CountdownBanner({ nextImportant, timeLeft }: CountdownBannerProps) {
  if (!nextImportant) return null;

  return (
    <View style={[styles.countdownContainer, nextImportant.type === 'project' && styles.countdownProject, nextImportant.type === 'task' && styles.countdownTask]}>
      <Text style={styles.countdownLabel}>
        {nextImportant.type === 'project' ? 'Nächste Abgabe:' : nextImportant.type === 'task' ? 'Nächste Aufgabe:' : 'Nächste Prüfung:'}
      </Text>
      <Text style={styles.countdownTitle} numberOfLines={1}>
        {nextImportant.title}
      </Text>
      <Text style={styles.countdownTimer}>{timeLeft}</Text>
    </View>
  );
}
