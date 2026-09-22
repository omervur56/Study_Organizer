import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '@/app/index.styles';
import { CountdownBanner } from '@/components/study-plan/countdown-banner';
import { ImportantEventsSection } from '@/components/study-plan/important-events-section';
import type { ImportantEntry } from '@/types/study-event';

interface ListHeaderProps {
  nextImportant: { eventId: string; type: string; title: string } | null;
  timeLeft: string;
  importantList: ImportantEntry[];
  isGridView: boolean;
  onToggleView: (isGrid: boolean) => void;
  addingStudyDays: boolean;
  onAddStudyDays: () => void;
  onSelectImportant?: (eventId: string) => void;
  onGoToEvent?: (eventId: string) => void;
}

export function ListHeader({
  nextImportant,
  timeLeft,
  importantList,
  isGridView,
  onToggleView,
  addingStudyDays,
  onAddStudyDays,
  onSelectImportant,
  onGoToEvent,
}: ListHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <CountdownBanner nextImportant={nextImportant} timeLeft={timeLeft} onPress={onSelectImportant} onGoToEvent={onGoToEvent} />
      <ImportantEventsSection items={importantList} onSelect={onSelectImportant} onGoToEvent={onGoToEvent} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>Alle Termine</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isGridView && styles.toggleBtnActive]}
            onPress={() => onToggleView(false)}
          >
            <Text style={[styles.toggleBtnText, !isGridView && styles.toggleBtnTextActive]}>Liste</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isGridView && styles.toggleBtnActive]}
            onPress={() => onToggleView(true)}
          >
            <Text style={[styles.toggleBtnText, isGridView && styles.toggleBtnTextActive]}>Kacheln</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addStudyDaysButton}
        onPress={onAddStudyDays}
        disabled={addingStudyDays}
      >
        {addingStudyDays ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.addStudyDaysButtonText}>+ Lerntage für alle Monate hinzufügen</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
