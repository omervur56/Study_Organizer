import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  toggleBtnActive: { backgroundColor: '#FFFFFF', elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  toggleBtnTextActive: { color: '#111827' },

  addStudyDaysButton: { backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  addStudyDaysButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  gridRow: { justifyContent: 'space-between' },
  monthSection: { width: '100%', marginBottom: 16, marginTop: 6 },
  monthHeader: { fontSize: 16, fontWeight: '700', color: '#374151', paddingBottom: 8 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 8 },

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
