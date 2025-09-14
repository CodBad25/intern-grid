import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('stagiaire');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou mot de passe incorrect');
        } else {
          toast.error(`Erreur de connexion: ${error.message}`);
        }
        return;
      }

      toast.success('Connexion réussie !');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim() || !password || !displayName.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName.trim(),
            role: role
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Un compte existe déjà avec cet email');
        } else {
          toast.error(`Erreur d'inscription: ${error.message}`);
        }
        return;
      }

      toast.success('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
      setActiveTab('login');
      
      // Clear form
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setRole('stagiaire');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setRole('stagiaire');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Suivi des Stagiaires
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-center">
              {activeTab === 'login' ? 'Connexion' : 'Créer un compte'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Accédez à votre tableau de bord' 
                : 'Rejoignez la plateforme de suivi'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" onClick={resetForm}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={resetForm}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    Se connecter
                  </Button>

                  {/* Connexion rapide */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      Connexion rapide (compte de démonstration)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const { error } = await supabase.auth.signInWithPassword({
                            email: 'laurence.mauny@ac-nantes.fr',
                            password: 'Stag25!',
                          });

                          if (error) {
                            const msg = (error as any).message || '';
                            if (msg.includes('email_not_confirmed') || msg.toLowerCase().includes('email not confirmed')) {
                              toast.error("Le compte n'est pas activé. Contactez l'administrateur ou utilisez le formulaire d'inscription.");
                            } else if (msg.includes('Invalid login credentials')) {
                              toast.error('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
                            } else {
                              toast.error(`Erreur de connexion: ${msg}`);
                            }
                            return;
                          }

                          toast.success('Connexion réussie !');
                          navigate('/');
                        } catch (error) {
                          console.error('Login error:', error);
                          toast.error('Erreur lors de la connexion');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      Laurence Mauny (Tuteur)
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nom complet *</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Prénom Nom"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-role">Rôle</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stagiaire">Stagiaire</SelectItem>
                        <SelectItem value="tuteur">Tuteur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        minLength={6}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Au moins 6 caractères
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    Créer le compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
}