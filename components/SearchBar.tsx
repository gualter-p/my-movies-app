import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SearchBarProps } from "../types/SearchBar";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

export default function SearchBar({ query, onChangeQuery }: SearchBarProps) {
  const { isListening, handleMicrophonePress } =
    useVoiceRecognition(onChangeQuery);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your search..."
        value={query}
        onChangeText={onChangeQuery}
      />
      {Platform.OS !== "web" ? (
        <TouchableOpacity onPress={handleMicrophonePress} style={styles.icon}>
          <Ionicons
            name={isListening ? "mic-off" : "mic"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    width: "90%",
  },
  icon: {
    marginLeft: 10,
  },
});
