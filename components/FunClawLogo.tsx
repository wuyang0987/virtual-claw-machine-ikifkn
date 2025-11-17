
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface FunClawLogoProps {
  size?: number;
}

export default function FunClawLogo({ size = 120 }: FunClawLogoProps) {
  const logoSize = size;
  const fontSize = size * 0.35;
  const clawSize = size * 0.4;

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      {/* Circular background */}
      <View style={[styles.circle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
        {/* Claw shape using text */}
        <View style={styles.clawContainer}>
          <Text style={[styles.clawText, { fontSize: clawSize }]}>🎮</Text>
        </View>
        
        {/* Fun Claw text */}
        <View style={styles.textContainer}>
          <Text style={[styles.funText, { fontSize: fontSize }]}>FUN</Text>
          <Text style={[styles.clawTextLabel, { fontSize: fontSize * 0.8 }]}>CLAW</Text>
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
    position: 'absolute',
    top: '15%',
  },
  clawText: {
    textAlign: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: '15%',
    alignItems: 'center',
  },
  funText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
  },
  clawTextLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -4,
  },
});
