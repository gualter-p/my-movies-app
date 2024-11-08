import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { NetworkStatusModalProps } from "../types/Network";

export default function NetworkStatusModal({
  isVisible,
  message,
  onClose,
}: NetworkStatusModalProps) {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modal}>
          <Text>{message}</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    gap: 8,
  },
});
