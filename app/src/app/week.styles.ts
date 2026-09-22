import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },

  mainHeader: { fontSize: 28, fontWeight: '800', color: '#111827' },
  weekRange: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 20 },

  daySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  dayTitleToday: { color: '#3B82F6' },
  dayDate: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  dayDateToday: { color: '#3B82F6' },

  emptyDay: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', paddingVertical: 4 },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  eventTime: { fontSize: 13, fontWeight: '700', color: '#3B82F6', width: 48 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
});
