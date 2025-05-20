'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createAccount, signInUser } from '@/lib/actions/user.actions';
import { useState } from 'react';

type FormType = 'sign-in' | 'sign-up';

const authFormSchema = (formType: FormType) =>
  z
    .object({
      email: z.string().min(1, 'O email é obrigatório').email('Formato de email inválido'),
      password: z.string().min(6, 'A senha é obrigatória'),
      confirmPassword:
        formType === 'sign-up' ? z.string().min(6, 'Confirme sua senha') : z.string().optional(),
      fullName:
        formType === 'sign-up'
          ? z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(50)
          : z.string().optional(),
    })
    .refine((data) => formType !== 'sign-up' || data.password === data.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    });

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      let user;

      if (type === 'sign-in') {
        user = await signInUser({ email: values.email, password: values.password });
      } else {
        user = await createAccount({
          fullName: values.fullName || '',
          email: values.email,
          password: values.password,
        });
      }

      if (user?.success !== false) {
        window.location.href = '/dashboard';
      } else {
        alert(user.message || 'Erro ao autenticar.');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title">{type === 'sign-in' ? 'Fazer login' : 'Criar conta'}</h1>

        {type === 'sign-up' && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Preencha seu nome completo"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
                <FormLabel className="shad-form-label">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu email" className="shad-input" {...field} />
                </FormControl>
              </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
                <FormLabel className="shad-form-label">
                  {type === 'sign-in' ? 'Senha' : 'Crie uma senha'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={type === 'sign-in' ? 'Digite sua senha' : 'Crie sua senha'}
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />

        {type === 'sign-up' && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirme sua senha"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="form-submit-button relative" disabled={isLoading}>
          {isLoading ? (
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="h-4 w-6 rounded-full bg-white"
                  style={{ borderRadius: '50% 50% 40% 40%' }}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: 'easeInOut',
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          ) : type === 'sign-in' ? (
            'Fazer login'
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AuthForm;
