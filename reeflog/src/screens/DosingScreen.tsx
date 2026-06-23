import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { useTankStore } from '../store/tankStore';
import { useDosingStore } from '../store/dosingStore';
import { usePremium } from '../hooks/usePremium';
import { DosingCard } from '../components/DosingCard';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { DosingChemical } from '../store/types';

const today = format(new Date(), 'yyyy-MM-dd');

export function DosingScreen() {
  const navigation = useNavigation<any>();
  const [showAddModal, setShowAddModal] = useState(false);
  const { hasAccess, canAddChemical } = usePremium();

  const tank = useTankStore((s) => s.getActiveTank());
  const {
    getChemicalsForTank,
    getTodayLog,
    isDueToday,
    getLastDosed,
    toggleDoseComplete,
    addChemical,
    deleteChemical,
  } = useDosingStore();

  const chemicals = tank ? getChemicalsForTank(tank.id) : [];
  const dueToday = chemicals.filter((c) => isDueToday(c));
  const notDueToday = chemicals.filter((c) => !isDueToday(c));

  const handleAddChemical = () => {
    if (!canAddChemical(chemicals.length)) {
      navigation.navigate('Paywall');
      return;
    }
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(`Remove ${name}?`, 'This will delete this chemical and all its logs.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteChemical(id) },
    ]);
  };

  const handleSaveChemical = (data: Omit<DosingChemical, 'id' | 'tankId'>) => {
    if (!tank) return;
    addChemical({
      id: `chem-${Date.now()}`,
      tankId: tank.id,
      ...data,
    });
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Dosing</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddChemical} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {chemicals.length === 0 ? (
          <EmptyState
            icon="💊"
            title="No chemicals tracked"
            subtitle="Add your alkalinity, calcium, or other supplements to track daily dosing."
            actionLabel="Add Chemical"
            onAction={handleAddChemical}
          />
        ) : (
          <>
            {dueToday.length > 0 && (
              <>
                <SectionHeader title={`Due Today · ${today}`} />
                <View style={styles.list}>
                  {dueToday.map((chem) => (
                    <TouchableOpacity
                      key={chem.id}
                      onLongPress={() => handleDelete(chem.id, chem.name)}
                      delayLongPress={600}
                    >
                      <DosingCard
                        chemical={chem}
                        todayLog={getTodayLog(chem.id)}
                        lastDosed={getLastDosed(chem.id)}
                        isDue={isDueToday(chem)}
                        onToggle={() => toggleDoseComplete(chem.id, today)}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {notDueToday.length > 0 && (
              <>
                <SectionHeader title="Not Due Today" />
                <View style={styles.list}>
                  {notDueToday.map((chem) => (
                    <TouchableOpacity
                      key={chem.id}
                      onLongPress={() => handleDelete(chem.id, chem.name)}
                      delayLongPress={600}
                    >
                      <DosingCard
                        chemical={chem}
                        todayLog={getTodayLog(chem.id)}
                        lastDosed={getLastDosed(chem.id)}
                        isDue={false}
                        onToggle={() => toggleDoseComplete(chem.id, today)}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {!hasAccess && chemicals.length >= 2 && (
          <TouchableOpacity
            style={styles.proCallout}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.85}
          >
            <Text style={styles.proCalloutTitle}>✦ Unlock unlimited chemicals</Text>
            <Text style={styles.proCalloutSub}>
              Free plan: 2 chemicals. Pro: unlimited + reminders.
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.longPressHint}>Long-press a chemical to remove it</Text>
      </ScrollView>

      <AddChemicalModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveChemical}
      />
    </SafeAreaView>
  );
}

function AddChemicalModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<DosingChemical, 'id' | 'tankId'>) => void;
}) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState('mL');
  const [freq, setFreq] = useState('1');

  const handleSave = () => {
    if (!name.trim() || !dose) return;
    onSave({
      name: name.trim(),
      targetDose: parseFloat(dose),
      unit,
      frequencyDays: parseInt(freq) || 1,
    });
    setName('');
    setDose('');
    setUnit('mL');
    setFreq('1');
  };

  const UNITS = ['mL', 'g', 'tsp', 'tbsp'];
  const FREQS = [
    { value: '1', label: 'Daily' },
    { value: '2', label: 'Every 2 days' },
    { value: '3', label: 'Every 3 days' },
    { value: '7', label: 'Weekly' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Chemical</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Chemical Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Two Little Fishies Alk"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Dose Amount</Text>
            <View style={styles.doseRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={dose}
                onChangeText={setDose}
                placeholder="25"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
              <View style={styles.unitPicker}>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.freqGrid}>
              {FREQS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.freqChip, freq === f.value && styles.freqChipActive]}
                  onPress={() => setFreq(f.value)}
                >
                  <Text style={[styles.freqChipText, freq === f.value && styles.freqChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, (!name.trim() || !dose) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || !dose}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>Add Chemical</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  addButton: {
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  addButtonText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  list: { gap: Spacing.sm },
  proCallout: {
    backgroundColor: Colors.goldBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
    gap: Spacing.xs,
  },
  proCalloutTitle: { fontSize: 15, fontWeight: '700', color: Colors.gold },
  proCalloutSub: { fontSize: 13, color: Colors.textSecondary },
  longPressHint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },

  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalContent: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  modalCancel: { fontSize: 16, color: Colors.ocean },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  doseRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  unitPicker: { flexDirection: 'row', gap: Spacing.xs },
  unitChip: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipActive: { backgroundColor: Colors.ocean, borderColor: Colors.ocean },
  unitChipText: { fontSize: 13, color: Colors.textSecondary },
  unitChipTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  freqChip: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqChipActive: { backgroundColor: Colors.ocean, borderColor: Colors.ocean },
  freqChipText: { fontSize: 13, color: Colors.textSecondary },
  freqChipTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  saveButton: {
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
});
