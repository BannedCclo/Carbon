import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import textLogoSmallBlack from "../../assets/img/textLogoSmallBlack.png";
import styles from "./signup.module.css";
import api from "../../services/api";
import Loading from "../../components/loading/loading";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [repetirSenha, setRepetirSenha] = useState("");
  const [bairro, setBairro] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cep, setCep] = useState("");
  const [cepValid, setCepValid] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [seePassword2, setSeePassword2] = useState(false);
  const [camposInvalidos, setCamposInvalidos] = useState<string[]>([]);

  useEffect(() => {
    const imagens = Array.from(document.images);
    const promessas = imagens.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve(true);
          else img.onload = img.onerror = () => resolve(true);
        })
    );

    Promise.all(promessas).then(() => {
      setTimeout(() => setLoading(false), 300); // atraso opcional
    });
  }, []);

  useEffect(() => {
    consultarCep(cep);
  }, [cep]);

  const consultarCep = async (cep: string) => {
    console.log(cep);
    setCepValid(false);
    if (cep.length == 8) {
      await api.get(`/cep/${cep}`).then((res) => {
        setEstado(res.data.state);
        setCidade(res.data.city);
        setBairro(res.data.neighborhood);
        setLogradouro(res.data.street);
        console.log(res.data);
        if (res.status === 200) {
          setCepValid(true);
        }
      });
    }
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
    if (numeros.length <= 6)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(
        6
      )}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(
      7,
      11
    )}`;
  };

  const validarCampos = () => {
    const camposVazios = [];

    if (!nome) camposVazios.push("nome");
    if (!sobrenome) camposVazios.push("sobrenome");
    if (!email) camposVazios.push("email");
    if (!telefone || telefone.length < 10) camposVazios.push("telefone");
    if (!senha) camposVazios.push("senha");
    if (!repetirSenha) camposVazios.push("repetirSenha");
    if (!estado) camposVazios.push("estado");
    if (!cidade) camposVazios.push("cidade");
    if (!bairro) camposVazios.push("bairro");
    if (!logradouro) camposVazios.push("logradouro");
    if (!numero) camposVazios.push("numero");
    if (!cep || cep.length < 8 || !cepValid) camposVazios.push("cep");

    setCamposInvalidos(camposVazios);

    return camposVazios.length === 0;
  };

  const handleSubmit = async () => {
    if (validarCampos()) {
      try {
        const emailExistente = await api.get(
          `/users/${encodeURIComponent(email)}`
        );

        if (emailExistente?.data) {
          toast((t) => (
            <span>
              Esse email já está cadastrado.
              <button onClick={() => navigate("/login")} id="alertButton">
                Fazer login
              </button>
            </span>
          ));
          return;
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error("Erro ao verificar e-mail:", error);
          toast.error("Erro ao verificar o e-mail.");
          return;
        }
      }
      if (senha !== repetirSenha) {
        toast.error("As senhas não coincidem.");
        return;
      }

      try {
        const promise = api.post("/users", {
          nome,
          email,
          sobrenome,
          senha,
          telefone,
          endereco: {
            estado,
            cidade,
            bairro,
            logradouro,
            numero,
            complemento,
            cep,
          },
        });

        await toast.promise(promise, {
          loading: "Salvando...",
          success: "Usuário criado com sucesso!",
          error: "Erro ao criar usuário. Tente novamente.",
        });

        navigate(`/verify?email=${encodeURIComponent(email)}`);
      } catch (error) {
        console.error("Erro ao criar usuário:", error);
      }
    } else {
      toast.error("Campos com valor inválido");
    }
  };

  const teste = async () => {
    api.get("/teste");
  };

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div className={styles.bgWrapper}>
          <div id={styles.container}>
            <form action="" id={styles.signupForm}>
              <img src={textLogoSmallBlack} alt="" />
              <h1>Faça seu cadastro:</h1>
              <div id={styles.inputGrid}>
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("nome") ? styles.invalido : ""
                  }
                />
                <input
                  type="text"
                  placeholder="Sobrenome"
                  value={sobrenome}
                  onChange={(e) => {
                    setSobrenome(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("sobrenome") ? styles.invalido : ""
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("email") ? styles.invalido : ""
                  }
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Telefone"
                  value={formatarTelefone(telefone)}
                  onChange={(e) => {
                    const apenasNumeros = e.target.value.replace(/\D/g, "");
                    setTelefone(apenasNumeros);
                  }}
                  className={
                    camposInvalidos.includes("telefone") ? styles.invalido : ""
                  }
                />
                <div className={styles.password}>
                  <input
                    type={seePassword ? "text" : "password"}
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                    }}
                    className={
                      camposInvalidos.includes("senha") ? styles.invalido : ""
                    }
                  />
                  <i
                    className={
                      seePassword
                        ? "fa-regular fa-eye"
                        : "fa-regular fa-eye-slash"
                    }
                    onClick={() => {
                      setSeePassword(!seePassword);
                    }}
                  ></i>
                </div>
                <div className={styles.password}>
                  <input
                    type={seePassword2 ? "text" : "password"}
                    placeholder="Repetir senha"
                    value={repetirSenha}
                    onChange={(e) => {
                      setRepetirSenha(e.target.value);
                    }}
                    className={
                      camposInvalidos.includes("repetirSenha")
                        ? styles.invalido
                        : ""
                    }
                  />
                  <i
                    className={
                      seePassword2
                        ? "fa-regular fa-eye"
                        : "fa-regular fa-eye-slash"
                    }
                    onClick={() => {
                      setSeePassword2(!seePassword2);
                    }}
                  ></i>
                </div>

                <h1 id={styles.endereco}>Endereço</h1>
                <input
                  type="text"
                  placeholder="Estado"
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("estado") ? styles.invalido : ""
                  }
                />

                <input
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("cidade") ? styles.invalido : ""
                  }
                />
                <input
                  type="text"
                  placeholder="Bairro"
                  value={bairro}
                  onChange={(e) => {
                    setBairro(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("bairro") ? styles.invalido : ""
                  }
                />
                <input
                  type="text"
                  placeholder="Logradouro"
                  value={logradouro}
                  onChange={(e) => {
                    setLogradouro(e.target.value);
                  }}
                  className={
                    camposInvalidos.includes("logradouro")
                      ? styles.invalido
                      : ""
                  }
                />
                <input
                  type="text"
                  placeholder="Número"
                  value={numero}
                  onChange={(e) => {
                    const apenasNumeros = e.target.value.replace(/\D/g, "");
                    setNumero(apenasNumeros);
                  }}
                  className={
                    camposInvalidos.includes("numero") ? styles.invalido : ""
                  }
                />
                <input
                  type="text"
                  placeholder="Complemento (opcional)"
                  value={complemento}
                  onChange={(e) => {
                    setComplemento(e.target.value);
                  }}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CEP"
                  value={formatarCep(cep)}
                  onChange={(e) => {
                    const apenasNumeros = e.target.value.replace(/\D/g, "");
                    setCep(apenasNumeros);
                  }}
                  className={
                    camposInvalidos.includes("cep") ? styles.invalido : ""
                  }
                />
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  Enviar
                </button>
              </div>
              <p>
                Já tem uma conta?{" "}
                <a
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  {" "}
                  Faça login
                </a>
              </p>
              <p>
                Ou{" "}
                <a
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  explore como visitante
                </a>
              </p>
            </form>
          </div>
          <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
        </div>
      )}
    </>
  );
};

export default Signup;
