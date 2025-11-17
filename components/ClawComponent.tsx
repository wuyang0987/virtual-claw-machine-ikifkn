
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';

interface ClawComponentProps {
  isGrabbing: boolean;
  clawState: 'open' | 'closed';
}

export default function ClawComponent({ isGrabbing, clawState }: ClawComponentProps) {
  const leftClawStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: clawState === 'open'
            ? withTiming('-35deg', { duration: 400, easing: Easing.inOut(Easing.ease) })
            : withTiming('0deg', { duration: 400, easing: Easing.inOut(Easing.ease) }),
        },
      ],
    };
  });

  const rightClawStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: clawState === 'open'
            ? withTiming('35deg', { duration: 400, easing: Easing.inOut(Easing.ease) })
            : withTiming('0deg', { duration: 400, easing: Easing.inOut(Easing.ease) }),
        },
      ],
    };
  });

  return (
    <View style={styles.clawContainer}>
      {/* Cable */}
      <View style={styles.cable} />
      
      {/* Claw mechanism */}
      <View style={styles.clawMechanism}>
        {/* Top connector */}
        <View style={styles.topConnector} />
        
        {/* Left claw arm */}
        <Animated.View style={[styles.clawArm, styles.leftArm, leftClawStyle]}>
          <View style={styles.clawFinger} />
        </Animated.View>
        
        {/* Right claw arm */}
        <Animated.View style={[styles.clawArm, styles.rightArm, rightClawStyle]}>
          <View style={styles.clawFinger} />
        </Animated.View>
        
        {/* Center claw arm */}
        <View style={styles.centerArm}>
          <View style={styles.clawFinger} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clawContainer: {
    width: 60,
    height: 80,
    alignItems: 'center',
  },
  cable: {
    width: 3,
    height: 20,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  clawMechanism: {
    width: 50,
    height: 60,
    alignItems: 'center',
    position: 'relative',
  },
  topConnector: {
    width: 20,
    height: 12,
    backgroundColor: '#888',
    borderRadius: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#555',
  },
  clawArm: {
    position: 'absolute',
    top: 12,
    width: 8,
    height: 35,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#DAA520',
  },
  leftArm: {
    left: 8,
    transformOrigin: 'top center',
  },
  rightArm: {
    right: 8,
    transformOrigin: 'top center',
  },
  centerArm: {
    position: 'absolute',
    top: 12,
    width: 8,
    height: 35,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#DAA520',
  },
  clawFinger: {
    position: 'absolute',
    bottom: -8,
    left: -2,
    width: 12,
    height: 12,
    backgroundColor: '#C0C0C0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#888',
  },
});
