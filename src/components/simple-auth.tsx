'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Loader2 } from 'lucide-react';

const SESSION_KEY = 'video-review-session';
const CORRECT_PASSWORD = 'avantajp';

export default function SimpleAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const sessionValue = localStorage.getItem(SESSION_KEY);
      if (sessionValue === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Could not access local storage", e);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        try {
          localStorage.setItem(SESSION_KEY, 'true');
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Could not write to local storage", e);
          setError('Could not save session. Please enable cookies/local storage.');
        }
      } else {
        setError('Incorrect password');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
              <Lock className="h-6 w-6"/>
              Protected Area
            </CardTitle>
            <CardDescription>
              Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
