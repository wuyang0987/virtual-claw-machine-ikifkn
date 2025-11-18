
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import FunClawLogo from "@/components/FunClawLogo";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <FunClawLogo size={140} />
          <Text style={styles.title}>Fun Claw</Text>
          <Text style={styles.subtitle}>Test your skills and win prizes!</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => router.push('/clawMachine')}
          >
            <Text style={styles.playButtonText}>Play Game</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Play</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Claw moves automatically left to right</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Press GRAB over a prize</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Collect as many prizes as you can!</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 40,
  },
  playButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    boxShadow: '0px 6px 16px rgba(41, 98, 255, 0.4)',
    elevation: 6,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 18,
    color: colors.primary,
    marginRight: 10,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
});
