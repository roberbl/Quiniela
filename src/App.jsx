import { useMemo, useState } from 'react';
import Nav from './components/Nav';
import Home from './pages/Home';
import Ranking from './pages/Ranking';
import Season from './pages/Season';
import Rules from './pages/Rules';
import Admin from './pages/Admin';
import { mockMatches, mockRound, mockTeams, mockUsers } from './data/mock';
import { findUserByUsername, savePrediction, saveUserProfile, upsertMatch, upsertRound } from './services/firestore';
import { simpleLogin } from './services/firebase';
import { hashPassword, normalizeUsername, validateCredentials } from './services/credentials';
import { scoreRound, rankRound, computeGeneral } from './services/scoring';
import './styles.css';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

export default function App() {
  const [page, setPage] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState(localStorage.username || '');
  const [displayName, setDisplayName] = useState(localStorage.name || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState(null);
  const [round, setRound] = useState(mockRound);
  const [matches, setMatches] = useState(mockMatches);
  const [teams] = useState(mockTeams);
  const [users, setUsers] = useState(mockUsers);
  const [prediction, setPrediction] = useState({ picks: {}, pleno: '' });
  const [allPredictions, setAllPredictions] = useState([]);
  const [season, setSeason] = useState({});
  const [message, setMessage] = useState('');

  const activeUser = user ? users.find((u) => u.id === user.uid) || { id: user.uid, name: displayName || username } : null;
  const isAdmin = activeUser?.role === 'admin';
  const closed = round.status !== 'open' || new Date(round.deadline) < new Date();
  const rankedUsers = useMemo(() => computeGeneral(users, Object.fromEntries(users.map((u) => [u.id, u.totalPoints || 0]))), [users]);

  async function startSession(profile, sessionUser, persistProfile = true) {
    const activeSession = sessionUser || await simpleLogin(profile.name || profile.username);
    localStorage.username = profile.username;
    localStorage.name = profile.name || profile.username;
    setUser(activeSession);
    setDisplayName(profile.name || profile.username);
    setLoginError('');
    const fullProfile = { ...profile, id: activeSession.uid };
    setUsers((prev) => [...prev.filter((x) => x.id !== activeSession.uid), fullProfile]);
    try {
      if (persistProfile) await saveUserProfile(activeSession, profile);
    } catch {
      setMessage('Has entrado, pero no se pudo guardar el perfil en Firebase. Revisa la configuración.');
    }
  }

  async function login() {
    const cleanUsername = normalizeUsername(username);
    const error = validateCredentials(cleanUsername, password);
    if (error) { setLoginError(error); return; }

    try {
      const sessionUser = await simpleLogin(cleanUsername);
      if (cleanUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        await startSession({ username: ADMIN_USERNAME, name: 'Administrador', role: 'admin', teamId: 't1', money: 0, copitaCount: 0, seasonPoints: 0, totalPoints: 0 }, sessionUser);
        return;
      }
      const existing = await findUserByUsername(cleanUsername);
      const passwordHash = await hashPassword(password);
      if (!existing || existing.passwordHash !== passwordHash) {
        setLoginError('Usuario o contraseña incorrectos. Si aún no tienes usuario, pulsa “Registrarme”.');
        return;
      }
      await startSession(existing, sessionUser, false);
    } catch {
      setLoginError('No se pudo comprobar el usuario en Firebase. Revisa que Firestore esté configurado.');
    }
  }

  async function register() {
    const cleanUsername = normalizeUsername(username);
    const cleanName = displayName.trim() || cleanUsername;
    const error = validateCredentials(cleanUsername, password);
    if (error) { setLoginError(error); return; }
    if (cleanUsername === ADMIN_USERNAME) { setLoginError('El usuario admin está reservado. Elige otro nombre de usuario.'); return; }

    let sessionUser;
    try {
      sessionUser = await simpleLogin(cleanUsername);
      const existing = await findUserByUsername(cleanUsername);
      if (existing) { setLoginError('Ese usuario ya existe. Elige otro o inicia sesión.'); return; }
    } catch {
      // If Firebase is not ready, still let the user enter local mode and show a warning after saveUserProfile fails.
    }

    const passwordHash = await hashPassword(password);
    await startSession({ username: cleanUsername, name: cleanName, passwordHash, role: 'participant', teamId: '', money: 0, copitaCount: 0, seasonPoints: 0, totalPoints: 0 }, sessionUser);
  }

  async function save() {
    const data = { ...prediction, name: activeUser?.name };
    setAllPredictions((p) => [...p.filter((x) => x.userId !== activeUser.id), { ...data, userId: activeUser.id }]);
    try { await savePrediction(round.id, activeUser.id, data); } catch {}
    setMessage('Quiniela guardada correctamente');
  }
  async function saveRound() { await upsertRound(round); setMessage('Jornada guardada'); }
  async function saveMatch(m) { await upsertMatch(round.id, m); setMessage('Partido guardado'); }
  function recalc() {
    const scores = rankRound(allPredictions.map((p) => scoreRound(matches, { ...p, roundPlenoResult: round.pleno.result }, round.copitaId)));
    setUsers(users.map((u) => ({ ...u, totalPoints: scores.find((s) => s.userId === u.id)?.points || u.totalPoints || 0, copitaCount: u.id === scores[0]?.userId ? (u.copitaCount || 0) + 1 : u.copitaCount })));
    setMessage('Clasificación recalculada');
  }

  if (!user) return <main className="login"><h1>Quiniela familiar 2026/2027</h1><p>Entra con usuario y contraseña. El administrador entra con usuario <b>admin</b> y contraseña <b>admin</b>.</p><div className="auth-tabs"><button className={authMode === 'login' ? 'selected' : ''} onClick={() => setAuthMode('login')} type="button">Entrar</button><button className={authMode === 'register' ? 'selected' : ''} onClick={() => setAuthMode('register')} type="button">Registrarme</button></div><label>Usuario<input autoComplete="username" placeholder="Ej. josito" value={username} onChange={(e) => setUsername(e.target.value)} /></label>{authMode === 'register' && <label>Nombre visible<input placeholder="Ej. Josito" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label>}<label>Contraseña<input autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder={authMode === 'login' ? 'Tu contraseña' : 'Elige una contraseña'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><div className="login-help"><b>Para probar ahora:</b><span>Admin: usuario <code>admin</code>, contraseña <code>admin</code>.</span><span>Familiares: pulsa <code>Registrarme</code>, elige usuario y contraseña, y se guardará el perfil en Firebase.</span></div>{loginError && <p className="error">{loginError}</p>}<button className="primary" onClick={authMode === 'login' ? login : register}>{authMode === 'login' ? 'Entrar' : 'Crear usuario'}</button></main>;
  return <><header><b>Quiniela 26/27</b><span>{activeUser?.name || username}</span></header>{message && <div className="toast">{message}</div>}<main>{page === 'home' && <Home round={round} matches={matches} prediction={prediction} setPrediction={setPrediction} save={save} allPredictions={allPredictions} closed={closed} />} {page === 'ranking' && <Ranking users={rankedUsers} teams={teams} />} {page === 'season' && <Season season={season} setSeason={setSeason} saveSeason={() => setMessage('Tablas guardadas')} isAdmin={isAdmin} />} {page === 'rules' && <Rules />} {page === 'admin' && isAdmin && <Admin round={round} setRound={setRound} matches={matches} setMatches={setMatches} users={users} saveRound={saveRound} saveMatch={saveMatch} recalc={recalc} />}</main><Nav page={page} setPage={setPage} isAdmin={isAdmin} /></>;
}
