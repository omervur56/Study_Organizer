import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '@/app/index.styles';
import { buildActivityDisplayTitle } from '@/utils/study-events';
import type { Activity } from '@/types/study-event';

interface EditEventModalProps {
  visible: boolean;
  onClose: () => void;
  editTitle: string;
  onChangeEditTitle: (value: string) => void;
  editType: string;
  onChangeEditType: (value: string) => void;
  extraActivities: Activity[];
  editingActivityIndex: number | null;
  onEditActivity: (index: number) => void;
  onRemoveActivity: (index: number) => void;
  subjectOptions: string[];
  extraSubject: string;
  onChangeExtraSubject: (value: string) => void;
  extraTitle: string;
  onChangeExtraTitle: (value: string) => void;
  extraType: string;
  onChangeExtraType: (value: string) => void;
  onAddActivity: () => void;
  onSave: () => void;
  saving: boolean;
}

export function EditEventModal({
  visible,
  onClose,
  editTitle,
  onChangeEditTitle,
  editType,
  onChangeEditType,
  extraActivities,
  editingActivityIndex,
  onEditActivity,
  onRemoveActivity,
  subjectOptions,
  extraSubject,
  onChangeExtraSubject,
  extraTitle,
  onChangeExtraTitle,
  extraType,
  onChangeExtraType,
  onAddActivity,
  onSave,
  saving,
}: EditEventModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Termin bearbeiten</Text>

          <Text style={styles.inputLabel}>Eigener Titel (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="z.B. Software Projekt Abgabe"
            placeholderTextColor="#9CA3AF"
            value={editTitle}
            onChangeText={onChangeEditTitle}
          />

          <Text style={styles.inputLabel}>Typ auswählen</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[styles.typeButton, editType === 'lecture' && styles.typeButtonActive]}
              onPress={() => onChangeEditType('lecture')}
            >
              <Text style={[styles.typeButtonText, editType === 'lecture' && styles.typeButtonTextActive]}>Vorlesung</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, editType === 'exam' && styles.typeButtonExam]}
              onPress={() => onChangeEditType('exam')}
            >
              <Text style={[styles.typeButtonText, editType === 'exam' && styles.typeButtonTextActive]}>Klausur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, editType === 'project' && styles.typeButtonProject]}
              onPress={() => onChangeEditType('project')}
            >
              <Text style={[styles.typeButtonText, editType === 'project' && styles.typeButtonTextActive]}>Projekt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, editType === 'task' && styles.typeButtonTask]}
              onPress={() => onChangeEditType('task')}
            >
              <Text style={[styles.typeButtonText, editType === 'task' && styles.typeButtonTextActive]}>Einzelaufgabe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, editType === 'personal' && styles.typeButtonPersonal]}
              onPress={() => onChangeEditType('personal')}
            >
              <Text style={[styles.typeButtonText, editType === 'personal' && styles.typeButtonTextActive]}>Privat</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Weitere Tätigkeiten zu diesem Termin</Text>
          {extraActivities.map((activity, index) => (
            <View
              key={`${activity.title}-${index}`}
              style={[styles.extraActivityRow, editingActivityIndex === index && styles.extraActivityRowEditing]}
            >
              <Text style={styles.extraActivityText} numberOfLines={1}>
                {buildActivityDisplayTitle(activity)}
              </Text>
              <TouchableOpacity onPress={() => onEditActivity(index)}>
                <Text style={styles.extraActivityEdit}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onRemoveActivity(index)}>
                <Text style={styles.extraActivityRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {subjectOptions.length > 0 && (
            <>
              <Text style={styles.inputLabel}>Fach auswählen (optional)</Text>
              <View style={styles.subjectSelectorRow}>
                <TouchableOpacity
                  style={[styles.subjectChip, extraSubject === '' && styles.subjectChipActive]}
                  onPress={() => onChangeExtraSubject('')}
                >
                  <Text style={[styles.subjectChipText, extraSubject === '' && styles.subjectChipTextActive]}>
                    Kein Fach
                  </Text>
                </TouchableOpacity>
                {subjectOptions.map(subject => (
                  <TouchableOpacity
                    key={subject}
                    style={[styles.subjectChip, extraSubject === subject && styles.subjectChipActive]}
                    onPress={() => onChangeExtraSubject(subject)}
                  >
                    <Text
                      style={[styles.subjectChipText, extraSubject === subject && styles.subjectChipTextActive]}
                      numberOfLines={1}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TextInput
            style={styles.textInput}
            placeholder="z.B. Fach B Klausur"
            placeholderTextColor="#9CA3AF"
            value={extraTitle}
            onChangeText={onChangeExtraTitle}
          />

          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[styles.typeButton, extraType === 'lecture' && styles.typeButtonActive]}
              onPress={() => onChangeExtraType('lecture')}
            >
              <Text style={[styles.typeButtonText, extraType === 'lecture' && styles.typeButtonTextActive]}>Vorlesung</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, extraType === 'exam' && styles.typeButtonExam]}
              onPress={() => onChangeExtraType('exam')}
            >
              <Text style={[styles.typeButtonText, extraType === 'exam' && styles.typeButtonTextActive]}>Klausur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, extraType === 'project' && styles.typeButtonProject]}
              onPress={() => onChangeExtraType('project')}
            >
              <Text style={[styles.typeButtonText, extraType === 'project' && styles.typeButtonTextActive]}>Projekt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, extraType === 'task' && styles.typeButtonTask]}
              onPress={() => onChangeExtraType('task')}
            >
              <Text style={[styles.typeButtonText, extraType === 'task' && styles.typeButtonTextActive]}>Einzelaufgabe</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addActivityButton} onPress={onAddActivity}>
            <Text style={styles.addActivityButtonText}>
              {editingActivityIndex !== null ? '✓ Änderungen übernehmen' : '+ Tätigkeit zur Liste hinzufügen'}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Speichern</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
