import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ScrollView,
} from 'react-native';

import api from './api';

export default function CadastroServidor() {
    const [nome, setNome] = useState('');
    const [siape, setSiape] = useState('');
    const [email, setEmail] = useState('');
    const [cargo, setCargo] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const cadastrar = async () => {
        if (
            !nome ||
            !siape ||
            !email ||
            !cargo ||
            !senha ||
            !confirmarSenha
        ) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Atenção', 'As senhas não coincidem.');
            return;
        }

        try {
            const response = await api.post('/usuarios/cadastro', {
                nome,
                email,
                senha,
                tipoUsuario: 'servidor',
                siape,
                cargo,
            });

            Alert.alert(
                'Sucesso',
                response.data.mensagem || 'Cadastro realizado com sucesso!'
            );

            setNome('');
            setSiape('');
            setEmail('');
            setCargo('');
            setSenha('');
            setConfirmarSenha('');
        } catch (error) {
            Alert.alert(
                'Erro',
                error.response?.data?.erro ||
                'Não foi possível realizar o cadastro.'
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>

                    <TouchableOpacity style={styles.voltar}>
                        <Text style={styles.voltarTexto}>← Voltar</Text>
                    </TouchableOpacity>

                    <Text style={styles.titulo}>Criar conta</Text>

                    <Text style={styles.subtitulo}>
                        Cadastre sua conta de servidor no SODA
                    </Text>

                    <Text style={styles.label}>Perfil de Acesso</Text>

                    <View style={styles.input}>
                        <Text style={styles.inputTexto}>Servidor do IFPE</Text>
                    </View>

                    <Text style={styles.label}>Nome completo</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu nome completo"
                        placeholderTextColor="#78879A"
                        value={nome}
                        onChangeText={setNome}
                    />

                    <Text style={styles.label}>SIAPE / Matrícula funcional</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu SIAPE"
                        placeholderTextColor="#78879A"
                        value={siape}
                        onChangeText={setSiape}
                    />

                    <Text style={styles.label}>E-mail institucional</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="nome@ifpe.edu.br"
                        placeholderTextColor="#78879A"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Cargo / Função</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Ex.: Técnico Administrativo"
                        placeholderTextColor="#78879A"
                        value={cargo}
                        onChangeText={setCargo}
                    />

                    <Text style={styles.label}>Senha</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Crie uma senha"
                        placeholderTextColor="#78879A"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirmar senha</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite a senha novamente"
                        placeholderTextColor="#78879A"
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.botao}
                        onPress={cadastrar}
                    >
                        <Text style={styles.botaoTexto}>Cadastrar</Text>
                    </TouchableOpacity>

                    <Text style={styles.login}>
                        Já possui uma conta?{' '}
                        <Text style={styles.loginDestaque}>Entrar</Text>
                    </Text>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D3048',
    },

    scroll: {
        flexGrow: 1,
    },

    content: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        paddingHorizontal: 32,
        paddingTop: 35,
        paddingBottom: 40,
    },

    voltar: {
        marginBottom: 35,
    },

    voltarTexto: {
        color: '#8290A1',
        fontSize: 16,
        fontWeight: '600',
    },

    titulo: {
        color: '#F5F7FA',
        fontSize: 30,
        fontWeight: '700',
        marginBottom: 8,
    },

    subtitulo: {
        color: '#8997A8',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 30,
    },

    label: {
        color: '#9AA7B7',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },

    input: {
        height: 58,
        backgroundColor: '#34475E',
        borderWidth: 1,
        borderColor: '#52647A',
        borderRadius: 15,
        paddingHorizontal: 20,
        color: '#F5F7FA',
        fontSize: 16,
        marginBottom: 18,
        justifyContent: 'center',
    },

    inputTexto: {
        color: '#F1F4F7',
        fontSize: 16,
    },

    botao: {
        height: 58,
        backgroundColor: '#4FC495',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 22,
    },

    botaoTexto: {
        color: '#12283D',
        fontSize: 17,
        fontWeight: '700',
    },

    login: {
        color: '#8997A8',
        textAlign: 'center',
        fontSize: 15,
    },

    loginDestaque: {
        color: '#4FC495',
        fontWeight: '700',
    },
});