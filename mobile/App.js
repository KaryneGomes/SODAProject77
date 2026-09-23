import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import Perfil from './src/Perfil';

const API_BASE_URL = 'https://arlington-murray-varying-hoped.trycloudflare.com';
const profiles = ['aluno', 'professor', 'servidor', 'coordenador'];

const profileLabel = (profile) => profile[0].toUpperCase() + profile.slice(1);

export default function App() {
  const [screen, setScreen] = useState('home');
  const [loginMode, setLoginMode] = useState(true);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipo, setTipo] = useState('aluno');
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [manifestacoes, setManifestacoes] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (screen === 'dashboard' && token) {
      loadManifestacoes();
    }
  }, [screen, token]);

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.');
    return data;
  }

  async function submitAuth() {
    if (!email.trim() || !senha.trim() || (!loginMode && (!nome.trim() || !confirmarSenha.trim()))) {
      setStatus('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!loginMode && senha.length < 8) {
      setStatus('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!loginMode && senha !== confirmarSenha) {
      setStatus('As senhas não coincidem.');
      return;
    }

    const requiredProfileFields = {
      aluno: [matricula, curso, periodo],
      professor: [matricula, disciplina],
      servidor: [matricula, cargo],
      coordenador: [matricula, curso],
    };

    if (!loginMode && requiredProfileFields[tipo].some((value) => !value.trim())) {
      setStatus('Preencha todos os requisitos do perfil escolhido.');
      return;
    }

    setLoading(true);
    setStatus('');
    try {
      const data = await request(`/usuarios/${loginMode ? 'login' : 'cadastro'}`, {
        method: 'POST',
        body: JSON.stringify(loginMode
          ? { email: email.trim(), senha }
          : {
              nome: nome.trim(),
              email: email.trim(),
              senha,
              tipoUsuario: tipo,
              matricula: matricula.trim() || undefined,
              curso: curso.trim() || undefined,
              periodo: periodo.trim() || undefined,
              disciplina: disciplina.trim() || undefined,
              cargo: cargo.trim() || undefined,
              siape: tipo === 'servidor' ? matricula.trim() || undefined : undefined,
            }),
      });

      if (loginMode) {
        setToken(data.token);
        setUser(data.usuario);
        setScreen('dashboard');
      } else {
        setLoginMode(true);
        setSenha('');
        setConfirmarSenha('');
        setStatus('Cadastro realizado. Agora entre na sua conta.');
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadManifestacoes() {
    try {
      const data = await request('/manifestacoes');
      setManifestacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function openProfile() {
    setLoading(true);
    setStatus('');
    try {
      const data = await request(`/usuarios/${user.idUsuario}`);
      setUser(data);
      setScreen('profile');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createManifestacao() {
    if (!titulo.trim() || !descricao.trim()) {
      setStatus('Informe o título e a descrição da manifestação.');
      return;
    }

    setLoading(true);
    setStatus('');
    try {
      await request('/manifestacoes', {
        method: 'POST',
        body: JSON.stringify({ titulo: titulo.trim(), descricao: descricao.trim() }),
      });
      setTitulo('');
      setDescricao('');
      setStatus('Manifestação criada com sucesso.');
      loadManifestacoes();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken('');
    setUser(null);
    setManifestacoes([]);
    setScreen('home');
  }

  function renderHeader() {
    return (
      <View style={styles.brandBlock}>
        <Text style={styles.logo}>SODA</Text>
        <Text style={styles.sub}>Sistema de Ouvidoria Digital Acadêmica</Text>
      </View>
    );
  }

  function renderAuth() {
    const fieldsByProfile = {
      aluno: [
        ['matricula', 'Matrícula acadêmica', 'Digite sua matrícula', matricula, setMatricula],
        ['curso', 'Curso', 'Digite seu curso', curso, setCurso],
        ['periodo', 'Período / semestre', 'Ex.: 3º período', periodo, setPeriodo],
      ],
      professor: [
        ['matricula', 'Matrícula', 'Digite sua matrícula', matricula, setMatricula],
        ['disciplina', 'Disciplina', 'Digite sua disciplina', disciplina, setDisciplina],
      ],
      servidor: [
        ['matricula', 'SIAPE / matrícula funcional', 'Digite seu SIAPE ou matrícula', matricula, setMatricula],
        ['cargo', 'Cargo / função', 'Ex.: Técnico administrativo', cargo, setCargo],
      ],
      coordenador: [
        ['matricula', 'Matrícula', 'Digite sua matrícula', matricula, setMatricula],
        ['curso', 'Curso coordenado', 'Digite o curso', curso, setCurso],
      ],
    };

    return (
      <>
        <Pressable style={styles.back} onPress={() => setScreen('home')}>
          <Text style={styles.backText}>← Voltar</Text>
        </Pressable>
        <Text style={styles.title}>{loginMode ? 'Bem-vindo de volta' : 'Crie sua conta'}</Text>
        <Text style={styles.subtitle}>{loginMode ? 'Acesse sua conta no SODA.' : 'Preencha os dados para acessar o SODA.'}</Text>

        {!loginMode && (
          <>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" placeholderTextColor="#9aaab5" />
            <Text style={styles.label}>Perfil</Text>
            <Pressable style={styles.select} onPress={() => setPerfilAberto(!perfilAberto)}>
              <Text style={styles.selectText}>{profileLabel(tipo)}</Text>
              <Text style={styles.selectArrow}>{perfilAberto ? '▲' : '▼'}</Text>
            </Pressable>
            {perfilAberto && (
              <View style={styles.options}>
                {profiles.map((profile) => (
                  <Pressable key={profile} style={styles.option} onPress={() => { setTipo(profile); setPerfilAberto(false); }}>
                    <Text style={styles.optionText}>{profileLabel(profile)}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {fieldsByProfile[tipo].map(([key, label, placeholder, value, onChangeText]) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChangeText}
                  placeholder={placeholder}
                  placeholderTextColor="#9aaab5"
                />
              </View>
            ))}
          </>
        )}

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="seu@email.edu.br" placeholderTextColor="#9aaab5" keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="Sua senha" placeholderTextColor="#9aaab5" secureTextEntry />
        {!loginMode && (
          <>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Digite a senha novamente" placeholderTextColor="#9aaab5" secureTextEntry />
          </>
        )}
        {!!status && <Text style={styles.status}>{status}</Text>}
        <Pressable style={styles.button} onPress={submitAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#112b3a" /> : <Text style={styles.buttonText}>{loginMode ? 'Entrar' : 'Cadastrar'}</Text>}
        </Pressable>
        <Pressable onPress={() => { setLoginMode(!loginMode); setStatus(''); }}>
          <Text style={styles.switch}>{loginMode ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}</Text>
        </Pressable>
      </>
    );
  }

  function renderDashboard() {
    return (
      <>
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.logo}>SODA</Text>
            <Text style={styles.welcome}>Bem-vindo, {user?.nome || 'usuário'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={openProfile}><Text style={styles.logout}>Meu perfil</Text></Pressable>
            <Pressable onPress={logout}><Text style={styles.logout}>Sair</Text></Pressable>
          </View>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>E-mail</Text><Text style={styles.infoValue}>{user?.email || '-'}</Text></View>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>Perfil</Text><Text style={styles.infoValue}>{user?.tipoUsuario || '-'}</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nova manifestação</Text>
          <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título" placeholderTextColor="#9aaab5" />
          <TextInput style={[styles.input, styles.textarea]} value={descricao} onChangeText={setDescricao} placeholder="Descreva sua manifestação" placeholderTextColor="#9aaab5" multiline />
          <Pressable style={styles.button} onPress={createManifestacao} disabled={loading}><Text style={styles.buttonText}>Enviar manifestação</Text></Pressable>
        </View>
        <Text style={styles.sectionTitle}>Manifestações</Text>
        {manifestacoes.length === 0 ? <Text style={styles.empty}>Nenhuma manifestação encontrada.</Text> : manifestacoes.map((item) => (
          <View style={styles.manifestacao} key={item.idManifestacao || item.id}>
            <Text style={styles.manifestacaoTitle}>{item.titulo}</Text>
            <Text style={styles.manifestacaoText}>{item.descricao}</Text>
            <Text style={styles.manifestacaoStatus}>{item.status || 'Pendente'}</Text>
          </View>
        ))}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {screen === 'home' && (
          <View style={styles.home}>
            {renderHeader()}
            <Text style={styles.homeText}>Um espaço seguro para ouvir, dialogar e transformar.</Text>
            <Pressable style={styles.button} onPress={() => { setLoginMode(true); setScreen('auth'); }}><Text style={styles.buttonText}>Entrar no sistema</Text></Pressable>
            <Pressable style={styles.outlineButton} onPress={() => { setLoginMode(false); setScreen('auth'); }}><Text style={styles.outlineText}>Criar uma conta</Text></Pressable>
          </View>
        )}
        {screen === 'auth' && <View style={styles.card}>{renderHeader()}{renderAuth()}</View>}
        {screen === 'dashboard' && <View style={styles.dashboard}>{renderDashboard()}</View>}
        {screen === 'profile' && (
          <Perfil
            user={user}
            request={request}
            onBack={() => setScreen('dashboard')}
            onSaved={(updatedUser) => setUser((current) => ({ ...current, ...updatedUser }))}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#112b3a' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  home: { justifyContent: 'center', flex: 1 },
  brandBlock: { marginBottom: 28 },
  logo: { color: '#59d4b1', fontSize: 42, fontWeight: 'bold', letterSpacing: 5 },
  sub: { color: '#dceaf3', marginTop: 8, lineHeight: 20 },
  homeText: { color: '#dceaf3', fontSize: 17, lineHeight: 25, marginBottom: 28 },
  card: { backgroundColor: '#1b4053', padding: 22, borderRadius: 20 },
  dashboard: { backgroundColor: '#1b4053', padding: 20, borderRadius: 20 },
  title: { color: 'white', fontSize: 27, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: '#b9c9d7', fontSize: 15, marginTop: 8, marginBottom: 14 },
  label: { color: 'white', marginTop: 12, marginBottom: 7 },
  input: { backgroundColor: '#4a555f', borderRadius: 10, padding: 14, color: 'white', minHeight: 50, fontSize: 16 },
  textarea: { minHeight: 100, textAlignVertical: 'top', marginTop: 12 },
  select: { minHeight: 52, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#4a555f', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: 'white', fontSize: 16 },
  selectArrow: { color: '#59d4b1', fontSize: 14 },
  options: { marginTop: 4, backgroundColor: '#3d4852', borderRadius: 10, overflow: 'hidden' },
  option: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  optionText: { color: 'white', fontSize: 15 },
  status: { color: '#ffcf9d', marginTop: 12, lineHeight: 20 },
  button: { backgroundColor: '#59d4b1', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { fontWeight: 'bold', color: '#112b3a', fontSize: 15 },
  outlineButton: { borderColor: '#59d4b1', borderWidth: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  outlineText: { color: '#59d4b1', fontWeight: 'bold' },
  switch: { color: '#59d4b1', textAlign: 'center', marginTop: 18 },
  back: { marginBottom: 4 },
  backText: { color: '#b9c9d7', fontSize: 15 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerActions: { alignItems: 'flex-end', gap: 4 },
  welcome: { color: '#dceaf3', fontSize: 16, marginTop: 6 },
  logout: { color: '#59d4b1', fontWeight: 'bold', padding: 8 },
  infoGrid: { gap: 10, marginBottom: 22 },
  infoItem: { backgroundColor: '#315267', borderRadius: 10, padding: 14 },
  infoLabel: { color: '#59d4b1', fontWeight: 'bold', marginBottom: 4 },
  infoValue: { color: '#eaf3f8' },
  section: { borderTopColor: 'rgba(255,255,255,0.12)', borderTopWidth: 1, paddingTop: 18, marginBottom: 22 },
  sectionTitle: { color: '#eaf3f8', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  empty: { color: '#b9c9d7', marginBottom: 10 },
  manifestacao: { backgroundColor: '#315267', borderRadius: 10, padding: 14, marginBottom: 10 },
  manifestacaoTitle: { color: '#59d4b1', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  manifestacaoText: { color: '#eaf3f8', lineHeight: 20 },
  manifestacaoStatus: { color: '#ffcf9d', marginTop: 8, fontSize: 13 },
});