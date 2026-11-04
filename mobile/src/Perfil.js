import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const profileLabel = (profile) => profile[0].toUpperCase() + profile.slice(1);

const fieldsByProfile = {
  aluno: [
    ['matricula', 'Matrícula acadêmica'],
    ['curso', 'Curso'],
    ['periodo', 'Período / semestre'],
  ],
  professor: [
    ['matricula', 'Matrícula'],
    ['disciplina', 'Disciplina'],
  ],
  servidor: [
    ['siape', 'SIAPE'],
    ['cargo', 'Cargo / função'],
  ],
  coordenador: [
    ['matricula', 'Matrícula'],
    ['curso', 'Curso coordenado'],
  ],
};

export default function Perfil({ user, request, onBack, onSaved }) {
  const [draft, setDraft] = useState(user || {});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const profileFields = fieldsByProfile[user?.tipoUsuario] || fieldsByProfile.aluno;

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile() {
    setLoading(true);
    setStatus('');
    try {
      await request(`/usuarios/${user.idUsuario}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: draft.nome,
          email: draft.email,
          fotoPerfil: draft.fotoPerfil || null,
          matricula: draft.matricula,
          curso: draft.curso,
          periodo: draft.periodo,
          disciplina: draft.disciplina,
          siape: draft.siape,
          cargo: draft.cargo,
        }),
      });
      onSaved(draft);
      setStatus('Perfil atualizado com sucesso.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function pickProfilePhoto() {
    setStatus('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStatus('Permita o acesso às fotos para escolher uma foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });
      if (result.canceled) return;

      const selected = result.assets[0];
      if (!selected.base64) {
        setStatus('Não foi possível ler essa imagem. Escolha outra foto.');
        return;
      }
      if (selected.base64.length > 7 * 1024 * 1024) {
        setStatus('A foto ficou grande demais. Escolha uma imagem menor.');
        return;
      }

      updateField('fotoPerfil', `data:image/jpeg;base64,${selected.base64}`);
    } catch (error) {
      setStatus('Não foi possível abrir a galeria de imagens.');
    }
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={onBack}>
        <Text style={styles.backText}>← Voltar ao dashboard</Text>
      </Pressable>
      <Text style={styles.title}>Meu perfil</Text>
      <Text style={styles.subtitle}>Dados de {profileLabel(user?.tipoUsuario || 'aluno')}</Text>

      <View style={styles.photoBlock}>
        {draft.fotoPerfil ? (
          <Image source={{ uri: draft.fotoPerfil }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoInitial}>{(draft.nome || '?').trim().charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Pressable style={styles.photoButton} onPress={pickProfilePhoto} disabled={loading}>
          <Text style={styles.photoButtonText}>{draft.fotoPerfil ? 'Trocar foto' : 'Adicionar foto de perfil'}</Text>
        </Pressable>
        {draft.fotoPerfil && (
          <Pressable onPress={() => updateField('fotoPerfil', null)} disabled={loading}>
            <Text style={styles.removePhoto}>Remover foto</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput style={styles.input} value={draft.nome || ''} onChangeText={(value) => updateField('nome', value)} />
      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} value={draft.email || ''} onChangeText={(value) => updateField('email', value)} keyboardType="email-address" autoCapitalize="none" />

      {profileFields.map(([field, label]) => (
        <View key={field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput style={styles.input} value={draft[field] || ''} onChangeText={(value) => updateField(field, value)} />
        </View>
      ))}

      {!!status && <Text style={styles.status}>{status}</Text>}
      <Pressable style={styles.button} onPress={saveProfile} disabled={loading}>
        {loading ? <ActivityIndicator color="#112b3a" /> : <Text style={styles.buttonText}>Salvar alterações</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1b4053', padding: 22, borderRadius: 20 },
  backText: { color: '#b9c9d7', fontSize: 15 },
  title: { color: 'white', fontSize: 27, fontWeight: 'bold', marginTop: 18 },
  subtitle: { color: '#b9c9d7', fontSize: 15, marginTop: 8, marginBottom: 14 },
  photoBlock: { alignItems: 'center', marginVertical: 16 },
  photo: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#315267' },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#59d4b1' },
  photoInitial: { color: '#59d4b1', fontSize: 52, fontWeight: 'bold' },
  photoButton: { borderColor: '#59d4b1', borderWidth: 1, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 10, marginTop: 12 },
  photoButtonText: { color: '#59d4b1', fontWeight: 'bold' },
  removePhoto: { color: '#ffcf9d', marginTop: 10 },
  label: { color: 'white', marginTop: 12, marginBottom: 7 },
  input: { backgroundColor: '#4a555f', borderRadius: 10, padding: 14, color: 'white', minHeight: 50, fontSize: 16 },
  status: { color: '#ffcf9d', marginTop: 12, lineHeight: 20 },
  button: { backgroundColor: '#59d4b1', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { fontWeight: 'bold', color: '#112b3a', fontSize: 15 },
});
