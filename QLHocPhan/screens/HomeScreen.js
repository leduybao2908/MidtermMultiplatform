import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, Pressable, TextInput, StyleSheet, Platform, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { colors, shadow, shadowHover } from '../theme';

export default function HomeScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [asc, setAsc] = useState(true);
  const { width } = useWindowDimensions();

  const cols = width >= 1000 ? 3 : width >= 640 ? 2 : 1;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'GiangVien'), (snap) => {
      setList(snap.docs.map((d) => ({ ...d.data() })));
    });
    return unsub;
  }, []);

  const confirmDelete = (item) => {
    const msg = `Bạn có chắc muốn xóa giảng viên "${item.Fullname}"?`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) remove(item.IDGV);
    } else {
      Alert.alert('Xác nhận xóa', msg, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => remove(item.IDGV) },
      ]);
    }
  };

  const remove = async (id) => deleteDoc(doc(db, 'GiangVien', id));

  const data = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter((x) => x.Fullname?.toLowerCase().includes(q) || x.IDGV?.toLowerCase().includes(q))
      .sort((a, b) => (asc ? a.Fullname.localeCompare(b.Fullname) : b.Fullname.localeCompare(a.Fullname)));
  }, [list, search, asc]);

  const totalClass = list.reduce((sum, x) => sum + (Number(x.SumClass) || 0), 0);

  const Header = (
    <View>
      {/* Thống kê */}
      <View style={s.stats}>
        <View style={[s.statCard, shadow]}>
          <View style={[s.statIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="people" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={s.statNum}>{list.length}</Text>
            <Text style={s.statLabel}>Giảng viên</Text>
          </View>
        </View>
        <View style={[s.statCard, shadow]}>
          <View style={[s.statIcon, { backgroundColor: colors.successSoft }]}>
            <Ionicons name="book" size={22} color={colors.success} />
          </View>
          <View>
            <Text style={s.statNum}>{totalClass}</Text>
            <Text style={s.statLabel}>Tổng số lớp</Text>
          </View>
        </View>
      </View>

      {/* Tìm kiếm + sắp xếp + thêm */}
      <View style={s.toolbar}>
        <View style={[s.searchWrap, shadow]}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Tìm theo tên hoặc mã giảng viên..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          )}
        </View>
        <Pressable style={[s.sortBtn, shadow]} onPress={() => setAsc(!asc)}>
          <Ionicons name={asc ? 'arrow-down' : 'arrow-up'} size={16} color={colors.primary} />
          <Text style={s.sortText}>{asc ? 'A → Z' : 'Z → A'}</Text>
        </Pressable>
        <Pressable
          style={({ hovered }) => [s.addBtn, hovered && { backgroundColor: colors.primaryDark }]}
          onPress={() => navigation.navigate('Form')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.addText}>Thêm mới</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={{ flex: 1 / cols, padding: 8 }}>
      <Pressable style={({ hovered }) => [s.card, shadow, hovered && shadowHover, hovered && { transform: [{ translateY: -3 }] }]}>
        {item.Image ? (
          <Image source={{ uri: item.Image }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, s.avatarEmpty]}>
            <Text style={s.avatarLetter}>{item.Fullname?.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <Text style={s.name} numberOfLines={1}>{item.Fullname}</Text>

        <View style={s.badges}>
          <View style={[s.badge, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="id-card-outline" size={13} color={colors.primary} />
            <Text style={[s.badgeText, { color: colors.primary }]}>{item.IDGV}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.successSoft }]}>
            <Ionicons name="book-outline" size={13} color={colors.success} />
            <Text style={[s.badgeText, { color: colors.success }]}>{item.SumClass} lớp</Text>
          </View>
        </View>

        <View style={s.actions}>
          <Pressable
            style={({ hovered }) => [s.actBtn, { backgroundColor: colors.warningSoft }, hovered && { opacity: 0.75 }]}
            onPress={() => navigation.navigate('Form', { item })}
          >
            <Ionicons name="create-outline" size={16} color={colors.warning} />
            <Text style={[s.actText, { color: colors.warning }]}>Sửa</Text>
          </Pressable>
          <Pressable
            style={({ hovered }) => [s.actBtn, { backgroundColor: colors.dangerSoft }, hovered && { opacity: 0.75 }]}
            onPress={() => confirmDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={[s.actText, { color: colors.danger }]}>Xóa</Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={s.screen}>
      {/* Thanh trên cùng */}
      <View style={s.topbar}>
        <View style={s.topInner}>
          <View style={s.brand}>
            <Ionicons name="school" size={26} color="#fff" />
            <Text style={s.brandText}>Quản lý giảng viên</Text>
          </View>
          <Pressable style={({ hovered }) => [s.logout, hovered && { backgroundColor: 'rgba(255,255,255,0.25)' }]} onPress={() => signOut(auth)}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={s.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        key={cols}
        numColumns={cols}
        data={data}
        keyExtractor={(i) => i.IDGV}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={56} color="#d1d5db" />
            <Text style={s.emptyText}>{search ? 'Không tìm thấy kết quả' : 'Chưa có giảng viên nào'}</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 20 },
  topInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, width: '100%', alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  logoutText: { color: '#fff', fontWeight: '600' },

  listContent: { padding: 12, maxWidth: 1100, width: '100%', alignSelf: 'center' },

  stats: { flexDirection: 'row', gap: 16, padding: 8, marginBottom: 4 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  statIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLabel: { color: colors.muted, fontSize: 13 },

  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 8, marginBottom: 4 },
  searchWrap: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text, outlineStyle: 'none' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  sortText: { color: colors.primary, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  addText: { color: '#fff', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 18, padding: 20, alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12, borderWidth: 3, borderColor: colors.primarySoft },
  avatarEmpty: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontSize: 34, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, width: '100%' },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: 10 },
  actText: { fontWeight: '700', fontSize: 13 },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: colors.muted, fontSize: 16 },
}); 