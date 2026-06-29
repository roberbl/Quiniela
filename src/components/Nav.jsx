import { Home, Trophy, ClipboardList, Info, Shield } from 'lucide-react';
const items = [['home','Inicio',Home],['ranking','Clasificación',Trophy],['season','Tablas',ClipboardList],['rules','Instrucciones',Info],['admin','Admin',Shield]];
export default function Nav({ page, setPage, isAdmin }) { return <nav className="bottom-nav">{items.filter(([id]) => id !== 'admin' || isAdmin).map(([id,label,Icon]) => <button className={page===id?'active':''} onClick={()=>setPage(id)} key={id}><Icon size={20}/><span>{label}</span></button>)}</nav>; }
