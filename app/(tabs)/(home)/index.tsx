
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="gamecontroller.fill" 
            android_material_icon_name="sports_esports" 
            size={80} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Virtual Claw Machine</Text>
          <Text style={styles.subtitle}>Test your skills and win prizes!</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => router.push('/clawMachine')}
          >
            <IconSymbol 
              ios_icon_name="play.circle.fill" 
              android_material_icon_name="play_circle" 
              size={32} 
              color={colors.card} 
            />
            <Text style={styles.playButtonText}>Play Game</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.prizesButton}
            onPress={() => router.push('/prizes')}
          >
            <IconSymbol 
              ios_icon_name="trophy.fill" 
              android_material_icon_name="emoji_events" 
              size={28} 
              color={colors.primary} 
            />
            <Text style={styles.prizesButtonText}>My Prizes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Play</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Use the arrow buttons to move the claw left and right</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Press the down arrow to move the claw forward</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Press GRAB to try and catch a prize</Text>
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
    paddingBottom: 120,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(41, 98, 255, 0.3)',
    elevation: 4,
  },
  playButtonText: {
    color: colors.card,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  prizesButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  prizesButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
});
