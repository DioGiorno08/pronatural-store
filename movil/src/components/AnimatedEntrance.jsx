import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

const AnimatedEntrance = ({ children, style, delay = 0, distance = 10, duration = 240 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(distance)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      offset.setValue(0);
      return undefined;
    }

    if (typeof AccessibilityInfo.isReduceMotionEnabled !== "function") {
      opacity.setValue(1);
      offset.setValue(0);
      return undefined;
    }

    opacity.setValue(0);
    offset.setValue(distance);
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: Math.min(delay, 240),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration,
        delay: Math.min(delay, 240),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, offset, opacity, reduceMotion]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY: offset }] }]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedEntrance;
