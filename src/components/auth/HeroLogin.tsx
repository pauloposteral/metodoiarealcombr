import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/** Uses the existing authentication service. No password is persisted or logged. */
export function HeroLogin() {
  const navigate = useNavigate();
  const busy = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) {
      setError('Preencha seu e-mail e sua senha para entrar.');
      return;
    }
    busy.current = true; setPending(true);
    try {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message.includes('Invalid login credentials')
          ? 'E-mail ou senha incorretos. Confira os campos ou recupere sua senha.'
          : result.error.message.includes('Email not confirmed')
            ? 'Confirme seu e-mail pelo link enviado antes de entrar.'
            : 'Não foi possível entrar. Verifique sua conexão e tente novamente.');
        return;
      }
      setPassword('');
      navigate('/membros');
    } catch {
      setError('Não foi possível entrar. Verifique sua conexão e tente novamente.');
    } finally { busy.current = false; setPending(false); }
  }
  return (
    <form id="hero-login" className="lcn-login" onSubmit={submit} noValidate aria-labelledby="hero-login-title" aria-busy={pending}>
      <p className="lcn-login-eyebrow">Sua área de estudo</p>
      <h2 id="hero-login-title">Entre e continue.</h2>
      <label htmlFor="hero-email">E-mail</label>
      <input id="hero-email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} required aria-invalid={Boolean(error)} aria-describedby={error ? 'hero-login-error' : undefined} />
      <label htmlFor="hero-password">Senha</label>
      <div className="lcn-login-password">
        <input id="hero-password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required aria-invalid={Boolean(error)} aria-describedby={error ? 'hero-login-error' : undefined} />
        <button type="button" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
      <div className="lcn-login-feedback" aria-live="polite">{error && <p id="hero-login-error" role="alert">{error}</p>}</div>
      <button className="lcn-login-submit" type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <>Entrar <ArrowRight size={18} aria-hidden="true" /></>}</button>
      <div className="lcn-login-links"><Link to="/auth?mode=reset">Esqueci minha senha</Link><Link to="/auth?mode=signup">Criar conta</Link></div>
      <a className="lcn-login-free" href="/aprender">Conhecer os guias gratuitos →</a>
    </form>
  );
}
