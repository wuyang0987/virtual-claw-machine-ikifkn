
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MACHINE_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
const CLAW_SIZE = 50;
const PRIZE_SIZE = 40;

interface Prize {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
}

const AVAILABLE_PRIZES = [
  { emoji: '🧸', name: 'Teddy Bear' },
  { emoji: '🎮', name: 'Game Console' },
  { emoji: '🎁', name: 'Gift Box' },
  { emoji: '⚽', name: 'Soccer Ball' },
  { emoji: '🎸', name: 'Guitar' },
  { emoji: '🎨', name: 'Art Set' },
  { emoji: '📱', name: 'Phone' },
  { emoji: '🎧', name: 'Headphones' },
  { emoji: '⌚', name: 'Watch' },
  { emoji: '🎪', name: 'Circus Tent' },
];

export default function ClawMachineScreen() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [attempts, setAttempts] = useState(5);
  const [wonPrizes, setWonPrizes] = useState<Prize[]>([]);

  const clawX = useSharedValue(MACHINE_WIDTH / 2 - CLAW_SIZE / 2);
  const clawY = useSharedValue(0);

  useEffect(() => {
    initializePrizes();
  }, []);

  const initializePrizes = () => {
    const newPrizes: Prize[] = [];
    for (let i = 0; i < 8; i++) {
      const randomPrize = AVAILABLE_PRIZES[Math.floor(Math.random() * AVAILABLE_PRIZES.length)];
      newPrizes.push({
        id: i,
        x: Math.random() * (MACHINE_WIDTH - PRIZE_SIZE - 40) + 20,
        y: Math.random() * 80 + 200,
        emoji: randomPrize.emoji,
        name: randomPrize.name,
      });
    }
    setPrizes(newPrizes);
  };

  const moveLeft = () => {
    if (isGrabbing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clawX.value = withSpring(Math.max(0, clawX.value - 40));
  };

  const moveRight = () => {
    if (isGrabbing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clawX.value = withSpring(Math.min(MACHINE_WIDTH - CLAW_SIZE, clawX.value + 40));
  };

  const moveForward = () => {
    if (isGrabbing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clawY.value = withSpring(Math.min(100, clawY.value + 40));
  };

  const checkPrizeCapture = (finalX: number, finalY: number) => {
    const capturedPrize = prizes.find(prize => {
      const distance = Math.sqrt(
        Math.pow(prize.x - finalX, 2) + Math.pow(prize.y - finalY, 2)
      );
      return distance < 50;
    });

    if (capturedPrize && Math.random() > 0.3) {
      setWonPrizes(prev => [...prev, capturedPrize]);
      setPrizes(prev => prev.filter(p => p.id !== capturedPrize.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 Success!', `You won a ${capturedPrize.name}!`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const grab = () => {
    if (isGrabbing || attempts <= 0) return;
    
    setIsGrabbing(true);
    setAttempts(prev => prev - 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const currentX = clawX.value;
    const currentY = clawY.value;

    clawY.value = withSequence(
      withTiming(250, { duration: 800 }),
      withTiming(currentY, { duration: 800 }, () => {
        runOnJS(checkPrizeCapture)(currentX, 250);
        runOnJS(setIsGrabbing)(false);
      })
    );
  };

  const resetGame = () => {
    setAttempts(5);
    setWonPrizes([]);
    initializePrizes();
    clawX.value = withSpring(MACHINE_WIDTH / 2 - CLAW_SIZE / 2);
    clawY.value = withSpring(0);
  };

  const clawAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: clawX.value },
      { translateY: clawY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text} 
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.statsContainer}>
          <Text style={styles.attemptsText}>Attempts: {attempts}</Text>
          <Text style={styles.wonText}>Won: {wonPrizes.length}</Text>
        </View>
      </View>

      <View style={styles.machineContainer}>
        <View style={[styles.machine, { width: MACHINE_WIDTH }]}>
          <Animated.View style={[styles.claw, clawAnimatedStyle]}>
            <Text style={styles.clawText}>🦾</Text>
          </Animated.View>

          {prizes.map((prize, index) => (
            <View
              key={index}
              style={[
                styles.prize,
                {
                  left: prize.x,
                  top: prize.y,
                },
              ]}
            >
              <Text style={styles.prizeEmoji}>{prize.emoji}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.directionControls}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={moveForward}
              disabled={isGrabbing}
            >
              <IconSymbol 
                ios_icon_name="arrow.down" 
                android_material_icon_name="arrow_downward" 
                size={28} 
                color={colors.card} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={moveLeft}
              disabled={isGrabbing}
            >
              <IconSymbol 
                ios_icon_name="arrow.left" 
                android_material_icon_name="arrow_back" 
                size={28} 
                color={colors.card} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={moveRight}
              disabled={isGrabbing}
            >
              <IconSymbol 
                ios_icon_name="arrow.right" 
                android_material_icon_name="arrow_forward" 
                size={28} 
                color={colors.card} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.grabButton, (isGrabbing || attempts <= 0) && styles.grabButtonDisabled]}
          onPress={grab}
          disabled={isGrabbing || attempts <= 0}
        >
          <Text style={styles.grabButtonText}>
            {isGrabbing ? 'GRABBING...' : attempts <= 0 ? 'NO ATTEMPTS' : 'GRAB'}
          </Text>
        </TouchableOpacity>

        {attempts <= 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.resetButtonText}>Play Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  attemptsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  wonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  machineContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  machine: {
    height: 350,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.primary,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  claw: {
    position: 'absolute',
    width: CLAW_SIZE,
    height: CLAW_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  clawText: {
    fontSize: 40,
  },
  prize: {
    position: 'absolute',
    width: PRIZE_SIZE,
    height: PRIZE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeEmoji: {
    fontSize: 32,
  },
  controls: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  directionControls: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
  },
  controlButton: {
    backgroundColor: colors.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  grabButton: {
    backgroundColor: colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: '0px 4px 12px rgba(255, 213, 79, 0.4)',
    elevation: 4,
  },
  grabButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  grabButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
