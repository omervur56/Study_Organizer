import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '@/app/index.styles';
import { formatDayHeader } from '@/utils/study-events';

type EventKind = 'private' | 'uni';

interface AddEventModalProps {
  visible: boolean;
  date: Date | null;
  kind: EventKind | null;
  onChangeKind: (kind: EventKind) => void;
  title: string;
  onChangeTitle: (value: string) => void;
  type: string;
  onChangeType: (value: string) => void;
  subjectOptions: string[];
  subject: string;
  onChangeSubject: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}

// Erst wird gewählt, ob das neue Ereignis privat ist oder zu einem Uni-Termin gehört,
// erst danach folgt das passende Formular (freier Titel bzw. normale Tätigkeits-Felder).
export function AddEventModal({
  visible,
  date,
  kind,
  onChangeKind,
  title,
  onChangeTitle,
  type,
  onChangeType,
  subjectOptions,
  subject,
  onChangeSubject,
  onSave,
  onClose,
  saving,
}: AddEventModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>
            Ereignis hinzufügen{date ? ` – ${formatDayHeader(date)}` : ''}
          </Text>

          {kind === null ? (
            <View style={styles.choiceRow}>
              <TouchableOpacity style={styles.choiceButton} onPress={() => onChangeKind('private')}>
                <Text style={styles.choiceButtonText}>Privater Termin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.choiceButton, styles.choiceButtonUni]} onPress={() => onChangeKind('uni')}>
                <Text style={styles.choiceButtonText}>Uni-Termin</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.inputLabel}>Titel</Text>
              <TextInput
                style={styles.textInput}
                placeholder={kind === 'private' ? 'z.B. Robert Geburtstag' : 'z.B. Fach B Klausur'}
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={onChangeTitle}
              />

              {kind === 'uni' && (
                <>
                  <Text style={styles.inputLabel}>Typ auswählen</Text>
                  <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                      style={[styles.typeButton, type === 'lecture' && styles.typeButtonActive]}
                      onPress={() => onChangeType('lecture')}
                    >
                      <Text style={[styles.typeButtonText, type === 'lecture' && styles.typeButtonTextActive]}>Vorlesung</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.typeButton, type === 'exam' && styles.typeButtonExam]}
                      onPress={() => onChangeType('exam')}
                    >
                      <Text style={[styles.typeButtonText, type === 'exam' && styles.typeButtonTextActive]}>Klausur</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.typeButton, type === 'project' && styles.typeButtonProject]}
                      onPress={() => onChangeType('project')}
                    >
                      <Text style={[styles.typeButtonText, type === 'project' && styles.typeButtonTextActive]}>Projekt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.typeButton, type === 'task' && styles.typeButtonTask]}
                      onPress={() => onChangeType('task')}
                    >
                      <Text style={[styles.typeButtonText, type === 'task' && styles.typeButtonTextActive]}>Einzelaufgabe</Text>
                    </TouchableOpacity>
                  </View>

                  {subjectOptions.length > 0 && (
                    <>
                      <Text style={styles.inputLabel}>Fach auswählen (optional)</Text>
                      <View style={styles.subjectSelectorRow}>
                        <TouchableOpacity
                          style={[styles.subjectChip, subject === '' && styles.subjectChipActive]}
                          onPress={() => onChangeSubject('')}
                        >
                          <Text style={[styles.subjectChipText, subject === '' && styles.subjectChipTextActive]}>
                            Kein Fach
                          </Text>
                        </TouchableOpacity>
                        {subjectOptions.map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[styles.subjectChip, subject === s && styles.subjectChipActive]}
                            onPress={() => onChangeSubject(s)}
                          >
                            <Text
                              style={[styles.subjectChipText, subject === s && styles.subjectChipTextActive]}
                              numberOfLines={1}
                            >
                              {s}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
            </>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>

            {kind !== null && (
              <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Speichern</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
