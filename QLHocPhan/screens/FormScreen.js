import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ActivityIndicator } from 'react-native';
import { colors, shadow } from '../theme';

const notify = (msg) => (Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thông báo', msg));

export default function FormScreen({ route, navigation }) {
  const editItem = route.params?.item;
  const isEdit = !!editItem;

  const [idgv, setIdgv] = useState(editItem?.IDGV ?? '');
  const [fullname, setFullname] = useState(editItem?.Fullname ?? '');
  const [sumClass, setSumClass] = useState(editItem ? String(editItem.SumClass) : '');
  const [image, setImage] = useState(editItem?.Image ?? '');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return notify('Cần cấp quyền truy cập thư viện ảnh');
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (res.canceled) return;

    // Thu nhỏ ảnh + chuyển sang base64 (để lưu < 1MB/document)
    const small = await ImageManipulator.manipulateAsync(
      res.assets[0].uri,
      [{ resize: { width: 300 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    setImage(`data:image/jpeg;base64,${small.base64}`);
  };

  const handleSave = async () => {
    const id = idgv.trim();
    const name = fullname.trim();
    const num = Number(sumClass);

    if (!id || !name || sumClass === '') return notify('Vui lòng nhập đầy đủ thông tin');
    if (!Number.isInteger(num) || num < 0) return notify('Tổng số lớp phải là số nguyên ≥ 0');

    setSaving(true);
    try {
      if (!isEdit) {
        const exist = await getDoc(doc(db, 'GiangVien', id));
        if (exist.exists()) {
          setSaving(false);
          return notify('Mã giảng viên đã tồn tại');
        }
      }
      // Chỉ đúng 4 trường theo đề
      await setDoc(doc(db, 'GiangVien', id), {
        IDGV: id,
        Fullname: name,
        Image: image,
        SumClass: num,
      });
      navigation.goBack();
    } catch (e) {
      notify('Lỗi: ' + e.message);
    }
    setSaving(false);
  };

return (
  <ScrollView contentContainerStyle={s.scroll}>
    <View style={[s.card, shadow]}>
      <Text style={s.heading}>{isEdit ? 'Cập nhật giảng viên' : 'Thêm giảng viên mới'}</Text>

      <Pressable onPress={pickImage} style={s.avatarWrap}>
        {image ? (
          <Image source={{ uri: image }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, s.placeholder]}>
            <Ionicons name="person" size={52} color="#c7d2fe" />
          </View>
        )}
        <View style={s.camera}>
          <Ionicons name="camera" size={16} color="#fff" />
        </View>
      </Pressable>
      <Text style={s.hint}>Nhấn vào ảnh để chọn ảnh đại diện</Text>

      <Text style={s.label}>Mã giảng viên (IDGV)</Text>
      <View style={[s.inputWrap, isEdit && { backgroundColor: '#f3f4f6' }]}>
        <Ionicons name="id-card-outline" size={20} color={colors.muted} />
        <TextInput style={s.input} value={idgv} onChangeText={setIdgv} editable={!isEdit}
          placeholder="VD: GV001" placeholderTextColor="#9ca3af" />
      </View>

      <Text style={s.label}>Họ và tên (Fullname)</Text>
      <View style={s.inputWrap}>
        <Ionicons name="person-outline" size={20} color={colors.muted} />
        <TextInput style={s.input} value={fullname} onChangeText={setFullname}
          placeholder="VD: Nguyễn Văn A" placeholderTextColor="#9ca3af" />
      </View>

      <Text style={s.label}>Tổng số lớp (SumClass)</Text>
      <View style={s.inputWrap}>
        <Ionicons name="book-outline" size={20} color={colors.muted} />
        <TextInput style={s.input} value={sumClass} onChangeText={setSumClass}
          keyboardType="numeric" placeholder="VD: 5" placeholderTextColor="#9ca3af" />
      </View>

      <View style={s.btnRow}>
        <Pressable style={({ hovered }) => [s.cancelBtn, hovered && { backgroundColor: '#e5e7eb' }]}
          onPress={() => navigation.goBack()}>
          <Text style={s.cancelText}>Hủy</Text>
        </Pressable>
        <Pressable
          style={({ hovered }) => [s.saveBtn, hovered && { backgroundColor: colors.primaryDark }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={s.saveText}>{isEdit ? 'Cập nhật' : 'Thêm mới'}</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  </ScrollView>
);
}

const s = StyleSheet.create({
  scroll: { padding: 16, alignItems: 'center' },
  card: { width: '100%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 20, padding: 28, marginTop: 10 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 20 },
  avatarWrap: { alignSelf: 'center' },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: colors.primarySoft },
  placeholder: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  camera: { position: 'absolute', right: 4, bottom: 4, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 8, marginBottom: 12 },
  label: { fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 6, fontSize: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text, outlineStyle: 'none' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  cancelBtn: { flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: colors.muted },
  saveBtn: { flex: 2, flexDirection: 'row', gap: 6, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});