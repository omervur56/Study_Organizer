import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  mainHeader: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },

  inputRow: { flexDirection: 'row', gap: 12, margin: 20, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 26, fontWeight: '700', lineHeight: 28 },

  board: { flex: 1, flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  column: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingBottom: 12,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  columnTitle: { fontSize: 19, fontWeight: '800', color: '#111827' },
  columnCount: {
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  columnCountText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  columnListContent: { paddingHorizontal: 14, paddingBottom: 14, gap: 14 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#3B82F6',
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 16 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moveButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonDisabled: { opacity: 0.3 },
  moveButtonText: { color: '#3B82F6', fontSize: 18, fontWeight: '700' },
  deleteButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FEF2F2', alignItems: 'center' },
  deleteButtonText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },

  empty: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', textAlign: 'center', paddingVertical: 20 },
});

