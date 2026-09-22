import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';

import { supabase } from '../../supabase';
import { styles } from '@/app/week.styles';
import type { StudyEvent } from '@/types/study-event';

const WEEKDAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function getWeekRange(reference: Date) {
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(reference.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

// ISO-8601 Kalenderwoche (Woche mit dem ersten Donnerstag des Jahres = KW 1).
function getISOWeekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const formatDayDate = (date: Date) => date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function WeekScreen() {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const { monday, sunday } = getWeekRange(today);
  const weekNumber = getISOWeekNumber(monday);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });

  useEffect(() => {
    fetchWeekEvents();
  }, []);

  async function fetchWeekEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_events')
        .select('*')
        .gte('start_time', monday.toISOString())
        .lte('start_time', sunday.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (data) setEvents(data as StudyEvent[]);
    } catch (error) {
      console.error('Fehler beim Abrufen der Wochentermine:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.mainHeader}>Kalenderwoche {weekNumber}</Text>
        <Text style={styles.weekRange}>
          {formatDayDate(monday)} – {formatDayDate(sunday)}
        </Text>

        {days.map((date) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.start_time), date));
          const isToday = isSameDay(date, today);

          return (
            <View key={date.toISOString()} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayTitle, isToday && styles.dayTitleToday]}>
                  {WEEKDAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                </Text>
                <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>{formatDayDate(date)}</Text>
              </View>

              {dayEvents.length === 0 ? (
                <Text style={styles.emptyDay}>Keine Termine</Text>
              ) : (
                dayEvents.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <Text style={styles.eventTime}>{formatTime(event.start_time)}</Text>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.custom_title || event.title}
                    </Text>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
