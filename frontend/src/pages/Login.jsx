import React, { useEffect, useState } from "react"; // importa React e hooks necessários

const BACKEND_URL = "http://localhost:3000"; // URL do backend

export default function Login() { // componente de login
  const [user, setUser] = useState(null); // estado para armazenar dados do usuário

  // Verifica se o usuário já está logado
  useEffect(() => {
    fetch(`${BACKEND_URL}/me`, { // endpoint para obter dados do usuário logado
      method: "GET", // método GET para obter dados do usuário com sessão ativa
      credentials: "include", // envia cookies da sessão
    })
      .then(res => {
        if (!res.ok) throw new Error("Não autenticado"); // se não estiver autenticado, lança erro
        return res.json(); // converte a resposta para JSON
      })
      .then(data => setUser(data)) // define os dados do usuário no estado
      .catch(() => setUser(null)); // em caso de erro, define usuário como null
  }, []);

  const handleLogin = () => {
    // Redireciona para o backend iniciar o login com Google
    window.location.href = `${BACKEND_URL}/auth/google`; // endpoint de login com Google, que inicia o fluxo OAuth
  };

  const handleLogout = () => {
    // Redireciona para o backend deslogar
    window.location.href = `${BACKEND_URL}/auth/logout`; // endpoint de logout
  };

  // Se o usuário não estiver logado, mostra o botão de login
  if (!user) { 
    return (
        //frontend/src/pages/login.jsx
      <div>
        <h1>Login</h1> {/*título da página de login */}
        <button onClick={handleLogin}>Entrar com Google</button> {/*botão que inicia o login com Google */}
      </div>
    );
  }

  // Se o usuário estiver logado, mostra suas informações e o botão de logout
  return (
    // faz a exibição das informações do usuário logado
    <div>
      <h1>Bem-vindo, {user.displayName}</h1> {/* mostra o nome do usuário */}
      <img src={user.photos[0].value} alt="Avatar" /> {/* mostra a foto do usuário */}
      <button onClick={handleLogout}>Sair</button> {/* botão de logout */}
    </div>
  );
}
