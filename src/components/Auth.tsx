import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function Auth({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'mru7812') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setPassword('');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-hover/50 via-background to-background pointer-events-none" />
      
      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onSubmit={handleSubmit} 
        className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-2xl">
          <Lock className="w-6 h-6 text-muted" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light tracking-[0.2em] text-primary uppercase">Secure Connection</h1>
          <p className="text-xs text-muted font-mono tracking-widest uppercase">Encrypted Terminal</p>
        </div>
        
        <div className="w-full space-y-4 pt-4">
          <div className="relative">
             <input
               type="password"
               placeholder="ENTER PASSCODE"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className={`w-full bg-surface border ${error ? 'border-down text-down shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-border text-primary focus:border-primary'} rounded-xl py-4 px-6 text-center text-lg focus:outline-none transition-all duration-300 font-mono tracking-[0.3em] uppercase placeholder:tracking-widest placeholder:text-muted/30`}
               autoFocus
             />
          </div>
          {error && (
             <motion.p 
               initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
               className="text-down text-xs text-center font-mono opacity-80 tracking-widest uppercase absolute w-full -bottom-8"
             >
               Access Denied
             </motion.p>
          )}
        </div>
      </motion.form>
    </div>
  );
}
