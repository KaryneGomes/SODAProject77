import React from 'react';
import { Pressable } from 'react-native';

const pressedStyle = { opacity: 0.78, transform: [{ scale: 0.985 }] };

export default function FeedbackPressable({ style, android_ripple, ...props }) {
  return (
    <Pressable
      {...props}
      android_ripple={android_ripple || { color: 'rgba(89, 212, 177, 0.2)' }}
      style={(state) => [typeof style === 'function' ? style(state) : style, state.pressed && pressedStyle]}
    />
  );
}
