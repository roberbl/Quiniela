import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export const listenCollection = (path, cb, orderField = 'order') => onSnapshot(query(collection(db, path), orderBy(orderField)), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
export const listenDoc = (path, id, cb) => onSnapshot(doc(db, path, id), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null));
export const saveUserProfile = (user, profile) => setDoc(doc(db, 'users', user.uid), { ...profile, name: profile.name || user.displayName, role: profile.role || 'participant', updatedAt: serverTimestamp() }, { merge: true });
export const savePrediction = (roundId, userId, data) => setDoc(doc(db, `rounds/${roundId}/predictions`, userId), { ...data, userId, updatedAt: serverTimestamp() }, { merge: true });
export const upsertRound = (round) => setDoc(doc(db, 'rounds', round.id || `round-${round.number}`), round, { merge: true });
export const upsertMatch = (roundId, match) => setDoc(doc(db, `rounds/${roundId}/matches`, match.id || `m${match.order}`), match, { merge: true });
export const updateRound = (roundId, data) => updateDoc(doc(db, 'rounds', roundId), data);
export const getCollection = async (path) => (await getDocs(collection(db, path))).docs.map((d) => ({ id: d.id, ...d.data() }));

export async function findUserByUsername(username) {
  const snap = await getDocs(query(collection(db, 'users'), where('username', '==', username), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}
