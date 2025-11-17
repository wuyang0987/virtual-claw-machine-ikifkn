
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
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import ClawComponent from '@/components/ClawComponent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MACHINE_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
const CLAW_SIZE = 60;
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
  const [clawState, setClawState] = useState<'open' | 'closed'>('closed');
  const [attempts, setAttempts] = useState(5);
  const [wonPrizes, setWonPrizes] = useState<Prize[]>([]);

  const clawX = useSharedValue(MACHINE_WIDTH / 2 - CLAW_SIZE / 2);
  const clawY = useSharedValue(0);
  const clawRotation = useSharedValue(0);

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
    clawX.value = withSpring(Math.max(0, clawX.value - 40), {
      damping: 15,
      stiffness: 150,
    });
    clawRotation.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
  };

  const moveRight = () => {
    if (isGrabbing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clawX.value = withSpring(Math.min(MACHINE_WIDTH - CLAW_SIZE, clawX.value + 40), {
      damping: 15,
      stiffness: 150,
    });
    clawRotation.value = withSequence(
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
  };

  const checkCollisionDuringDescent = (currentX: number, currentY: number): Prize | null => {
    // Check if claw is touching any prize during descent
    const touchedPrize = prizes.find(prize => {
      const clawCenterX = currentX + CLAW_SIZE / 2;
      const clawBottomY = currentY + 60; // Claw mechanism height
      
      const prizeCenterX = prize.x + PRIZE_SIZE / 2;
      const prizeCenterY = prize.y + PRIZE_SIZE / 2;
      
      const distance = Math.sqrt(
        Math.pow(prizeCenterX - clawCenterX, 2) + 
        Math.pow(prizeCenterY - clawBottomY, 2)
      );
      
      // Collision threshold - stop when claw gets close to prize
      return distance < 45;
    });

    return touchedPrize || null;
  };

  const checkPrizeCapture = (finalX: number, finalY: number): Prize | null => {
    const capturedPrize = prizes.find(prize => {
      const clawCenterX = finalX + CLAW_SIZE / 2;
      const clawBottomY = finalY + 60;
      
      const prizeCenterX = prize.x + PRIZE_SIZE / 2;
      const prizeCenterY = prize.y + PRIZE_SIZE / 2;
      
      const distance = Math.sqrt(
        Math.pow(prizeCenterX - clawCenterX, 2) + 
        Math.pow(prizeCenterY - clawBottomY, 2)
      );
      
      return distance < 50;
    });

    if (capturedPrize && Math.random() > 0.3) {
      setWonPrizes(prev => [...prev, capturedPrize]);
      setPrizes(prev => prev.filter(p => p.id !== capturedPrize.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        Alert.alert('🎉 Success!', `You won a ${capturedPrize.name}!`);
      }, 500);
      
      return capturedPrize;
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return null;
    }
  };

  const grab = () => {
    if (isGrabbing || attempts <= 0) return;
    
    setIsGrabbing(true);
    setAttempts(prev => prev - 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const currentX = clawX.value;

    // Open the claw immediately when grab is pressed
    setClawState('open');

    // Create a frame-by-frame descent animation with collision detection
    let animationCancelled = false;
    let finalY = 0;
    let touchedPrize: Prize | null = null;

    const descendWithCollisionCheck = () => {
      const targetY = 250;
      const duration = 1500;
      const startTime = Date.now();

      const checkFrame = () => {
        if (animationCancelled) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentY = progress * targetY;

        // Check for collision at current position
        const collision = checkCollisionDuringDescent(currentX, currentY);
        
        if (collision) {
          // Stop descent immediately when touching a prize
          animationCancelled = true;
          touchedPrize = collision;
          finalY = currentY;
          
          // Cancel the animation and set to current position
          cancelAnimation(clawY);
          clawY.value = currentY;
          
          // Close the claw and capture the prize
          runOnJS(setClawState)('closed');
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          
          // Wait a moment then return to top
          setTimeout(() => {
            const captured = checkPrizeCapture(currentX, currentY);
            
            clawY.value = withTiming(0, { duration: 1000 }, () => {
              runOnJS(setIsGrabbing)(false);
            });
          }, 500);
          
          return;
        }

        if (progress < 1) {
          // Continue checking
          requestAnimationFrame(checkFrame);
        } else {
          // Reached bottom without collision
          finalY = targetY;
          
          // Hold at bottom for grabbing
          setTimeout(() => {
            const captured = checkPrizeCapture(currentX, targetY);
            if (!captured) {
              runOnJS(setClawState)('closed');
            } else {
              runOnJS(setClawState)('closed');
            }
            
            // Return to top
            clawY.value = withTiming(0, { duration: 1000 }, () => {
              runOnJS(setIsGrabbing)(false);
            });
          }, 500);
        }
      };

      // Start the descent animation
      clawY.value = withTiming(targetY, { duration: duration });
      
      // Start collision checking
      requestAnimationFrame(checkFrame);
    };

    descendWithCollisionCheck();

    // Add slight swing animation
    clawRotation.value = withSequence(
      withTiming(3, { duration: 500 }),
      withTiming(-3, { duration: 500 }),
      withTiming(0, { duration: 500 })
    );
  };

  const resetGame = () => {
    if (isGrabbing) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAttempts(5);
    setWonPrizes([]);
    setClawState('closed');
    initializePrizes();
    clawX.value = withSpring(MACHINE_WIDTH / 2 - CLAW_SIZE / 2);
    clawY.value = withSpring(0);
    clawRotation.value = withSpring(0);
  };

  const clawAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: clawX.value },
      { translateY: clawY.value },
      { rotate: `${clawRotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="chevron-left" 
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
          {/* Top rail */}
          <View style={styles.topRail} />
          
          <Animated.View style={[styles.claw, clawAnimatedStyle]}>
            <ClawComponent isGrabbing={isGrabbing} clawState={clawState} clawY={clawY} />
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
          <View style={styles.horizontalRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={moveLeft}
              disabled={isGrabbing}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="chevron-left" 
                size={32} 
                color={colors.card} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={moveRight}
              disabled={isGrabbing}
            >
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron-right" 
                size={32} 
                color={colors.card} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.grabButton, (isGrabbing || attempts <= 0) && styles.grabButtonDisabled]}
            onPress={grab}
            disabled={isGrabbing || attempts <= 0}
          >
            <Text style={styles.grabButtonText}>
              {isGrabbing ? 'GRABBING...' : attempts <= 0 ? 'NO ATTEMPTS' : 'GRAB'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.resetButton, isGrabbing && styles.resetButtonDisabled]} 
            onPress={resetGame}
            disabled={isGrabbing}
          >
            <IconSymbol 
              ios_icon_name="arrow.clockwise" 
              android_material_icon_name="refresh" 
              size={20} 
              color={colors.card} 
            />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
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
  topRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#444',
    borderBottomWidth: 2,
    borderBottomColor: '#222',
  },
  claw: {
    position: 'absolute',
    width: CLAW_SIZE,
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 10,
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
  horizontalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 100,
  },
  controlButton: {
    backgroundColor: colors.secondary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  grabButton: {
    backgroundColor: colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
