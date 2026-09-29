import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { styles } from '@/app/index.styles';
import { formatDate, extractLinks } from '@/utils/study-events';
import { ABBREVIATION_TO_SUBJECT, MOODLE_BASE_URL, MOODLE_COURSE_IDS } from '@/constants/subjects';
import type { StudyEvent } from '@/types/study-event';

const TYPE_LABELS: Record<string, string> = {
  exam: 'Prüfung',
  project: 'Projekt',
  task: 'Einzelaufgabe',
  personal: 'Privat',
  assignment: 'Moodle',
  lecture: 'Vorlesung',
};

const TYPE_BADGE_STYLES: Record<string, any> = {
  exam: styles.examBadge,
  project: [styles.examBadge, styles.projectBadge],
  task: [styles.examBadge, styles.taskBadge],
  personal: [styles.examBadge, styles.personalBadge],
  assignment: [styles.examBadge, styles.moodleBadge],
};

interface EventDetailModalProps {
  visible: boolean;
  event: StudyEvent | null;
  onClose: () => void;
  onEdit: (event: StudyEvent) => void;
}

export function EventDetailModal({ visible, event, onClose, onEdit }: EventDetailModalProps) {
  if (!event) return null;

  const displayTitle = event.custom_title || event.title;
  const links = extractLinks(event.description);
  const badgeStyle = TYPE_BADGE_STYLES[event.type] ?? styles.examBadge;
  const badgeLabel = TYPE_LABELS[event.type] ?? event.type;

  // Moodle-Kurskürzel (z.B. "BWIF-BB-1-WS2026-BSNT") auf den vollen Fachnamen auflösen.
  const courseAbbr = event.course?.split('-').pop();
  const courseLabel = courseAbbr ? ABBREVIATION_TO_SUBJECT[courseAbbr] : undefined;
  const courseId = courseAbbr ? MOODLE_COURSE_IDS[courseAbbr] : undefined;
  const courseUrl = courseId ? `${MOODLE_BASE_URL}/course/view.php?id=${courseId}` : undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.detailBadgeRow}>
            <View style={badgeStyle}>
              <Text style={styles.examBadgeText}>{badgeLabel}</Text>
            </View>
          </View>

          <Text style={styles.modalHeader}>{displayTitle}</Text>

          <ScrollView style={styles.detailScroll}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Datum & Uhrzeit</Text>
              <Text style={styles.detailValue}>{formatDate(event.start_time)}</Text>
            </View>

            {event.location ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ort</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            ) : null}

            {event.course ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kurs</Text>
                {courseUrl ? (
                  <TouchableOpacity onPress={() => Linking.openURL(courseUrl)}>
                    <Text style={[styles.detailValue, styles.detailLinkButtonText]}>
                      {courseLabel ? `${courseLabel} (${event.course})` : event.course}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.detailValue}>{courseLabel ? `${courseLabel} (${event.course})` : event.course}</Text>
                )}
              </View>
            ) : null}

            {event.description ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Beschreibung</Text>
                <Text style={styles.detailValue}>{event.description.replace(/\n*Links:\n-+\n[\s\S]*$/, '').trim()}</Text>
              </View>
            ) : null}

            {links.map((link) => (
              <TouchableOpacity key={link} style={styles.detailLinkButton} onPress={() => Linking.openURL(link)}>
                <Text style={styles.detailLinkButtonText} numberOfLines={1}>🔗 {link}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.detailEditButton} onPress={() => onEdit(event)}>
            <Text style={styles.detailEditButtonText}>Bearbeiten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailCloseButton} onPress={onClose}>
            <Text style={styles.detailCloseButtonText}>Schließen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
