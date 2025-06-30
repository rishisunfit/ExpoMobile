import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome6";

const ImagePickerModal = ({
  isVisible,
  onClose,
  onCameraPress,
  onImagePress,
  onFilePress,
}: {
  isVisible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onImagePress: () => void;
  onFilePress: () => void;
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      statusBarTranslucent
    >
      <View
        style={{
          flexDirection: "row",
          gap: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 20,
          paddingVertical: 20,
        }}
      >
        <TouchableOpacity onPress={onCameraPress}>
          <Icon name="camera" size={80} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onImagePress}>
          <Icon name="image" size={80} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilePress}>
          <Icon name="file" size={80} color="#10b981" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImagePickerModal;

const styles = StyleSheet.create({});
