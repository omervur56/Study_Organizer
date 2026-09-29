import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/app/index.styles';
import { formatDate, buildActivityDisplayTitle } from '@/utils/study-events';
import type { StudyEvent } from '@/types/study-event';

interface EventCardProps {
  event: StudyEvent;
  isGridView: boolean;
  gridCardWidth: number;
  onEdit: (event: StudyEvent) => void;
  onDeleteActivity: (event: StudyEvent, activityIndex: number, title: string) => void;
  onPress?: (event: StudyEvent) => void;
}

export function EventCard({ event, isGridView, gridCardWidth, onEdit, onDeleteActivity, onPress }: EventCardProps) {
  const displayTitle = event.custom_title || event.title;
  const isExam = event.type === 'exam';
  const isProject = event.type === 'project';
  const isTask = event.type === 'task';
  const isPersonal = event.type === 'personal';
  const isMoodle = event.type === 'assignment';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={() => onPress?.(event)}
      disabled={!onPress}
      style={[
        styles.card,
        isGridView ? [styles.gridCard, { width: gridCardWidth }] : styles.listCard,
        isExam && styles.examCard,
        isProject && styles.projectCard,
        isTask && styles.taskCard,
        isPersonal && styles.personalCard,
        isMoodle && styles.moodleCard
      ]}
    >
      <View style={[styles.cardHeader, isGridView && styles.gridCardHeader]}>
        <Text style={[styles.title, isGridView && styles.gridTitle]} numberOfLines={isGridView ? 3 : 2}>
          {displayTitle}
        </Text>

        <TouchableOpacity onPress={() => onEdit(event)} style={styles.editButton}>
          <Text style={styles.editButtonText}>✏️{!isGridView && ' BEARBEITEN'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.cardFooter, isGridView && styles.gridCardFooter]}>
        <View>
          <Text style={styles.time}>{formatDate(event.start_time)}</Text>
          {event.location ? <Text style={styles.location} numberOfLines={1}>{event.location}</Text> : null}
        </View>

        {(isExam || isProject || isTask || isPersonal || isMoodle) && (
          <View style={[styles.examBadge, isProject && styles.projectBadge, isTask && styles.taskBadge, isPersonal && styles.personalBadge, isMoodle && styles.moodleBadge, isGridView && { marginTop: 8 }]}>
            <Text style={styles.examBadgeText}>
              {isMoodle ? 'Moodle' : isProject ? 'Projekt' : isTask ? 'Einzelaufgabe' : isPersonal ? 'Privat' : 'Prüfung'}
            </Text>
          </View>
        )}
      </View>

      {Array.isArray(event.activities) && event.activities.length > 0 && (
        <View style={styles.activitiesList}>
          {event.activities.map((activity, index) => (
            <View
              key={`${activity.title}-${index}`}
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
                onPress={() => onDeleteActivity(event, index, activity.title)}
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
}
