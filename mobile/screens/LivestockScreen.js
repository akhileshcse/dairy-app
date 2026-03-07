import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

export default function LivestockScreen() {
    const [activeTab, setActiveTab] = useState('count'); // 'count' or 'health'

    // Counters State
    const [counts, setCounts] = useState({
        cowMilking: 0, cowDry: 0, cowHeifer: 0, cowCalves: 0,
        buffaloMilking: 0, buffaloDry: 0, buffaloHeifer: 0, buffaloCalves: 0,
    });

    const updateCount = (key, delta) => {
        setCounts(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
    };

    const API_URL = 'http://192.168.29.105:3001/api/livestock';

    const handleSaveCounts = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type: 'count', counts })
            });
            if (!resp.ok) throw new Error('Network Error');
            Alert.alert('Success', 'Livestock counts updated successfully!');
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to dashboard server.');
        }
    };

    // Health State
    const [animalId, setAnimalId] = useState('');
    const [healthNotes, setHealthNotes] = useState('');

    const handleSaveHealth = async () => {
        if (!animalId || !healthNotes) {
            Alert.alert('Error', 'Please fill all health log fields.');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type: 'health', animalId, healthNotes })
            });
            if (!resp.ok) throw new Error('Network Error');
            Alert.alert('Success', `Health log for ${animalId} saved!`);
            setAnimalId(''); setHealthNotes('');
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to dashboard server.');
        }
    };

    const CounterRow = ({ title, objKey }) => (
        <View style={styles.counterRow}>
            <Text style={styles.counterTitle}>{title}</Text>
            <View style={styles.counterControls}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => updateCount(objKey, -1)}>
                    <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{counts[objKey]}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => updateCount(objKey, 1)}>
                    <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'count' && styles.activeTab]}
                    onPress={() => setActiveTab('count')}
                >
                    <Text style={[styles.tabText, activeTab === 'count' && styles.activeTabText]}>Daily Count</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'health' && styles.activeTab]}
                    onPress={() => setActiveTab('health')}
                >
                    <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>Health Logs</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                {activeTab === 'count' ? (
                    <>
                        <Text style={styles.sectionTitle}>Cows</Text>
                        <CounterRow title="Milking" objKey="cowMilking" />
                        <CounterRow title="Dry" objKey="cowDry" />
                        <CounterRow title="Heifer" objKey="cowHeifer" />
                        <CounterRow title="Calves" objKey="cowCalves" />

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Buffaloes</Text>
                        <CounterRow title="Milking" objKey="buffaloMilking" />
                        <CounterRow title="Dry" objKey="buffaloDry" />
                        <CounterRow title="Heifer" objKey="buffaloHeifer" />
                        <CounterRow title="Calves" objKey="buffaloCalves" />

                        <TouchableOpacity style={styles.submitButton} onPress={handleSaveCounts}>
                            <Text style={styles.submitButtonText}>Update Counts</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Log Veterinary Visit / Checkup</Text>

                        <Text style={styles.label}>Animal ID / Tag *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. C-102"
                            value={animalId}
                            onChangeText={setAnimalId}
                        />

                        <Text style={styles.label}>Notes / Vaccination / Treatment *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="e.g. FMD Vaccine administered"
                            value={healthNotes}
                            onChangeText={setHealthNotes}
                            multiline
                            numberOfLines={4}
                        />

                        <TouchableOpacity style={styles.submitButton} onPress={handleSaveHealth}>
                            <Text style={styles.submitButtonText}>Save Log</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 8,
        margin: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#eff6ff', // blue-50
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#2563eb',
        fontWeight: 'bold',
    },
    formContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    counterTitle: {
        fontSize: 16,
        color: '#4b5563',
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterBtn: {
        backgroundColor: '#f3f4f6',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    counterBtnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        lineHeight: 22,
    },
    counterValue: {
        fontSize: 18,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#16a34a', // green-600
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
