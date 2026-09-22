import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Dimensions, Alert, Platform } from 'react-native';
import { supabase } from '../../supabase';

const GRID_COLUMNS = 4;
const GRID_GAP = 8;
const SCREEN_PADDING = 16;

// Erzeugt für jeden Termin und jede seiner Tätigkeiten einen eigenen Eintrag,
// falls sie wichtig (Prüfung/Projekt/Einzelaufgabe) sind.
const buildImportantEntries = (items: any[]) => {
  const entries: { id: string; title: string; type: string; start_time: string }[] = [];
  items.forEach((event: any) => {
    if (event.type === 'exam' || event.type === 'project' || event.type === 'task') {
      entries.push({
        id: `${event.id}-main`,
        title: event.custom_title || event.title,
        type: event.type,
        start_time: event.start_time,
      });
    }
    if (Array.isArray(event.activities)) {
      event.activities.forEach((activity: any, index: number) => {
        if (activity.type === 'exam' || activity.type === 'project' || activity.type === 'task') {
          entries.push({
            id: `${event.id}-activity-${index}`,
            title: buildActivityDisplayTitle(activity),
            type: activity.type,
            start_time: event.start_time,
          });
        }
      });
    }
  });
  return entries;
};

const activityTypeLabel = (type: string) =>
  type === 'project' ? 'Projekt' : type === 'task' ? 'Einzelaufgabe' : type === 'exam' ? 'Prüfung' : 'Vorlesung';

// Feste Liste der Fächer mit ihren Kürzeln, wie sie im Tätigkeitstitel angezeigt werden.
const SUBJECT_ABBREVIATIONS: Record<string, string> = {
  'Mathematik für Wirtschaftsinformatik': 'MWIF',
  'Programmieren': 'PROG',
  'Präsentation & Moderation': 'PRMO',
  'Kommunikation & Kollaboration': 'KOMKO',
  'Betriebssysteme & Netzwerktechnologien': 'BSNT',
  'Einführung Wirtschaftsinformatik': 'EWIF',
};
const SUBJECT_OPTIONS = Object.keys(SUBJECT_ABBREVIATIONS);

// Baut z.B. "programmieren - Einzelaufgabe (PROG)" aus Titel, Typ und Fach einer Tätigkeit.
const buildActivityDisplayTitle = (activity: { title: string; type: string; subject?: string | null }) => {
  const typeLabel = activityTypeLabel(activity.type);
  const code = activity.subject ? SUBJECT_ABBREVIATIONS[activity.subject] : undefined;
  return code ? `${activity.title} - ${typeLabel} (${code})` : `${activity.title} - ${typeLabel}`;
};

