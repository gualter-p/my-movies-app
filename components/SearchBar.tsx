import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { SearchBarProps } from "../types/SearchBar";

export default function SearchBar({ query, onChangeQuery }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your search..."
        value={query}
        onChangeText={onChangeQuery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});
