import { StyleSheet } from 'react-native'

export const screen = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
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
})
