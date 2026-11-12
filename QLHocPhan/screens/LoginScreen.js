import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { colors, shadow } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) return setError('Vui lòng nhập email và mật khẩu');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError('Sai email hoặc mật khẩu');
    }
    setLoading(false);
  };

  return (
    <View style={s.screen}>
      <View style={s.circle1} />
      <View style={s.circle2} />

      <View style={[s.card, shadow]}>
        <View style={s.logo}>
          <Ionicons name="school" size={36} color="#fff" />
        </View>
        <Text style={s.title}>Quản lý giảng viên</Text>
        <Text style={s.subtitle}>Đăng nhập tài khoản Admin để tiếp tục</Text>

        <View style={s.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={colors.muted} />
          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={s.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
          <TextInput
            style={s.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            onSubmitEditing={handleLogin}
          />
          <Pressable onPress={() => setShowPw(!showPw)}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        </View>

        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ hovered, pressed }) => [s.btn, (hovered || pressed) && { backgroundColor: colors.primaryDark }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Đăng nhập</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 380, height: 380, borderRadius: 190, backgroundColor: 'rgba(255,255,255,0.08)', top: -120, left: -100 },
  circle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -100, right: -80 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 20, padding: 32 },
  logo: { width: 68, height: 68, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: colors.text },
  subtitle: { fontSize: 14, textAlign: 'center', color: colors.muted, marginTop: 6, marginBottom: 24 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text, outlineStyle: 'none' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10, marginBottom: 14 },
  errorText: { color: colors.danger, fontSize: 13 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});