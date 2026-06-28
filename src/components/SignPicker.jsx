import { SIGNS } from '../services/scoring';
export default function SignPicker({ value, onChange, disabled }) {
  return <div className="sign-picker">{SIGNS.map((s) => <button key={s} disabled={disabled} className={value === s ? 'selected' : ''} onClick={() => onChange(s)} type="button">{s}</button>)}</div>;
}
