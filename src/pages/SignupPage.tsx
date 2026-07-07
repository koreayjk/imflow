import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/" replace />;
  return <AuthForm mode="signup" />;
}
