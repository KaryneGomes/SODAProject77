import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Perfil from './src/Perfil';

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'web' ? 'http://localhost:3000' : '')
).replace(/\/+$/, '');
const profiles = ['aluno', 'professor', 'servidor', 'coordenador'];

const profileLabel = (profile) => profile[0].toUpperCase() + profile.slice(1);
const getManifestacaoRespostas = (manifestacao) => {
  const respostas = manifestacao.Resposta || manifestacao.Respostas || manifestacao.respostas || [];
  return Array.isArray(respostas) ? respostas : (respostas ? [respostas] : []);
};

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
  const [imagem, setImagem] = useState(null);
  const [respostaDrafts, setRespostaDrafts] = useState({});
  const [respostaStatus, setRespostaStatus] = useState({});
  const [respostaEnviando, setRespostaEnviando] = useState(null);
  const [fotosAutorComErro, setFotosAutorComErro] = useState({});
  const [profileToast, setProfileToast] = useState('');
  const profileToastTimer = useRef(null);

  function dismissProfileToast() {
    if (profileToastTimer.current) clearTimeout(profileToastTimer.current);
    profileToastTimer.current = null;
    setProfileToast('');
  }

  function showProfileToast(message) {
    if (profileToastTimer.current) clearTimeout(profileToastTimer.current);
    setProfileToast(message);
    profileToastTimer.current = setTimeout(() => {
      profileToastTimer.current = null;
      setProfileToast('');
    }, 5000);
  }

  useEffect(() => () => {
    if (profileToastTimer.current) clearTimeout(profileToastTimer.current);
  }, []);

  useEffect(() => {
    if (screen === 'dashboard' && token) {
      loadManifestacoes();
    }
  }, [screen, token]);

  async function request(path, options = {}) {
    if (!API_BASE_URL) {
      throw new Error('API não configurada. Defina EXPO_PUBLIC_API_BASE_URL em mobile/.env com a URL pública do backend e reinicie o Expo.');
    }

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
      setFotosAutorComErro({});
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
        body: JSON.stringify({ titulo: titulo.trim(), descricao: descricao.trim(), imagem }),
      });
      setTitulo('');
      setDescricao('');
      setImagem(null);
      setStatus('Manifestação criada com sucesso.');
      loadManifestacoes();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendResposta(manifestacao) {
    const id = manifestacao.idManifestacao;
    const texto = (respostaDrafts[id] || '').trim();
    if (!texto) {
      setRespostaStatus((current) => ({ ...current, [id]: 'Escreva uma resposta antes de enviar.' }));
      return;
    }

    setRespostaEnviando(id);
    setRespostaStatus((current) => ({ ...current, [id]: '' }));
    try {
      await request('/respostas', {
        method: 'POST',
        body: JSON.stringify({ texto, idManifestacao: id }),
      });
      setRespostaDrafts((current) => ({ ...current, [id]: '' }));
      setRespostaStatus((current) => ({ ...current, [id]: 'Resposta enviada.' }));
      await loadManifestacoes();
    } catch (error) {
      setRespostaStatus((current) => ({ ...current, [id]: error.message }));
    } finally {
      setRespostaEnviando(null);
    }
  }

  async function pickManifestacaoImage() {
    setStatus('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStatus('Permita o acesso às fotos para anexar uma imagem.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
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
        setStatus('A imagem ficou grande demais. Escolha uma foto menor.');
        return;
      }

      setImagem(`data:image/jpeg;base64,${selected.base64}`);
    } catch (error) {
      setStatus('Não foi possível abrir a galeria de imagens.');
    }
  }

  function logout() {
    setToken('');
    setUser(null);
    setManifestacoes([]);
    setScreen('home');
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
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>E-mail</Text><Text style={styles.infoValue}>{user?.email || '-'}</Text></View>
          <View style={styles.infoItem}><Text style={styles.infoLabel}>Perfil</Text><Text style={styles.infoValue}>{user?.tipoUsuario || '-'}</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nova manifestação</Text>
          <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título" placeholderTextColor="#9aaab5" />
          <TextInput style={[styles.input, styles.textarea]} value={descricao} onChangeText={setDescricao} placeholder="Descreva sua manifestação" placeholderTextColor="#9aaab5" multiline />
          <Pressable style={styles.imageButton} onPress={pickManifestacaoImage} disabled={loading}>
            <Text style={styles.outlineText}>{imagem ? 'Trocar imagem' : 'Anexar imagem (opcional)'}</Text>
          </Pressable>
          {imagem && (
            <View>
              <Image source={{ uri: imagem }} style={styles.imagePreview} resizeMode="cover" />
              <Pressable onPress={() => setImagem(null)}>
                <Text style={styles.removeImage}>Remover imagem</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={styles.button} onPress={createManifestacao} disabled={loading}><Text style={styles.buttonText}>Enviar manifestação</Text></Pressable>
        </View>
        <Text style={styles.sectionTitle}>Manifestações</Text>
        {manifestacoes.length === 0 ? <Text style={styles.empty}>Nenhuma manifestação encontrada.</Text> : manifestacoes.map((item) => {
          const autor = item.Usuario || item.usuario || {};
          const autorNome = autor.nome || 'Usuário';
          const iniciais = autorNome.trim().charAt(0).toUpperCase();
          const mostrarFoto = autor.temFoto && !fotosAutorComErro[autor.idUsuario];
          return (
          <View style={styles.manifestacao} key={item.idManifestacao || item.id}>
            <View style={styles.manifestacaoAutor}>
              {mostrarFoto ? (
                <Image
                  key={autor.idUsuario}
                  source={{
                    uri: `${API_BASE_URL}/usuarios/${autor.idUsuario}/foto`,
                  }}
                  style={styles.autorAvatar}
                  onError={() => setFotosAutorComErro((current) => ({ ...current, [autor.idUsuario]: true }))}
                />
              ) : (
                <View style={[styles.autorAvatar, styles.autorAvatarPlaceholder]}>
                  <Text style={styles.autorInicial}>{iniciais}</Text>
                </View>
              )}
              <View>
                <Text style={styles.autorNome}>{autorNome}</Text>
                <Text style={styles.autorLegenda}>Autor da manifestação</Text>
              </View>
            </View>
            <Text style={styles.manifestacaoTitle}>{item.titulo}</Text>
            <Text style={styles.manifestacaoText}>{item.descricao}</Text>
            {item.imagem && <Image source={{ uri: item.imagem }} style={styles.manifestationImage} resizeMode="cover" />}
            <Text style={styles.manifestacaoStatus}>{item.status || 'Pendente'}</Text>

            {getManifestacaoRespostas(item).map((resposta) => (
              <View style={styles.respostaCard} key={resposta.idResposta}>
                {(() => {
                  const respondente = resposta.Usuario || resposta.usuario || {};
                  const nomeRespondente = respondente.nome || 'Equipe SODA';
                  const inicialRespondente = nomeRespondente.trim().charAt(0).toUpperCase();
                  const mostrarFotoRespondente = respondente.temFoto && !fotosAutorComErro[respondente.idUsuario];
                  return (
                    <View style={styles.respostaHeader}>
                      {mostrarFotoRespondente ? (
                        <Image
                          key={respondente.idUsuario}
                          source={{ uri: `${API_BASE_URL}/usuarios/${respondente.idUsuario}/foto` }}
                          style={styles.respostaAvatar}
                          onError={() => setFotosAutorComErro((current) => ({ ...current, [respondente.idUsuario]: true }))}
                        />
                      ) : (
                        <View style={[styles.respostaAvatar, styles.respostaAvatarPlaceholder]}>
                          <Text style={styles.respostaInicial}>{inicialRespondente}</Text>
                        </View>
                      )}
                      <Text style={styles.respostaAutor}>
                        {nomeRespondente}
                        {respondente.tipoUsuario ? ` · ${profileLabel(respondente.tipoUsuario)}` : ''}
                      </Text>
                    </View>
                  );
                })()}
                <Text style={styles.respostaTexto}>{resposta.texto}</Text>
              </View>
            ))}

            {(['professor', 'servidor', 'coordenador', 'admin'].includes(user?.tipoUsuario)) && item.status !== 'concluida' && (
              <View style={styles.respostaForm}>
                <TextInput
                  style={[styles.input, styles.respostaInput]}
                  value={respostaDrafts[item.idManifestacao] || ''}
                  onChangeText={(value) => setRespostaDrafts((current) => ({ ...current, [item.idManifestacao]: value }))}
                  placeholder="Escreva uma resposta para o aluno"
                  placeholderTextColor="#9aaab5"
                  multiline
                />
                <Pressable style={styles.respostaButton} onPress={() => sendResposta(item)} disabled={respostaEnviando === item.idManifestacao}>
                  {respostaEnviando === item.idManifestacao
                    ? <ActivityIndicator color="#112b3a" />
                    : <Text style={styles.buttonText}>Responder</Text>}
                </Pressable>
                {!!respostaStatus[item.idManifestacao] && <Text style={styles.status}>{respostaStatus[item.idManifestacao]}</Text>}
              </View>
            )}
          </View>
          );
        })}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.appHeader}>
        <Pressable onPress={() => setScreen(user ? 'dashboard' : 'home')} style={styles.appBrand}>
          <Text style={styles.appLogo}>SODA</Text>
          <Text style={styles.appTagline}>Ouvidoria digital acadêmica</Text>
        </Pressable>
        <View style={styles.appHeaderActions}>
          {user && <Text style={styles.appHeaderUser} numberOfLines={1}>{user.nome || 'Usuário'}</Text>}
          {user && (
            <Pressable
              style={styles.appHeaderButton}
              onPress={screen === 'profile' ? () => setScreen('dashboard') : openProfile}
            >
              <Text style={styles.appHeaderButtonText}>{screen === 'profile' ? 'Início' : 'Perfil'}</Text>
            </Pressable>
          )}
          {user && (
            <Pressable style={styles.appHeaderButton} onPress={logout}>
              <Text style={styles.appHeaderButtonText}>Sair</Text>
            </Pressable>
          )}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {screen === 'home' && (
          <View style={styles.home}>
            <Text style={styles.homeText}>Um espaço seguro para ouvir, dialogar e transformar.</Text>
            <View style={styles.homeActions}>
              <Pressable style={[styles.button, styles.homeButton]} onPress={() => { setLoginMode(true); setScreen('auth'); }}><Text style={styles.buttonText}>Entrar no sistema</Text></Pressable>
              <Pressable style={[styles.outlineButton, styles.homeButton]} onPress={() => { setLoginMode(false); setScreen('auth'); }}><Text style={styles.outlineText}>Criar uma conta</Text></Pressable>
            </View>
          </View>
        )}
        {screen === 'auth' && <View style={styles.card}>{renderAuth()}</View>}
        {screen === 'dashboard' && <View style={styles.dashboard}>{renderDashboard()}</View>}
        {screen === 'profile' && (
          <Perfil
            user={user}
            request={request}
            onSaved={(updatedUser) => setUser((current) => ({ ...current, ...updatedUser }))}
            onPhotoSaved={(message) => showProfileToast(message)}
          />
        )}
      </ScrollView>
      {!!profileToast && (
        <View style={styles.toast} accessibilityRole="alert">
          <Text style={styles.toastText}>{profileToast}</Text>
          <Pressable onPress={dismissProfileToast} hitSlop={10} accessibilityLabel="Fechar aviso">
            <Text style={styles.toastClose}>×</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#112b3a' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingTop: 18 },
  appHeader: { minHeight: 108, paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d2532', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', zIndex: 2 },
  appBrand: { flexShrink: 1 },
  appLogo: { color: '#59d4b1', fontSize: 34, fontWeight: 'bold', letterSpacing: 4 },
  appTagline: { color: '#b9c9d7', fontSize: 14, marginTop: 2 },
  appHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 9, marginLeft: 10 },
  appHeaderUser: { color: '#dceaf3', fontSize: 15, maxWidth: 116 },
  appHeaderButton: { paddingVertical: 11, paddingHorizontal: 10 },
  appHeaderButtonText: { color: '#59d4b1', fontWeight: 'bold', fontSize: 16 },
  toast: { position: 'absolute', top: 116, left: 18, right: 18, zIndex: 5, elevation: 5, backgroundColor: '#59d4b1', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  toastText: { color: '#112b3a', fontWeight: 'bold', flex: 1, marginRight: 12 },
  toastClose: { color: '#112b3a', fontSize: 24, lineHeight: 25, fontWeight: 'bold' },
  home: { justifyContent: 'flex-start', alignItems: 'center', flex: 1, paddingTop: 8 },
  homeText: { color: '#dceaf3', fontSize: 18, lineHeight: 27, marginBottom: 0, textAlign: 'center', width: '100%' },
  homeActions: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 20 },
  homeButton: { width: '88%', maxWidth: 380, alignSelf: 'center', marginTop: 0 },
  card: { backgroundColor: '#1b4053', padding: 22, borderRadius: 20 },
  dashboard: { backgroundColor: '#1b4053', padding: 20, borderRadius: 20 },
  title: { color: 'white', fontSize: 27, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: '#b9c9d7', fontSize: 15, marginTop: 8, marginBottom: 14 },
  label: { color: 'white', marginTop: 12, marginBottom: 7 },
  input: { backgroundColor: '#4a555f', borderRadius: 10, padding: 14, color: 'white', minHeight: 50, fontSize: 16 },
  textarea: { minHeight: 100, textAlignVertical: 'top', marginTop: 12 },
  imageButton: { borderColor: '#59d4b1', borderWidth: 1, padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  imagePreview: { width: '100%', height: 190, borderRadius: 10, marginTop: 12, backgroundColor: '#315267' },
  removeImage: { color: '#ffcf9d', textAlign: 'center', marginTop: 8 },
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
  manifestationImage: { width: '100%', height: 190, borderRadius: 8, marginTop: 10, backgroundColor: '#1b4053' },
  manifestacaoAutor: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  autorAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#1b4053' },
  autorAvatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#59d4b1' },
  autorInicial: { color: '#59d4b1', fontWeight: 'bold', fontSize: 18 },
  autorNome: { color: '#eaf3f8', fontWeight: 'bold' },
  autorLegenda: { color: '#b9c9d7', fontSize: 12, marginTop: 2 },
  manifestacaoStatus: { color: '#ffcf9d', marginTop: 8, fontSize: 13 },
  respostaCard: { backgroundColor: '#1b4053', borderRadius: 9, padding: 12, marginTop: 12 },
  respostaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  respostaAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8, backgroundColor: '#1b4053' },
  respostaAvatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#59d4b1' },
  respostaInicial: { color: '#59d4b1', fontWeight: 'bold', fontSize: 13 },
  respostaAutor: { color: '#59d4b1', fontWeight: 'bold', flexShrink: 1 },
  respostaTexto: { color: '#eaf3f8', lineHeight: 20 },
  respostaForm: { borderTopColor: 'rgba(255,255,255,0.12)', borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  respostaInput: { minHeight: 76, textAlignVertical: 'top' },
  respostaButton: { backgroundColor: '#59d4b1', padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 10 },
});
