import React, { useState, useEffect } from 'react';
import styles from './EditUserModal.module.css';
import api, { API_BASE_URL } from '../../../services/api';

type User = {
    id: number;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    tipo: string;
    endereco?: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
};

type EditUserModalProps = {
    user: User;
    onClose: () => void;
    onUpdate: () => void;
    currentUserId: number | null;
};

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdate, currentUserId }) => {
    const [formData, setFormData] = useState({
        nome: user.nome || '',
        sobrenome: user.sobrenome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        tipo: user.tipo || 'user',
        endereco: {
            logradouro: user.endereco?.logradouro || '',
            numero: user.endereco?.numero || '',
            bairro: user.endereco?.bairro || '',
            cidade: user.endereco?.cidade || '',
            estado: user.endereco?.estado || '',
            cep: user.endereco?.cep || '',
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            endereco: {
                ...formData.endereco,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, "") });
    };

    const handleAddressCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            endereco: {
                ...formData.endereco,
                cep: e.target.value.replace(/\D/g, "")
            }
        });
    };

    const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            endereco: {
                ...formData.endereco,
                numero: e.target.value.replace(/\D/g, "")
            }
        });
    };

    const formatarCep = (valor: string) => {
        const numeros = valor.replace(/\D/g, "").slice(0, 8);
        if (numeros.length <= 5) return numeros;
        return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    };

    const formatarTelefone = (valor: string) => {
        const numeros = valor.replace(/\D/g, "").slice(0, 11);
        if (numeros.length === 0) return "";
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    };

    useEffect(() => {
        const consultarCep = async () => {
            const cepDigitado = formData.endereco.cep.replace(/\D/g, "");
            if (cepDigitado.length === 8) {
                try {
                    const res = await api.get(`/cep/${cepDigitado}`);
                    setFormData(prev => ({
                        ...prev,
                        endereco: {
                            ...prev.endereco,
                            estado: res.data.state,
                            cidade: res.data.city,
                            bairro: res.data.neighborhood,
                            logradouro: res.data.street
                        }
                    }));
                } catch (e) { }
            }
        };
        consultarCep();
    }, [formData.endereco.cep]);

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/admin/id/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro || 'Erro ao atualizar usuário');

            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja deletar o usuário ${user.email}?`)) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/admin/id/${user.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro || 'Erro ao deletar usuário');

            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Editar Usuário (ID: {user.id})</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                {error && <div className={styles.errorMsg}>{error}</div>}

                <div className={styles.modalBody}>
                    <div className={styles.inputGrid}>
                        <div className={styles.inputWrapper}>
                            <label>Nome</label>
                            <input type="text" placeholder="Nome" name="nome" value={formData.nome || ''} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Sobrenome</label>
                            <input type="text" placeholder="Sobrenome" name="sobrenome" value={formData.sobrenome || ''} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Email</label>
                            <input type="email" placeholder="Email" name="email" value={formData.email || ''} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Telefone</label>
                            <input type="text" inputMode="numeric" placeholder="Telefone" name="telefone" value={formatarTelefone(formData.telefone || '')} onChange={handleChangePhone} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>CEP</label>
                            <input type="text" inputMode="numeric" placeholder="CEP" name="cep" value={formatarCep(formData.endereco.cep || '')} onChange={handleAddressCepChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Estado</label>
                            <input type="text" placeholder="Estado" name="estado" value={formData.endereco.estado || ''} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Cidade</label>
                            <input type="text" placeholder="Cidade" name="cidade" value={formData.endereco.cidade || ''} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Bairro</label>
                            <input type="text" placeholder="Bairro" name="bairro" value={formData.endereco.bairro || ''} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Logradouro</label>
                            <input type="text" placeholder="Logradouro" name="logradouro" value={formData.endereco.logradouro || ''} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputWrapper}>
                            <label>Número</label>
                            <input type="text" placeholder="Número" name="numero" value={formData.endereco.numero || ''} onChange={handleNumeroChange} required />
                        </div>
                        {user.id !== currentUserId && (
                            <div className={styles.inputWrapper}>
                                <label>Tipo de Usuário</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo || 'user'}
                                    onChange={handleChange}
                                >
                                    <option value="user">Usuário Padrão</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
                        Deletar Usuário
                    </button>
                    <div className={styles.footerActions}>
                        <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
