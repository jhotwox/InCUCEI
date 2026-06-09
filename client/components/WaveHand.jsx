import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

const WaveEmoji = ({ emoji = '👋', duration = 2500, emojiStyle = {} }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(14, { duration: duration * 0.1 }),
        withTiming(-8, { duration: duration * 0.1 }),
        withTiming(14, { duration: duration * 0.1 }),
        withTiming(-4, { duration: duration * 0.1 }),
        withTiming(10, { duration: duration * 0.1 }),
        withTiming(2, { duration: duration * 0.4 }),
      ),
      -1, // infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.Text style={[animatedStyle, { display: 'inline-block' }, emojiStyle]}>
      {emoji}
    </Animated.Text>
  );
};

export default WaveEmoji;