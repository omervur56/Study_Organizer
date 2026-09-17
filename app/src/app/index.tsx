import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabase';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextExam, setNextExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  // Countdown jede Minute aktualisieren
  useEffect(() => {
    let interval;
    if (nextExam) {
      updateCountdown();
      interval = setInterval(updateCountdown, 60000);
    }
    return () => clearInterval(interval);
  }, [nextExam]);

  async function fetchEvents() {
    try {
      setLoading(true);
      // Holt alle Termine ab jetzt
      const { data, error } = await supabase
        .from('study_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setEvents(data);
        
        // Finde die allererste Prüfung für den Countdown
        const upcomingExam = data.find(event => event.type === 'exam');
        if (upcomingExam) {
          setNextExam(upcomingExam);
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateCountdown() {
    if (!nextExam) return;

    const examDate = new Date(nextExam.start_time).getTime();
    const now = new Date().getTime();
    const distance = examDate - now;

    if (distance < 0) {
      setTimeLeft('Prüfung läuft oder ist vorbei!');
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

  // Trenne Prüfungen für die Extra-Sektion ab
  const examsList = events.filter(item => item.type === 'exam');

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.mainHeader}>Studienplan</Text>
      
      {/* Countdown Banner für die nächste Prüfung */}
      {nextExam && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Nächste Prüfung:</Text>
          <Text style={styles.countdownTitle} numberOfLines={1}>{nextExam.title}</Text>
          <Text style={styles.countdownTimer}>{timeLeft}</Text>
        </View>
      )}

      {/* Sektion für alle anstehenden Prüfungen auf einen Blick */}
      {examsList.length > 0 && (
        <View style={styles.examSection}>
          <Text style={styles.sectionHeader}>⚠️ Anstehende Klausuren</Text>
          {examsList.map(exam => (
            <View key={exam.id} style={styles.examMiniCard}>
              <View>
                <Text style={styles.examMiniTitle}>{exam.title}</Text>
                <Text style={styles.examMiniTime}>{formatDate(exam.start_time)}</Text>
              </View>
              <View style={styles.examBadge}>
                <Text style={styles.examBadgeText}>Prüfung</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      
      <Text style={styles.sectionHeader}>Alle Termine</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList 
        data={events}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <View style={[styles.card, item.type === 'exam' && styles.examCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              {item.type === 'exam' && (
                <View style={styles.examBadge}>
                  <Text style={styles.examBadgeText}>Prüfung</Text>
                </View>
              )}
            </View>
            <Text style={styles.time}>{formatDate(item.start_time)}</Text>
            {item.location ? <Text style={styles.location}>{item.location}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>Keine anstehenden Termine!</Text>
            <Text style={styles.emptySub}>Dein Kalender ist aktuell leer.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  listContent: { padding: 16, paddingTop: 20 },
  headerContainer: { marginBottom: 10 },
  mainHeader: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  
  // Countdown Box Styling
  countdownContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  countdownLabel: { color: '#FEE2E2', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  countdownTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  countdownTimer: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },

  // Prüfungs-Sektion oben
  examSection: { marginBottom: 20 },
  examMiniCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  examMiniTitle: { fontSize: 14, fontWeight: '600', color: '#991B1B' },
  examMiniTime: { fontSize: 12, color: '#B91C1C', marginTop: 2 },

  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 10, marginBottom: 12 },
  
  // Standard Event Card
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6', // Blau für Vorlesungen
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 
  },
  examCard: { borderLeftColor: '#EF4444', backgroundColor: '#FFFBFA' }, // Rot für Prüfungen in der Hauptliste
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, paddingRight: 8 },
  examBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  examBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  time: { color: '#4B5563', fontSize: 13, fontWeight: '500' },
  location: { color: '#6B7280', marginTop: 4, fontSize: 12 },
  emptyContainer: { paddingVertical: 30, alignItems: 'center' },
  empty: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 }
});