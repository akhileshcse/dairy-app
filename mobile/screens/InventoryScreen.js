import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

export default function InventoryScreen() {
    const [activeTab, setActiveTab] = useState('usage'); // 'usage' or 'restock'

    const [feedType, setFeedType] = useState('dry'); // 'dry', 'green', 'concentrate'
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount.');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            let mappedFeedType = '';
            if (feedType === 'dry') mappedFeedType = 'Dry Fodder (Bhusa)';
            else if (feedType === 'green') mappedFeedType = 'Green Fodder';
            else mappedFeedType = 'Other Feed';

            const { error } = await supabase.from('inventory_logs').insert([{
                user_id: user.id,
                feed_type: mappedFeedType,
                type: activeTab === 'restock' ? 'Add_Stock' : 'Consume_Stock',
                amount: parseFloat(amount),
                notes: activeTab === 'restock' ? notes : null
            }]);

            if (error) throw error;
            Alert.alert('Success', `Feed ${activeTab === 'usage' ? 'Usage' : 'Restock'} Logged!`);
            setAmount(''); setNotes('');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to connect to database.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'usage' && styles.activeTab]}
                    onPress={() => setActiveTab('usage')}
                >
                    <Text style={[styles.tabText, activeTab === 'usage' && styles.activeTabText]}>Daily Usage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'restock' && styles.activeTab]}
                    onPress={() => setActiveTab('restock')}
                >
                    <Text style={[styles.tabText, activeTab === 'restock' && styles.activeTabText]}>Restock (In)</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Feed Type</Text>
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeButton, feedType === 'dry' && styles.activeTypeBtn]}
                        onPress={() => setFeedType('dry')}
                    >
                        <Text style={[styles.typeText, feedType === 'dry' && styles.activeTypeText]}>Dry Fodder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, feedType === 'green' && styles.activeTypeBtn]}
                        onPress={() => setFeedType('green')}
                    >
                        <Text style={[styles.typeText, feedType === 'green' && styles.activeTypeText]}>Green Fodder</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.typeButton, feedType === 'concentrate' && styles.activeTypeBtn, { marginBottom: 20 }]}
                    onPress={() => setFeedType('concentrate')}
                >
                    <Text style={[styles.typeText, feedType === 'concentrate' && styles.activeTypeText]}>Concentrates / Pellets</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Amount (Kg) *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="e.g. 50"
                    value={amount}
                    onChangeText={setAmount}
                />

                {activeTab === 'restock' && (
                    <>
                        <Text style={styles.label}>Supplier / Cost Notes</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Purchased from Local Mill, $100"
                            value={notes}
                            onChangeText={setNotes}
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
        backgroundColor: '#eff6ff',
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
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginHorizontal: 4,
    },
    activeTypeBtn: {
        backgroundColor: '#d97706', // amber-600 for feed
        borderColor: '#d97706',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    activeTypeText: {
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
