import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { supabase } from '../../supabase';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextImportant, setNextImportant] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  
  const [isGridView, setIsGridView] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('lecture');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let interval;
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
        setEvents(data);
        const upcomingImportant = data.find(event => event.type === 'exam' || event.type === 'project');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-AT', {
      weekday: 'short', day: '2-digit', month: '2-digit', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  const openEditModal = (item) => {
    setSelectedEvent(item);
    setEditTitle(item.custom_title || ''); // Wenn kein custom_title da ist, Feld leer lassen
    setEditType(item.type || 'lecture');
    setModalVisible(true);
  };

  const saveEventDetails = async () => {
    if (!selectedEvent) return;

    // Supabase Update
    try {
      const finalCustomTitle = editTitle.trim() === '' ? null : editTitle.trim();
      
      const { error } = await supabase
        .from('study_events')
        .update({ type: editType, custom_title: finalCustomTitle })
        .eq('id', selectedEvent.id);

      if (error) {
        console.error("Fehler beim Speichern:", error);
        return;
      }

      // Lokales State Update
      const updatedEvents = events.map(ev => 
        ev.id === selectedEvent.id 
          ? { ...ev, type: editType, custom_title: finalCustomTitle } 
          : ev
      );
      setEvents(updatedEvents);
      
      // Update Countdown falls nötig
      const upcomingImportant = updatedEvents.find(event => event.type === 'exam' || event.type === 'project');
      setNextImportant(upcomingImportant || null);
      
      setModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const importantList = events.filter(item => item.type === 'exam' || item.type === 'project');

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.mainHeader}>Studienplan</Text>
      
      {nextImportant && (
        <View style={[styles.countdownContainer, nextImportant.type === 'project' && styles.countdownProject]}>
          <Text style={styles.countdownLabel}>
            {nextImportant.type === 'project' ? 'Nächste Abgabe:' : 'Nächste Prüfung:'}
          </Text>
          <Text style={styles.countdownTitle} numberOfLines={1}>
            {nextImportant.custom_title || nextImportant.title}
          </Text>
          <Text style={styles.countdownTimer}>{timeLeft}</Text>
        </View>
      )}

      {importantList.length > 0 && (
        <View style={styles.examSection}>
          <Text style={styles.sectionHeader}>⚠️ Wichtige Termine</Text>
          {importantList.map(item => (
            <View key={item.id} style={[styles.examMiniCard, item.type === 'project' && styles.projectMiniCard]}>
              <View style={{flex: 1, paddingRight: 10}}>
                <Text style={[styles.examMiniTitle, item.type === 'project' && styles.projectMiniTitle]}>
                  {item.custom_title || item.title}
                </Text>
                <Text style={[styles.examMiniTime, item.type === 'project' && styles.projectMiniTime]}>
                  {formatDate(item.start_time)}
                </Text>
              </View>
              <View style={[styles.examBadge, item.type === 'project' && styles.projectBadge]}>
                <Text style={styles.examBadgeText}>
                  {item.type === 'project' ? 'Projekt' : 'Prüfung'}
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
          key={isGridView ? 'grid-view' : 'list-view'} // WICHTIG: Zwingt die Liste zum Neuladen beim Wechsel
          data={events}
          numColumns={isGridView ? 2 : 1}
          columnWrapperStyle={isGridView ? styles.gridRow : undefined}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => {
            const displayTitle = item.custom_title || item.title;
            const isExam = item.type === 'exam';
            const isProject = item.type === 'project';
            
            return (
              <View style={[
                styles.card, 
                isGridView ? styles.gridCard : styles.listCard,
                isExam && styles.examCard,
                isProject && styles.projectCard
              ]}>
                <View style={[styles.cardHeader, isGridView && styles.gridCardHeader]}>
                  <Text style={[styles.title, isGridView && styles.gridTitle]} numberOfLines={isGridView ? 3 : 2}>
                    {displayTitle}
                  </Text>
                  
                  <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
                    <Text style={styles.editButtonText}>✏️{!isGridView && ' BEARBEITEN'}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.cardFooter, isGridView && styles.gridCardFooter]}>
                  <View>
                    <Text style={styles.time}>{formatDate(item.start_time)}</Text>
                    {item.location ? <Text style={styles.location} numberOfLines={1}>{item.location}</Text> : null}
                  </View>
                  
                  {(isExam || isProject) && (
                    <View style={[styles.examBadge, isProject && styles.projectBadge, isGridView && {marginTop: 8}]}>
                      <Text style={styles.examBadgeText}>
                        {isProject ? 'Projekt' : 'Prüfung'}
                      </Text>
                    </View>
                  )}
                </View>
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
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveEventDetails}>
                <Text style={styles.saveButtonText}>Speichern</Text>
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
  countdownLabel: { color: '#FFF', opacity: 0.8, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  countdownTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  countdownTimer: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },

  examSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 10, marginBottom: 12 },
  
  examMiniCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  projectMiniCard: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  examMiniTitle: { fontSize: 14, fontWeight: '600', color: '#991B1B' },
  projectMiniTitle: { color: '#C2410C' },
  examMiniTime: { fontSize: 12, color: '#B91C1C', marginTop: 2 },
  projectMiniTime: { color: '#C2410C' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  
  viewToggle: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 8, padding: 3 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: {width: 0, height: 1} },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  toggleBtnTextActive: { color: '#111827' },

  gridRow: { justifyContent: 'space-between' },

  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3B82F6', elevation: 2 },
  listCard: { marginBottom: 12 },
  gridCard: { width: '48%', marginBottom: 12, padding: 12 },
  
  examCard: { borderLeftColor: '#EF4444', backgroundColor: '#FFFBFA' },
  projectCard: { borderLeftColor: '#F97316', backgroundColor: '#FFFBF5' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  gridCardHeader: { flexDirection: 'column', marginBottom: 6 },
  
  title: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, paddingRight: 8 },
  gridTitle: { fontSize: 14, marginBottom: 8, paddingRight: 0 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  gridCardFooter: { flexDirection: 'column', alignItems: 'flex-start' },
  
  time: { color: '#4B5563', fontSize: 13, fontWeight: '500' },
  location: { color: '#6B7280', marginTop: 4, fontSize: 12 },
  
  editButton: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  editButtonText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  
  examBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  projectBadge: { backgroundColor: '#F97316' },
  examBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  
  emptyContainer: { paddingVertical: 30, alignItems: 'center' },
  empty: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20 },
  modalHeader: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827', marginBottom: 20 },
  
  typeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  typeButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginHorizontal: 4, borderWidth: 2, borderColor: 'transparent' },
  typeButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  typeButtonExam: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  typeButtonProject: { backgroundColor: '#FFF7ED', borderColor: '#F97316' },
  typeButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  typeButtonTextActive: { color: '#111827' },

  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#4B5563' },
  saveButton: { flex: 1, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});