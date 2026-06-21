import React, { useRef } from "react";
import { View, Pressable, StyleSheet, GestureResponderEvent } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
  filledColor?: string;
  emptyColor?: string;
}

export function StarRating({
  rating,
  onChange,
  size = 40,
  disabled = false,
  filledColor = "#FFC107",
  emptyColor = "#9BA1A6",
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const widthsRef = useRef<number[]>([]);

  const handlePress = (index: number, event: GestureResponderEvent) => {
    if (disabled || !onChange) return;
    const { locationX } = event.nativeEvent;
    
    // Get actual layout width of this specific star Pressable, falling back to size
    const actualWidth = widthsRef.current[index] || size;
    
    // Calculate if touch is on the left half or right half of the star
    const isLeftHalf = locationX < actualWidth / 2;
    const newRating = index + (isLeftHalf ? 0.5 : 1.0);
    onChange(newRating);
  };

  return (
    <View style={styles.container}>
      {stars.map((_, idx) => {
        // rating is between 0 and 5
        // idx is 0 to 4.
        // star value range is idx to idx + 1
        let iconName: "star" | "star-half" | "star-border" = "star-border";
        if (rating >= idx + 1) {
          iconName = "star";
        } else if (rating >= idx + 0.5) {
          iconName = "star-half";
        }

        return (
          <Pressable
            key={idx}
            disabled={disabled}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              if (width > 0) {
                widthsRef.current[idx] = width;
              }
            }}
            onPress={(event) => handlePress(idx, event)}
            style={({ pressed }) => [
              styles.starPressable,
              { width: size, height: size, opacity: pressed && !disabled ? 0.7 : 1 },
            ]}
          >
            {/* pointerEvents="none" ensures that the touch coordinates are always relative to the Pressable */}
            <View pointerEvents="none">
              <MaterialIcons
                name={iconName}
                size={size}
                color={iconName === "star-border" ? emptyColor : filledColor}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starPressable: {
    justifyContent: "center",
    alignItems: "center",
  },
});

