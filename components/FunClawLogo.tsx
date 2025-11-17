
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface FunClawLogoProps {
  size?: number;
}

export default function FunClawLogo({ size = 120 }: FunClawLogoProps) {
  const logoSize = size;
  const clawSize = size * 0.5;

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      {/* Circular background */}
      <View style={[styles.circle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
        {/* Claw machine claw */}
        <View style={styles.clawContainer}>
          {/* Cable/chain */}
          <View style={[styles.cable, { height: logoSize * 0.15 }]} />
          
          {/* Claw mechanism */}
          <View style={styles.clawMechanism}>
            {/* Left arm */}
            <View style={[styles.clawArm, styles.clawArmLeft, { 
              width: logoSize * 0.15, 
              height: logoSize * 0.25,
              borderTopLeftRadius: logoSize * 0.05,
            }]} />
            
            {/* Right arm */}
            <View style={[styles.clawArm, styles.clawArmRight, { 
              width: logoSize * 0.15, 
              height: logoSize * 0.25,
              borderTopRightRadius: logoSize * 0.05,
            }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(41, 98, 255, 0.4)',
    elevation: 8,
    position: 'relative',
  },
  clawContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cable: {
    width: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  clawMechanism: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  clawArm: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clawArmLeft: {
    transform: [{ rotate: '-25deg' }],
    marginRight: -8,
  },
  clawArmRight: {
    transform: [{ rotate: '25deg' }],
    marginLeft: -8,
  },
});
