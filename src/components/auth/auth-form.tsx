'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (resetMode) {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          toast.success('Password reset email sent! Check your inbox.')
          setResetMode(false)
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message)
        } else {
          toast.success('Account created! Check your email to verify your account.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {resetMode 
              ? 'Reset Password' 
              : mode === 'signin' 
                ? 'Sign In' 
                : 'Sign Up'
            }
          </CardTitle>
          <CardDescription>
            {resetMode 
              ? 'Enter your email to reset your password'
              : mode === 'signin' 
                ? 'Welcome back! Please sign in to your account.' 
                : 'Create a new account to get started.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!resetMode && (
              <>
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetMode 
                ? 'Send Reset Email' 
                : mode === 'signin' 
                  ? 'Sign In' 
                  : 'Sign Up'
              }
            </Button>

            <div className="text-center space-y-2">
              {!resetMode && (
                <>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                  >
                    {mode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : 'Already have an account? Sign in'
                    }
                  </Button>

                  {mode === 'signin' && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => setResetMode(true)}
                    >
                      Forgot your password?
                    </Button>
                  )}
                </>
              )}

              {resetMode && (
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => setResetMode(false)}
                >
                  Back to sign in
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}