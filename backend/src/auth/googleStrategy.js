// src/auth/googleStrategy.js
import passport from 'passport'; // passport é uma biblioteca para autenticação, suportando várias estratégias
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // estratégia de autenticação via Google OAuth 2.0
import dotenv from 'dotenv'; // carrega variáveis de ambiente a partir de um arquivo .env

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Configura a estratégia do Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // ID do cliente obtido no console de desenvolvedores do Google
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Segredo do cliente obtido no console de desenvolvedores do Google
    callbackURL: process.env.GOOGLE_CALLBACK_URL // URL de redirecionamento após autenticação
  },
  // Função de verificação chamada após a autenticação bem-sucedida
  async (accessToken, refreshToken, profile, done) => { // faz o processamento do perfil do usuário retornado pelo Google
    // faz o log do perfil do usuário retornado pelo Google
    console.log('Perfil do usuário Google:', profile); // para fins de depuração
    const user = {
      googleId: profile.id, // ID único do usuário no Google
      displayName: profile.displayName, // Nome completo do usuário
      emails: profile.emails // Lista de e-mails associados ao perfil do usuário
    };

    
    return done(null, user); // retorna o usuário autenticado
  }
));

passport.serializeUser((user, done) => done(null, user)); // serializa o usuário para a sessão
passport.deserializeUser((user, done) => done(null, user)); // desserializa o usuário da sessão

export default passport; // Exporta a configuração do passport para uso em outras partes da aplicação
