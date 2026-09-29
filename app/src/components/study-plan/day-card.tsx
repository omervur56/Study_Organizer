import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/app/index.styles';
import { formatDayHeader, formatTime, buildActivityDisplayTitle } from '@/utils/study-events';
import type { StudyEvent } from '@/types/study-event';

interface DayCardProps {
  date: Date;
  events: StudyEvent[];
  onEdit: (event: StudyEvent) => void;
  onDeleteActivity: (event: StudyEvent, activityIndex: number, title: string) => void;
  onAddEvent: (date: Date) => void;
  onPressEvent?: (event: StudyEvent) => void;
}

// Ein Termin (Tag) kann mehrere Ereignisse enthalten (z.B. Uni-Vorlesung + privater Geburtstag).
export function DayCard({ date, events, onEdit, onDeleteActivity, onAddEvent, onPressEvent }: DayCardProps) {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayCardHeaderRow}>
        <Text style={styles.dayCardHeader}>{formatDayHeader(date)}</Text>
        <TouchableOpacity style={styles.addEventButton} onPress={() => onAddEvent(date)}>
          <Text style={styles.addEventButtonText}>+ Ereignis</Text>
        </TouchableOpacity>
      </View>

      {events.map((event, index) => {
        const displayTitle = event.custom_title || event.title;
        const isExam = event.type === 'exam';
        const isProject = event.type === 'project';
        const isTask = event.type === 'task';
        const isPersonal = event.type === 'personal';
        const isMoodle = event.type === 'assignment';

        return (
          <TouchableOpacity
            key={event.id}
            activeOpacity={onPressEvent ? 0.7 : 1}
            onPress={() => onPressEvent?.(event)}
            disabled={!onPressEvent}
            style={[
              styles.dayCardEntry,
              index > 0 && styles.dayCardEntryDivider,
              isExam && styles.examEntry,
              isProject && styles.projectEntry,
              isTask && styles.taskEntry,
              isPersonal && styles.personalEntry,
              isMoodle && styles.moodleEntry,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={2}>{displayTitle}</Text>
              <TouchableOpacity onPress={() => onEdit(event)} style={styles.editButton}>
                <Text style={styles.editButtonText}>✏️ BEARBEITEN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.time}>{formatTime(event.start_time)}</Text>
                {event.location ? <Text style={styles.location} numberOfLines={1}>{event.location}</Text> : null}
              </View>

              {(isExam || isProject || isTask || isPersonal || isMoodle) && (
                <View
                  style={[
                    styles.examBadge,
                    isProject && styles.projectBadge,
                    isTask && styles.taskBadge,
                    isPersonal && styles.personalBadge,
                    isMoodle && styles.moodleBadge,
                  ]}
                >
                  <Text style={styles.examBadgeText}>
                    {isMoodle ? 'Moodle' : isProject ? 'Projekt' : isTask ? 'Einzelaufgabe' : isPersonal ? 'Privat' : 'Prüfung'}
                  </Text>
                </View>
              )}
            </View>

            {Array.isArray(event.activities) && event.activities.length > 0 && (
              <View style={styles.activitiesList}>
                {event.activities.map((activity, activityIndex) => (
                  <View
                    key={`${activity.title}-${activityIndex}`}
                    style={[
                      styles.activityChip,
                      activity.type === 'exam' && styles.activityChipExam,
                      activity.type === 'project' && styles.activityChipProject,
                      activity.type === 'task' && styles.activityChipTask,
                    ]}
                  >
                    <Text
                      style={[
                        styles.activityChipText,
                        activity.type === 'exam' && styles.activityChipTextExam,
                        activity.type === 'project' && styles.activityChipTextProject,
                        activity.type === 'task' && styles.activityChipTextTask,
                      ]}
                      numberOfLines={1}
                    >
                      {buildActivityDisplayTitle(activity)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onDeleteActivity(event, activityIndex, activity.title)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.activityChipRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
