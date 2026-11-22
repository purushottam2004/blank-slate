import { StyleSheet } from 'react-native'

export const screen = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f4',
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  body: {
    fontSize: 16,
    color: '#4b5563',
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#e5484d',
    fontSize: 14,
  },
  result: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0eeeb',
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rowTitle: {
    fontSize: 17,
    color: '#1c1917',
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 17,
    color: '#1c1917',
    fontWeight: '600',
  },
  muted: {
    fontSize: 15,
    color: '#78716c',
  },
  add: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0eeeb',
  },
  addText: {
    color: '#c2410c',
    fontSize: 17,
    fontWeight: '600',
  },
  save: {
    backgroundColor: '#1c1917',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  codeCard: {
    backgroundColor: '#1c1917',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  codeValue: {
    color: '#fafaf9',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 3,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
