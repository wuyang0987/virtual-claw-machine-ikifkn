
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';

interface ClawComponentProps {
  isGrabbing: boolean;
  clawState: 'open' | 'closed';
  clawY: Animated.SharedValue<number>;
}

export default function ClawComponent({ isGrabbing, clawState, clawY }: ClawComponentProps) {
  // Animate left claw arm with wider opening
  const leftClawStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: clawState === 'open'
            ? withTiming('-50deg', { duration: 400, easing: Easing.inOut(Easing.ease) })
            : withTiming('0deg', { duration: 400, easing: Easing.inOut(Easing.ease) }),
        },
      ],
      opacity: clawState === 'open' ? withTiming(0.9) : withTiming(1),
    };
  });

  // Animate right claw arm with wider opening
  const rightClawStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: clawState === 'open'
            ? withTiming('50deg', { duration: 400, easing: Easing.inOut(Easing.ease) })
            : withTiming('0deg', { duration: 400, easing: Easing.inOut(Easing.ease) }),
        },
      ],
      opacity: clawState === 'open' ? withTiming(0.9) : withTiming(1),
    };
  });

  // Animate the rope length based on claw position - rope always sticks to top
  const ropeStyle = useAnimatedStyle(() => {
    // The rope extends from the top (0) to the current claw position
    // Add the claw mechanism height to reach the top of the claw
    const ropeHeight = Math.max(10, clawY.value);
    
    return {
      height: ropeHeight,
    };
  });

  // Add pulsing effect when claw is open
  const mechanismStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: clawState === 'open'
            ? withTiming(1.05, { duration: 400 })
            : withTiming(1, { duration: 400 }),
        },
      ],
    };
  });

  return (
    <View style={styles.clawContainer}>
      {/* Dynamic Rope - always extends from top to claw */}
      <Animated.View style={[styles.rope, ropeStyle]}>
        <View style={styles.ropePattern} />
      </Animated.View>
      
      {/* Claw mechanism */}
      <Animated.View style={[styles.clawMechanism, mechanismStyle]}>
        {/* Top connector with metallic look */}
        <View style={styles.topConnector}>
          <View style={styles.connectorHighlight} />
        </View>
        
        {/* Left claw arm */}
        <Animated.View style={[styles.clawArm, styles.leftArm, leftClawStyle]}>
          <View style={styles.armHighlight} />
          <View style={styles.clawFinger}>
            <View style={styles.fingerTip} />
          </View>
        </Animated.View>
        
        {/* Right claw arm */}
        <Animated.View style={[styles.clawArm, styles.rightArm, rightClawStyle]}>
          <View style={styles.armHighlight} />
          <View style={styles.clawFinger}>
            <View style={styles.fingerTip} />
          </View>
        </Animated.View>
        
        {/* Center claw arm */}
        <View style={styles.centerArm}>
          <View style={styles.armHighlight} />
          <View style={styles.clawFinger}>
            <View style={styles.fingerTip} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clawContainer: {
    width: 60,
    height: 80,
    alignItems: 'center',
    position: 'relative',
  },
  rope: {
    position: 'absolute',
    top: -1000, // Start way above to ensure it connects to the top
    left: '50%',
    marginLeft: -2,
    width: 4,
    backgroundColor: '#8B7355',
    borderRadius: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    borderLeftWidth: 1,
    borderLeftColor: '#6B5345',
    borderRightWidth: 1,
    borderRightColor: '#AB9375',
    zIndex: -1,
  },
  ropePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  clawMechanism: {
    width: 50,
    height: 60,
    alignItems: 'center',
    position: 'relative',
    marginTop: 0,
  },
  topConnector: {
    width: 24,
    height: 14,
    backgroundColor: '#4A4A4A',
    borderRadius: 7,
    marginBottom: 2,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectorHighlight: {
    width: 16,
    height: 4,
    backgroundColor: '#6A6A6A',
    borderRadius: 2,
  },
  clawArm: {
    position: 'absolute',
    top: 12,
    width: 10,
    height: 38,
    backgroundColor: '#FFB700',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CC9200',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  armHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 3,
    height: 20,
    backgroundColor: '#FFD54F',
    borderRadius: 2,
    opacity: 0.7,
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
    width: 10,
    height: 38,
    backgroundColor: '#FFB700',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CC9200',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  clawFinger: {
    position: 'absolute',
    bottom: -10,
    left: -3,
    width: 16,
    height: 16,
    backgroundColor: '#B8B8B8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#787878',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerTip: {
    width: 6,
    height: 6,
    backgroundColor: '#606060',
    borderRadius: 3,
  },
});
