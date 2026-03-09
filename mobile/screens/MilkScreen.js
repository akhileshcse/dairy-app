import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

export default function MilkScreen() {
    const [activeTab, setActiveTab] = useState('collection'); // 'collection' or 'dispatch'
    const [source, setSource] = useState('cow'); // 'cow' or 'buffalo'

    // Form State
    const [volume, setVolume] = useState('');
    const [rate, setRate] = useState('');
    const [fat, setFat] = useState('');
    const [snf, setSnf] = useState('');
    const [destination, setDestination] = useState('');
    const [shift, setShift] = useState('Morning');

    const handleSubmit = async () => {
        if (!volume) {
            Alert.alert('Error', 'Please enter a volume');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            const payload = {
                user_id: user.id,
                type: activeTab === 'collection' ? (source === 'cow' ? 'Cow' : 'Buffalo') : 'Mixed/Dispatch',
                source_destination: activeTab === 'collection' ? 'Collection' : 'Dispatch',
                shift: shift,
                volume: parseFloat(volume),
                rate_per_litre: rate ? parseFloat(rate) : null,
                fat: fat ? parseFloat(fat) : null,
                snf: snf ? parseFloat(snf) : null,
            };

            const { error } = await supabase.from('milk_logs').insert([payload]);

            if (error) throw error;

            Alert.alert('Success', `${activeTab === 'collection' ? 'Collection' : 'Dispatch'} Logged Successfully!`);
            setVolume(''); setRate(''); setFat(''); setSnf(''); setDestination('');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', `Failed to save to database. ${err.message || ''}`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'collection' && styles.activeTab]}
                    onPress={() => setActiveTab('collection')}
                >
                    <Text style={[styles.tabText, activeTab === 'collection' && styles.activeTabText]}>Collection (In)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'dispatch' && styles.activeTab]}
                    onPress={() => setActiveTab('dispatch')}
                >
                    <Text style={[styles.tabText, activeTab === 'dispatch' && styles.activeTabText]}>Dispatch (Out)</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                {activeTab === 'collection' ? (
                    <>
                        <Text style={styles.sectionTitle}>Milk Source</Text>
                        <View style={styles.sourceSelector}>
                            <TouchableOpacity
                                style={[styles.sourceButton, source === 'cow' && styles.activeSourceCow]}
                                onPress={() => setSource('cow')}
                            >
                                <Text style={[styles.sourceText, source === 'cow' && styles.activeSourceText]}>Cow</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sourceButton, source === 'buffalo' && styles.activeSourceBuffalo]}
                                onPress={() => setSource('buffalo')}
                            >
                                <Text style={[styles.sourceText, source === 'buffalo' && styles.activeSourceText]}>Buffalo</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Shift</Text>
                        <View style={styles.sourceSelector}>
                            <TouchableOpacity
                                style={[styles.sourceButton, shift === 'Morning' && styles.activeShift]}
                                onPress={() => setShift('Morning')}
                            >
                                <Text style={[styles.sourceText, shift === 'Morning' && styles.activeSourceText]}>Morning</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sourceButton, shift === 'Evening' && styles.activeShift]}
                                onPress={() => setShift('Evening')}
                            >
                                <Text style={[styles.sourceText, shift === 'Evening' && styles.activeSourceText]}>Evening</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInputContainer}>
                                <Text style={styles.label}>Volume (Liters) *</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="e.g. 15.5"
                                    value={volume}
                                    onChangeText={setVolume}
                                />
                            </View>
                            <View style={styles.halfInputContainer}>
                                <Text style={styles.label}>Rate / L (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="e.g. 52.5"
                                    value={rate}
                                    onChangeText={setRate}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInputContainer}>
                                <Text style={styles.label}>Fat %</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="e.g. 4.2"
                                    value={fat}
                                    onChangeText={setFat}
                                />
                            </View>
                            <View style={styles.halfInputContainer}>
                                <Text style={styles.label}>SNF %</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="e.g. 8.5"
                                    value={snf}
                                    onChangeText={setSnf}
                                />
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Dispatch Details</Text>
                        <Text style={styles.sectionTitle}>Shift</Text>
                        <View style={styles.sourceSelector}>
                            <TouchableOpacity
                                style={[styles.sourceButton, shift === 'Morning' && styles.activeShift]}
                                onPress={() => setShift('Morning')}
                            >
                                <Text style={[styles.sourceText, shift === 'Morning' && styles.activeSourceText]}>Morning</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sourceButton, shift === 'Evening' && styles.activeShift]}
                                onPress={() => setShift('Evening')}
                            >
                                <Text style={[styles.sourceText, shift === 'Evening' && styles.activeSourceText]}>Evening</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInputContainer}>
                                <Text style={styles.label}>Volume (Liters) *</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="e.g. 50"
                                    value={volume}
                                    onChangeText={setVolume}
                                />
                            </View>
                            <View style={styles.halfInputContainer}>
                                <Text style={styles.label}>Rate / L (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="e.g. 45"
                                    value={rate}
                                    onChangeText={setRate}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Destination / Buyer *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Local Dairy Co-op"
                            value={destination}
                            onChangeText={setDestination}
                        />
                    </>
                )}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Save Data</Text>
                </TouchableOpacity>
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
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    sourceSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sourceButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginHorizontal: 4,
    },
    activeSourceCow: {
        backgroundColor: '#2563eb', // blue-600
        borderColor: '#2563eb',
    },
    activeSourceBuffalo: {
        backgroundColor: '#1f2937', // gray-800
        borderColor: '#1f2937',
    },
    activeShift: {
        backgroundColor: '#059669', // emerald-600
        borderColor: '#059669',
    },
    sourceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
    },
    activeSourceText: {
        color: '#fff',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInputContainer: {
        flex: 0.48,
    },
    submitButton: {
        backgroundColor: '#16a34a', // green-600
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
