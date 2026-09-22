import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, Dimensions, Alert, Platform } from 'react-native';
import { supabase } from '../../supabase';
import { styles } from '@/app/index.styles';
import { ListHeader } from '@/components/study-plan/list-header';
import { EventCard } from '@/components/study-plan/event-card';
import { EditEventModal } from '@/components/study-plan/edit-event-modal';
import { buildImportantEntries } from '@/utils/study-events';
import { SUBJECT_OPTIONS } from '@/constants/subjects';
import type { Activity, ImportantEntry, StudyEvent } from '@/types/study-event';

const GRID_COLUMNS = 4;
const GRID_GAP = 8;
const SCREEN_PADDING = 16;

export default function App() {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextImportant, setNextImportant] = useState<ImportantEntry | null>(null);
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
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('lecture');

  // Zusätzliche Tätigkeiten, die demselben Termin zugeordnet werden (gespeichert in event.activities)
  const [extraActivities, setExtraActivities] = useState<Activity[]>([]);
  const [extraTitle, setExtraTitle] = useState('');
  const [extraType, setExtraType] = useState('lecture');
  const [extraSubject, setExtraSubject] = useState('');
  // Index der Tätigkeit, die gerade über den Stift-Button bearbeitet wird (null = neuer Eintrag)
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

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
        const safeData = data as StudyEvent[];
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

  const openEditModal = (item: StudyEvent) => {
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
  const deleteActivity = async (event: StudyEvent, activityIndex: number) => {
    const updatedActivities = (event.activities || []).filter((_, i) => i !== activityIndex);

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

  const confirmDeleteActivity = (event: StudyEvent, activityIndex: number, title: string) => {
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
      (groups: Record<string, { key: string; label: string; items: StudyEvent[] }>, item) => {
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
      {} as Record<string, { key: string; label: string; items: StudyEvent[] }>
    )
  ).sort((a, b) => {
    const [yearA, monthA] = a.key.split('-').map(Number);
    const [yearB, monthB] = b.key.split('-').map(Number);
    return yearA - yearB || monthA - monthB;
  });

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
          ListHeaderComponent={
            <ListHeader
              nextImportant={nextImportant}
              timeLeft={timeLeft}
              importantList={importantList}
              isGridView={isGridView}
              onToggleView={setIsGridView}
              addingStudyDays={addingStudyDays}
              onAddStudyDays={addStudyDaysForCurrentMonth}
            />
          }
          contentContainerStyle={styles.listContent}
          onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
          renderItem={({ item: month }) => {
            const cards = month.items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isGridView={isGridView}
                gridCardWidth={gridCardWidth}
                onEdit={openEditModal}
                onDeleteActivity={confirmDeleteActivity}
              />
            ));

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

      <EditEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editTitle={editTitle}
        onChangeEditTitle={setEditTitle}
        editType={editType}
        onChangeEditType={setEditType}
        extraActivities={extraActivities}
        editingActivityIndex={editingActivityIndex}
        onEditActivity={editExtraActivity}
        onRemoveActivity={removeExtraActivity}
        subjectOptions={SUBJECT_OPTIONS}
        extraSubject={extraSubject}
        onChangeExtraSubject={setExtraSubject}
        extraTitle={extraTitle}
        onChangeExtraTitle={setExtraTitle}
        extraType={extraType}
        onChangeExtraType={setExtraType}
        onAddActivity={addExtraActivity}
        onSave={saveEventDetails}
        saving={savingEvent}
      />
    </SafeAreaView>
  );
}