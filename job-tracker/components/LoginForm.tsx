'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface LoginFormProps {
  onLogin: (password: string) => boolean;
  isFirstTime: boolean;
}

export default function LoginForm({ onLogin, isFirstTime }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (isFirstTime) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }
    }

    const success = onLogin(password);
    if (!success && !isFirstTime) {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isFirstTime ? 'Set Your Password' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isFirstTime 
              ? 'Create a password to protect your job application data'
              : 'Enter your password to access your job tracker'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={isFirstTime ? "Create password" : "Enter password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full"
              />
            </div>
            
            {isFirstTime && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              {isFirstTime ? 'Set Password' : 'Login'}
            </Button>

            {isFirstTime && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Note: Your password is stored locally in your browser. Make sure to remember it!
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