export default function App() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextImportant, setNextImportant] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  
  const [isGridView, setIsGridView] = useState(false);
  const [addingStudyDays, setAddingStudyDays] = useState(false);
  // Fallback until the grid row itself has been measured (see gridAreaWidth).
  const [listWidth, setListWidth] = useState(Dimensions.get('window').width);
  // Measured directly from the grid row container, so it reflects the real space (incl. scrollbars).
  const [gridAreaWidth, setGridAreaWidth] = useState(0);
  const availableGridWidth = gridAreaWidth > 0 ? gridAreaWidth : listWidth - SCREEN_PADDING * 2;
  // Floor to whole pixels; otherwise sub-pixel rounding can push the 4th card to the next row.
  const gridCardWidth = Math.floor(
    (availableGridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
  );

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('lecture');

  // Zusätzliche Tätigkeiten, die demselben Termin zugeordnet werden (gespeichert in event.activities)
  const [extraActivities, setExtraActivities] = useState<{ title: string; type: string; subject?: string | null }[]>([]);
  const [extraTitle, setExtraTitle] = useState('');
  const [extraType, setExtraType] = useState('lecture');
  const [extraSubject, setExtraSubject] = useState('');
  // Index der Tätigkeit, die gerade über den Stift-Button bearbeitet wird (null = neuer Eintrag)
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // Feste Fächerliste (siehe SUBJECT_OPTIONS) statt Ableitung aus den Terminen.
  const subjectOptions = SUBJECT_OPTIONS;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (nextImportant) {
      updateCountdown();
      interval = setInterval(updateCountdown, 60000);
    }
    return () => clearInterval(interval);
  }, [nextImportant]);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const safeData = data as any[];
        setEvents(safeData);
        const upcomingImportant = buildImportantEntries(safeData)[0];
        if (upcomingImportant) {
          setNextImportant(upcomingImportant);
        } else {
          setNextImportant(null);
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateCountdown() {
    if (!nextImportant) return;

    const eventDate = new Date(nextImportant.start_time).getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      setTimeLeft('Termin läuft oder ist vorbei!');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (days > 0) timeString += `${days}d `;
    timeString += `${hours}h ${minutes}m`;
    
    setTimeLeft(timeString);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-AT', {
      weekday: 'short', day: '2-digit', month: '2-digit', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  const openEditModal = (item: any) => {
    setSelectedEvent(item);
    setEditTitle(item.custom_title || '');
    setEditType(item.type || 'lecture');
    setExtraActivities(Array.isArray(item.activities) ? item.activities : []);
    setExtraTitle('');
    setExtraType('lecture');
    setExtraSubject('');
    setEditingActivityIndex(null);
    setModalVisible(true);
  };

  const addExtraActivity = () => {
    const trimmed = extraTitle.trim();
    if (!trimmed) return;
    if (editingActivityIndex !== null) {
      setExtraActivities(prev =>
        prev.map((activity, i) =>
          i === editingActivityIndex ? { title: trimmed, type: extraType, subject: extraSubject || null } : activity
        )
      );
      setEditingActivityIndex(null);
    } else {
      setExtraActivities(prev => [...prev, { title: trimmed, type: extraType, subject: extraSubject || null }]);
    }
    setExtraTitle('');
    setExtraType('lecture');
    setExtraSubject('');
  };

  const editExtraActivity = (index: number) => {
    const activity = extraActivities[index];
    if (!activity) return;
    setExtraTitle(activity.title);
    setExtraType(activity.type);
    setExtraSubject(activity.subject || '');
    setEditingActivityIndex(index);
  };

  const removeExtraActivity = (index: number) => {
    setExtraActivities(prev => prev.filter((_, i) => i !== index));
    if (editingActivityIndex === index) {
      setEditingActivityIndex(null);
      setExtraTitle('');
      setExtraType('lecture');
      setExtraSubject('');
    } else if (editingActivityIndex !== null && index < editingActivityIndex) {
      setEditingActivityIndex(editingActivityIndex - 1);
    }
  };

  const saveEventDetails = async () => {
    if (!selectedEvent) return;

    try {
      setSavingEvent(true);
      const finalCustomTitle = editTitle.trim() === '' ? null : editTitle.trim();

      // Falls noch Text im Eingabefeld steht, der nicht per "+" hinzugefügt wurde,
      // trotzdem mit speichern statt ihn stillschweigend zu verwerfen.
      const pendingTitle = extraTitle.trim();
      const activitiesToSave = pendingTitle
        ? [...extraActivities, { title: pendingTitle, type: extraType, subject: extraSubject || null }]
        : extraActivities;

      // Tätigkeiten werden im selben Termin gespeichert statt eigene Termine anzulegen.
      const { error } = await supabase
        .from('study_events')
        .update({ type: editType, custom_title: finalCustomTitle, activities: activitiesToSave })
        .eq('id', selectedEvent.id);

      if (error) {
        console.error("Fehler beim Speichern:", error);
        Alert.alert('Fehler', `Termin konnte nicht gespeichert werden: ${error.message}`);
        return;
      }

      setModalVisible(false);
      setExtraActivities([]);
      setExtraTitle('');
      await fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvent(false);
    }
  };

  // Löscht nur eine einzelne Tätigkeit aus dem activities-Array, statt den ganzen Termin zu entfernen.
  const deleteActivity = async (event: any, activityIndex: number) => {
    const updatedActivities = (event.activities || []).filter((_: any, i: number) => i !== activityIndex);

    try {
      const { error } = await supabase
        .from('study_events')
        .update({ activities: updatedActivities })
        .eq('id', event.id);

      if (error) throw error;

      setEvents(prev =>
        prev.map(e => (e.id === event.id ? { ...e, activities: updatedActivities } : e))
      );
    } catch (error: any) {
      console.error('Fehler beim Löschen der Tätigkeit:', error);
      Alert.alert('Fehler', `Tätigkeit konnte nicht gelöscht werden: ${error?.message ?? error}`);
    }
  };

  const confirmDeleteActivity = (event: any, activityIndex: number, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Tätigkeit "${title}" wirklich löschen?`)) {
        deleteActivity(event, activityIndex);
      }
      return;
    }

    Alert.alert(
      'Tätigkeit löschen',
      `Möchtest du "${title}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => deleteActivity(event, activityIndex) },
      ]
    );
  };

  const addStudyDaysForCurrentMonth = async () => {
    try {
      setAddingStudyDays(true);
      const year = new Date().getFullYear();
      const pad = (n: number) => String(n).padStart(2, '0');

      // Uni-Termine (alles außer bereits generierte Lerntage) im Jahr laden, um Kollisionen zu vermeiden.
      const { data: existingEvents, error: fetchError } = await supabase
        .from('study_events')
        .select('start_time')
        .not('id', 'like', 'lerntag-%')
        .gte('start_time', new Date(year, 0, 1).toISOString())
        .lt('start_time', new Date(year + 1, 0, 1).toISOString());

      if (fetchError) throw fetchError;

      const occupiedDates = new Set(
        (existingEvents || []).map((e: any) => e.start_time.slice(0, 10))
      );

      // Lerntage entfernen, die bereits vor der Kollisionsprüfung an Uni-Tagen eingefügt wurden.
      const conflictingLerntagIds = Array.from(occupiedDates).map((dateStr) => `lerntag-${dateStr}`);
      if (conflictingLerntagIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('study_events')
          .delete()
          .in('id', conflictingLerntagIds);

        if (deleteError) throw deleteError;
      }

      const studyDays = Array.from({ length: 12 }, (_, month) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          if (occupiedDates.has(dateStr)) return null;
          return {
            id: `lerntag-${dateStr}`,
            title: 'Lerntag',
            start_time: new Date(year, month, day, 8, 0, 0).toISOString(),
            end_time: new Date(year, month, day, 18, 0, 0).toISOString(),
            location: '',
            description: '',
            type: 'lecture',
            custom_title: null,
          };
        }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
      }).flat();

      if (studyDays.length > 0) {
        const { error } = await supabase.from('study_events').upsert(studyDays);
        if (error) throw error;
      }

      await fetchEvents();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Lerntage:', error);
    } finally {
      setAddingStudyDays(false);
    }
  };

  const importantList = buildImportantEntries(events);

  const sortedEvents = [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const monthSections = Object.values(
    sortedEvents.reduce(
      (groups: Record<string, { key: string; label: string; items: any[] }>, item: any) => {
        const date = new Date(item.start_time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;

        if (!groups[monthKey]) {
          groups[monthKey] = {
            key: monthKey,
            label: date.toLocaleString('de-AT', { month: 'long', year: 'numeric' }),
            items: []
          };
        }

        groups[monthKey].items.push(item);
        return groups;
      },
      {} as Record<string, { key: string; label: string; items: any[] }>
    )
  ).sort((a, b) => {
    const [yearA, monthA] = a.key.split('-').map(Number);
    const [yearB, monthB] = b.key.split('-').map(Number);
    return yearA - yearB || monthA - monthB;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.mainHeader}>Studienplan</Text>
      
      {nextImportant && (
        <View style={[styles.countdownContainer, nextImportant.type === 'project' && styles.countdownProject, nextImportant.type === 'task' && styles.countdownTask]}>
          <Text style={styles.countdownLabel}>
            {nextImportant.type === 'project' ? 'Nächste Abgabe:' : nextImportant.type === 'task' ? 'Nächste Aufgabe:' : 'Nächste Prüfung:'}
          </Text>
          <Text style={styles.countdownTitle} numberOfLines={1}>
            {nextImportant.title}
          </Text>
          <Text style={styles.countdownTimer}>{timeLeft}</Text>
        </View>
      )}

      {importantList.length > 0 && (
        <View style={styles.examSection}>
          <Text style={styles.sectionHeader}>⚠️ Wichtige Termine</Text>
          {importantList.map(item => (
            <View key={item.id} style={[styles.examMiniCard, item.type === 'project' && styles.projectMiniCard, item.type === 'task' && styles.taskMiniCard]}>
              <View style={{flex: 1, paddingRight: 10}}>
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
      )}
      
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>Alle Termine</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleBtn, !isGridView && styles.toggleBtnActive]} 
            onPress={() => setIsGridView(false)}
          >
            <Text style={[styles.toggleBtnText, !isGridView && styles.toggleBtnTextActive]}>Liste</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, isGridView && styles.toggleBtnActive]} 
            onPress={() => setIsGridView(true)}
          >
            <Text style={[styles.toggleBtnText, isGridView && styles.toggleBtnTextActive]}>Kacheln</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addStudyDaysButton}
        onPress={addStudyDaysForCurrentMonth}
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

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          key={isGridView ? 'grid-view' : 'list-view'}
          data={monthSections}
          keyExtractor={(item) => item.key}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
          renderItem={({ item: month }) => {
            const cards = month.items.map((event: any) => {
              const displayTitle = event.custom_title || event.title;
              const isExam = event.type === 'exam';
              const isProject = event.type === 'project';
              const isTask = event.type === 'task';

              return (
                <View
                  key={event.id}
                  style={[
                    styles.card,
                    isGridView ? [styles.gridCard, { width: gridCardWidth }] : styles.listCard,
                    isExam && styles.examCard,
                    isProject && styles.projectCard,
                    isTask && styles.taskCard
                  ]}
                >
                  <View style={[styles.cardHeader, isGridView && styles.gridCardHeader]}>
                    <Text style={[styles.title, isGridView && styles.gridTitle]} numberOfLines={isGridView ? 3 : 2}>
                      {displayTitle}
                    </Text>

                    <TouchableOpacity onPress={() => openEditModal(event)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>✏️{!isGridView && ' BEARBEITEN'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.cardFooter, isGridView && styles.gridCardFooter]}>
                    <View>
                      <Text style={styles.time}>{formatDate(event.start_time)}</Text>
                      {event.location ? <Text style={styles.location} numberOfLines={1}>{event.location}</Text> : null}
                    </View>

                    {(isExam || isProject || isTask) && (
                      <View style={[styles.examBadge, isProject && styles.projectBadge, isTask && styles.taskBadge, isGridView && { marginTop: 8 }]}>
                        <Text style={styles.examBadgeText}>
                          {isProject ? 'Projekt' : isTask ? 'Einzelaufgabe' : 'Prüfung'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {Array.isArray(event.activities) && event.activities.length > 0 && (
                    <View style={styles.activitiesList}>
                      {event.activities.map((activity: any, index: number) => (
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
                            onPress={() => confirmDeleteActivity(event, index, activity.title)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={styles.activityChipRemove}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            });

            return (
              <View style={styles.monthSection}>
                <Text style={styles.monthHeader}>{month.label}</Text>
                {isGridView ? (
                  <View
                    style={styles.gridWrap}
                    onLayout={(e) => {
                      const w = e.nativeEvent.layout.width;
                      setGridAreaWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
                    }}
                  >
                    {cards}
                  </View>
                ) : (
                  cards
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>Keine anstehenden Termine!</Text>
              <Text style={styles.emptySub}>Dein Kalender ist aktuell leer.</Text>
            </View>
          }
        />
      )}

      {/* Das Modal-Popup für das Bearbeiten */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
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
              onChangeText={setEditTitle}
            />

            <Text style={styles.inputLabel}>Typ auswählen</Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity 
                style={[styles.typeButton, editType === 'lecture' && styles.typeButtonActive]}
                onPress={() => setEditType('lecture')}
              >
                <Text style={[styles.typeButtonText, editType === 'lecture' && styles.typeButtonTextActive]}>Vorlesung</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, editType === 'exam' && styles.typeButtonExam]}
                onPress={() => setEditType('exam')}
              >
                <Text style={[styles.typeButtonText, editType === 'exam' && styles.typeButtonTextActive]}>Klausur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, editType === 'project' && styles.typeButtonProject]}
                onPress={() => setEditType('project')}
              >
                <Text style={[styles.typeButtonText, editType === 'project' && styles.typeButtonTextActive]}>Projekt</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeButton, editType === 'task' && styles.typeButtonTask]}
                onPress={() => setEditType('task')}
              >
                <Text style={[styles.typeButtonText, editType === 'task' && styles.typeButtonTextActive]}>Einzelaufgabe</Text>
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
                <TouchableOpacity onPress={() => editExtraActivity(index)}>
                  <Text style={styles.extraActivityEdit}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeExtraActivity(index)}>
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
                    onPress={() => setExtraSubject('')}
                  >
                    <Text style={[styles.subjectChipText, extraSubject === '' && styles.subjectChipTextActive]}>
                      Kein Fach
                    </Text>
                  </TouchableOpacity>
                  {subjectOptions.map(subject => (
                    <TouchableOpacity
                      key={subject}
                      style={[styles.subjectChip, extraSubject === subject && styles.subjectChipActive]}
                      onPress={() => setExtraSubject(subject)}
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
              onChangeText={setExtraTitle}
            />

            <View style={styles.typeSelectorRow}>
              <TouchableOpacity 
                style={[styles.typeButton, extraType === 'lecture' && styles.typeButtonActive]}
                onPress={() => setExtraType('lecture')}
              >
                <Text style={[styles.typeButtonText, extraType === 'lecture' && styles.typeButtonTextActive]}>Vorlesung</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, extraType === 'exam' && styles.typeButtonExam]}
                onPress={() => setExtraType('exam')}
              >
                <Text style={[styles.typeButtonText, extraType === 'exam' && styles.typeButtonTextActive]}>Klausur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, extraType === 'project' && styles.typeButtonProject]}
                onPress={() => setExtraType('project')}
              >
                <Text style={[styles.typeButtonText, extraType === 'project' && styles.typeButtonTextActive]}>Projekt</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeButton, extraType === 'task' && styles.typeButtonTask]}
                onPress={() => setExtraType('task')}
              >
                <Text style={[styles.typeButtonText, extraType === 'task' && styles.typeButtonTextActive]}>Einzelaufgabe</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addActivityButton} onPress={addExtraActivity}>
              <Text style={styles.addActivityButtonText}>
                {editingActivityIndex !== null ? '✓ Änderungen übernehmen' : '+ Tätigkeit zur Liste hinzufügen'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveEventDetails} disabled={savingEvent}>
                {savingEvent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Speichern</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingTop: 20 },
  headerContainer: { marginBottom: 10 },
  mainHeader: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  
  countdownContainer: { backgroundColor: '#EF4444', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 6 },
  countdownProject: { backgroundColor: '#F97316', shadowColor: '#F97316' },
  countdownTask: { backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6' },
  countdownLabel: { color: '#FFF', opacity: 0.8, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  countdownTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  countdownTimer: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },

  examSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 10, marginBottom: 12 },
  
  examMiniCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  projectMiniCard: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  taskMiniCard: { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' },
  examMiniTitle: { fontSize: 16, fontWeight: '600', color: '#991B1B' },
  projectMiniTitle: { color: '#C2410C' },
  taskMiniTitle: { color: '#6D28D9' },
  examMiniTime: { fontSize: 13, color: '#B91C1C', marginTop: 2 },
  projectMiniTime: { color: '#C2410C' },
  taskMiniTime: { color: '#6D28D9' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  
  viewToggle: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 8, padding: 3 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: {width: 0, height: 1} },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  toggleBtnTextActive: { color: '#111827' },

  addStudyDaysButton: { backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  addStudyDaysButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  gridRow: { justifyContent: 'space-between' },
  monthSection: { width: '100%', marginBottom: 16, marginTop: 6 },
  monthHeader: { fontSize: 16, fontWeight: '700', color: '#374151', paddingBottom: 8 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: GRID_GAP },

  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3B82F6', elevation: 2 },
  listCard: { marginBottom: 12 },
  gridCard: { aspectRatio: 0.9, padding: 6, justifyContent: 'space-between' },
  
  examCard: { borderLeftColor: '#EF4444', backgroundColor: '#FFFBFA' },
  projectCard: { borderLeftColor: '#F97316', backgroundColor: '#FFFBF5' },
  taskCard: { borderLeftColor: '#8B5CF6', backgroundColor: '#FBFAFF' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  gridCardHeader: { flexDirection: 'column', marginBottom: 1 },
  
  title: { fontSize: 17, fontWeight: '600', color: '#111827', flex: 1, paddingRight: 8 },
  gridTitle: { fontSize: 12, marginBottom: 3, paddingRight: 0, lineHeight: 15 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  gridCardFooter: { flexDirection: 'column', alignItems: 'flex-start' },
  
  time: { color: '#4B5563', fontSize: 12, fontWeight: '500' },
  location: { color: '#6B7280', marginTop: 2, fontSize: 11 },
  
  editButton: { backgroundColor: '#F3F4F6', paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  editButtonText: { fontSize: 10.5, fontWeight: '700', color: '#4B5563' },
  
  examBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  projectBadge: { backgroundColor: '#F97316' },
  taskBadge: { backgroundColor: '#8B5CF6' },
  examBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  
  emptyContainer: { paddingVertical: 30, alignItems: 'center' },
  empty: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  activitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  activityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, maxWidth: '100%' },
  activityChipText: { fontSize: 11, fontWeight: '600', color: '#4338CA' },
  activityChipRemove: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  activityChipExam: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  activityChipTextExam: { color: '#991B1B' },
  activityChipProject: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  activityChipTextProject: { color: '#C2410C' },
  activityChipTask: { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' },
  activityChipTextTask: { color: '#6D28D9' },

  subjectSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  subjectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: 'transparent', maxWidth: '100%' },
  subjectChipActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  subjectChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  subjectChipTextActive: { color: '#111827' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20 },
  modalHeader: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827', marginBottom: 20 },

  extraActivityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8 },
  extraActivityRowEditing: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  extraActivityText: { flex: 1, fontSize: 14, color: '#111827', paddingRight: 8 },
  extraActivityEdit: { fontSize: 14, color: '#4338CA', fontWeight: '700', paddingHorizontal: 8 },
  extraActivityRemove: { fontSize: 14, color: '#EF4444', fontWeight: '700', paddingHorizontal: 4 },

  addActivityButton: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  addActivityButtonText: { color: '#3B82F6', fontSize: 13, fontWeight: '700' },
  
  typeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  typeButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginHorizontal: 4, borderWidth: 2, borderColor: 'transparent' },
  typeButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  typeButtonExam: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  typeButtonProject: { backgroundColor: '#FFF7ED', borderColor: '#F97316' },
  typeButtonTask: { backgroundColor: '#F5F3FF', borderColor: '#8B5CF6' },
  typeButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  typeButtonTextActive: { color: '#111827' },

  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#4B5563' },
  saveButton: { flex: 1, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});