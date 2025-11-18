
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  cancelAnimation,
  withRepeat,
  Easing,
  FadeIn,
  FadeOut,
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
  points: number;
}

const AVAILABLE_PRIZES = [
  { emoji: '🧸', name: 'Teddy Bear', points: 10 },
  { emoji: '🎮', name: 'Game Console', points: 50 },
  { emoji: '🎁', name: 'Gift Box', points: 15 },
  { emoji: '⚽', name: 'Soccer Ball', points: 20 },
  { emoji: '🎸', name: 'Guitar', points: 35 },
  { emoji: '🎨', name: 'Art Set', points: 25 },
  { emoji: '📱', name: 'Phone', points: 100 },
  { emoji: '🎧', name: 'Headphones', points: 40 },
  { emoji: '⌚', name: 'Watch', points: 75 },
  { emoji: '🎪', name: 'Circus Tent', points: 30 },
];

export default function ClawMachineScreen() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [clawState, setClawState] = useState<'open' | 'closed'>('closed');
  const [attempts, setAttempts] = useState(5);
  const [wonPrizes, setWonPrizes] = useState<Prize[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [tipMessage, setTipMessage] = useState<string>('');
  const [showTip, setShowTip] = useState(false);

  const clawX = useSharedValue(0);
  const clawY = useSharedValue(0);
  const clawRotation = useSharedValue(0);
  
  // Use refs to avoid stale closures
  const prizesRef = useRef<Prize[]>([]);
  const isGrabbingRef = useRef(false);

  useEffect(() => {
    prizesRef.current = prizes;
  }, [prizes]);

  useEffect(() => {
    isGrabbingRef.current = isGrabbing;
  }, [isGrabbing]);

  useEffect(() => {
    initializePrizes();
    startContinuousMovement();

    return () => {
      cancelAnimation(clawX);
    };
  }, []);

  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showTip]);

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
        points: randomPrize.points,
      });
    }
    setPrizes(newPrizes);
    prizesRef.current = newPrizes;
  };

  const startContinuousMovement = (startPosition?: number) => {
    const currentPosition = startPosition !== undefined ? startPosition : 0;
    clawX.value = currentPosition;
    const maxPosition = MACHINE_WIDTH - CLAW_SIZE;
    const cycleDuration = 4000;
    
    clawX.value = withRepeat(
      withSequence(
        withTiming(maxPosition, {
          duration: cycleDuration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: cycleDuration / 2,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  };

  const showTipText = (message: string) => {
    setTipMessage(message);
    setShowTip(true);
  };

  const checkPrizeCapture = (finalX: number, finalY: number) => {
    console.log('Checking prize capture at position:', finalX, finalY);
    
    const currentPrizes = prizesRef.current;
    const capturedPrize = currentPrizes.find(prize => {
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
      console.log('Prize captured:', capturedPrize.name);
      
      // Update state in a single batch
      setWonPrizes(prev => [...prev, capturedPrize]);
      setTotalPoints(prev => prev + capturedPrize.points);
      setPrizes(prev => {
        const updated = prev.filter(p => p.id !== capturedPrize.id);
        prizesRef.current = updated;
        return updated;
      });
      
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics error:', error);
      }
      
      showTipText(`🎉 You won a ${capturedPrize.name}! +${capturedPrize.points} points`);
      return true;
    } else {
      console.log('No prize captured');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptics error:', error);
      }
      return false;
    }
  };

  const handleGrabComplete = () => {
    console.log('Grab complete, resetting');
    setIsGrabbing(false);
    isGrabbingRef.current = false;
    cancelAnimation(clawX);
    clawX.value = 0;
    startContinuousMovement(0);
  };

  const grab = () => {
    if (isGrabbingRef.current || attempts <= 0) {
      console.log('Cannot grab - already grabbing or no attempts');
      return;
    }
    
    console.log('Starting grab sequence');
    setIsGrabbing(true);
    isGrabbingRef.current = true;
    setAttempts(prev => prev - 1);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics error:', error);
    }

    // Capture current position
    const currentX = clawX.value;
    cancelAnimation(clawX);
    clawX.value = currentX;

    // Open the claw
    setClawState('open');

    // Simplified descent animation without frame-by-frame collision detection
    const targetY = 250;
    const descentDuration = 1500;

    // Start descent
    clawY.value = withTiming(targetY, { duration: descentDuration }, (finished) => {
      if (finished) {
        console.log('Descent finished');
        // Close claw after reaching bottom
        runOnJS(setClawState)('closed');
        
        // Small delay before checking capture
        clawY.value = withTiming(targetY, { duration: 300 }, (finished2) => {
          if (finished2) {
            // Check for prize capture
            const captured = checkPrizeCapture(currentX, targetY);
            console.log('Prize capture result:', captured);
            
            // Return to top
            clawY.value = withTiming(0, { duration: 1000 }, (finished3) => {
              if (finished3) {
                runOnJS(handleGrabComplete)();
              }
            });
          }
        });
      }
    });

    // Add swing animation
    clawRotation.value = withSequence(
      withTiming(3, { duration: 500 }),
      withTiming(-3, { duration: 500 }),
      withTiming(0, { duration: 500 })
    );
  };

  const resetGame = () => {
    if (isGrabbingRef.current) {
      console.log('Cannot reset - grab in progress');
      return;
    }
    
    console.log('Resetting game');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics error:', error);
    }
    
    setAttempts(5);
    setWonPrizes([]);
    setTotalPoints(0);
    setClawState('closed');
    initializePrizes();
    clawY.value = withSpring(0);
    clawRotation.value = withSpring(0);
    
    cancelAnimation(clawX);
    clawX.value = 0;
    startContinuousMovement(0);
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
        <View style={styles.statsContainer}>
          <Text style={styles.attemptsText}>Attempts: {attempts}</Text>
          <Text style={styles.wonText}>Points: {totalPoints}</Text>
        </View>
      </View>

      {showTip && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(300)}
          style={styles.tipContainer}
        >
          <Text style={styles.tipText}>{tipMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.machineContainer}>
        <View style={[styles.machine, { width: MACHINE_WIDTH }]}>
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
        <Text style={styles.instructionText}>
          The claw moves automatically! Press GRAB when ready.
        </Text>

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
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
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
  tipContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 100,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.25)',
    elevation: 8,
  },
  tipText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    textAlign: 'center',
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
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
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
