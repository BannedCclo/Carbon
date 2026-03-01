import React, { useState } from "react";
import styles from "./UsersList.module.css";
import EditUserModal from "./EditUserModal";

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

type UsersListProps = {
  users: User[];
  onUserUpdate: () => void;
  currentUserId: number | null;
};

const UsersList: React.FC<UsersListProps> = ({
  users,
  onUserUpdate,
  currentUserId,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAttribute, setSearchAttribute] = useState<
    "all" | "id" | "name" | "email"
  >("all");

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();

    if (searchAttribute === "id") {
      return user.id.toString().includes(term);
    }
    if (searchAttribute === "name") {
      return (
        user.nome.toLowerCase().includes(term) ||
        user.sobrenome.toLowerCase().includes(term)
      );
    }
    if (searchAttribute === "email") {
      return user.email.toLowerCase().includes(term);
    }

    return (
      user.id.toString().includes(term) ||
      user.nome.toLowerCase().includes(term) ||
      user.sobrenome.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith("\\id")) {
      setSearchAttribute("id");
      setSearchTerm("");
    } else if (value.endsWith("\\name") || value.endsWith("\\nome")) {
      setSearchAttribute("name");
      setSearchTerm("");
    } else if (value.endsWith("\\email")) {
      setSearchAttribute("email");
      setSearchTerm("");
    } else {
      setSearchTerm(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      searchTerm === "" &&
      searchAttribute !== "all"
    ) {
      setSearchAttribute("all");
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className={styles.usersListContainer}>
      <div className={styles.headerRow}>
        <h2>Gerenciar Usuários</h2>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-search ${styles.searchIcon}`}></i>
          {searchAttribute !== "all" && (
            <div className={styles.filterBubble}>
              <span>
                {searchAttribute === "id"
                  ? "ID"
                  : searchAttribute === "name"
                    ? "Nome"
                    : "Email"}
              </span>
              <button
                onClick={() => setSearchAttribute("all")}
                className={styles.clearBubbleBtn}
              >
                &times;
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder={
              searchAttribute === "all"
                ? "Buscar por ID, Nome ou Email..."
                : `Buscar por ${searchAttribute}...`
            }
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.usersGrid}>
        {filteredUsers.length === 0 ? (
          <p className={styles.noResults}>Nenhum usuário encontrado.</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={styles.userCard}
              onClick={() => handleEditClick(user)}
            >
              <div className={styles.cardHeader}>
                <span
                  className={`${styles.userTypeBadge} ${user.tipo === "admin" ? styles.adminBadge : ""}`}
                >
                  {user.tipo}
                </span>
                <span className={styles.userId}>ID: {user.id}</span>
              </div>
              <h3 className={styles.userName}>
                {user.nome} {user.sobrenome}
              </h3>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          ))
        )}
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUpdate={onUserUpdate}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default UsersList;
