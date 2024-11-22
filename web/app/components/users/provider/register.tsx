import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Input from '../../base/input'
import Select from '../../base/select'
import Button from '../../base/button'
import { getUser, registerUser, updateUser } from '@/service/common'
import { useAppContext } from '@/context/app-context'

type RegisterProps = {
  userId?: string | null
  handleUpdated: () => void
}

export function Register({ userId, handleUpdated }: RegisterProps) {
  const router = useRouter()
  const { userProfile } = useAppContext()

  const UserRegisterSchema = z.object({
    name: z
      .string({ message: 'O nome é obrigatório' })
      .min(3, { message: 'O nome deve ter no mínimo 3 letras' }),
    email: z
      .string({ message: 'O e-mail é obrigatório' })
      .email({ message: 'E-mail inválido' }),
    password: z
      .string({ message: 'A senha é obrigatória' })
      .min(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
      .refine(
        value =>
          /[A-Za-z]/.test(value) // Contém letras
          && /[0-9]/.test(value), // Contém números
        {
          message: 'A senha deve conter letras e números',
        },
      ),
    role: z.enum(['common', 'admin'], {
      message: 'O nível de usuário deve ser comum ou administrador',
    }),
  })

  type UserRegisterType = z.infer<typeof UserRegisterSchema>

  const { register, handleSubmit, formState, setValue, control }
    = useForm<UserRegisterType>({
      resolver: zodResolver(UserRegisterSchema),
    })

  const items = [
    {
      value: 'common',
      name: 'Comum',
    },
    {
      value: 'admin',
      name: 'Administrador',
    },
  ]

  // Monitorando mudanças no campo "role"
  const roleValue = useWatch({
    control,
    name: 'role',
  })

  const onSubmit = useCallback(
    async ({ email, name, password, role }: UserRegisterType) => {
      if (userId) {
        await updateUser({
          userId,
          body: {
            email,
            name,
            password,
            role,
            account_id: userProfile.id,
          },
        })

        handleUpdated()
      }
      else {
        const { result } = await registerUser({
          body: {
            email,
            name,
            password,
            role,
            account_id: userProfile.id,
          },
        })

        router.push('/users')
      }
    },
    [handleUpdated, router, userId, userProfile.id],
  )

  useEffect(() => {
    async function fetchUser() {
      if (userId) {
        const user = await getUser(userId)

        setValue('name', user[0].name)
        setValue('email', user[0].email)
        setValue('role', user[0].role as UserRegisterType['role'])
      }
    }
    if (userId)
      fetchUser()
  }, [setValue, userId])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full grid gap-2">
      <div className="grid">
        <label className="flex items-center justify-between text-sm font-medium text-gray-900">
          Nome
          {formState.errors.name && (
            <span className="text-red-400 text-sm">
              {formState.errors.name.message}
            </span>
          )}
        </label>
        <Input placeholder="Nome" type="text" {...register('name')} />
      </div>
      <div className="grid">
        <label className="flex items-center justify-between text-sm font-medium text-gray-900">
          E-mail
          {formState.errors.email && (
            <span className="text-red-400 text-sm">
              {formState.errors.email.message}
            </span>
          )}
        </label>
        <Input placeholder="E-mail" type="email" {...register('email')} />
      </div>
      <div className="grid">
        <label className="flex items-center justify-between text-sm font-medium text-gray-900">
          Senha
          {formState.errors.password && (
            <span className="text-red-400 text-sm">
              {formState.errors.password.message}
            </span>
          )}
        </label>
        <Input placeholder="Senha" type="password" {...register('password')} />
      </div>
      <div className="grid">
        <label className="flex items-center justify-between text-sm font-medium text-gray-900">
          Nível de usuário
          {formState.errors.role && (
            <span className="text-red-400 text-sm">
              {formState.errors.role.message}
            </span>
          )}
        </label>
        <Select
          placeholder="Selecione"
          defaultValue={roleValue}
          items={items}
          onSelect={(option) => {
            setValue('role', option.value as UserRegisterType['role'])
          }}
        />
      </div>
      <Button type="submit" variant="primary">
        {userId ? 'Atualizar' : 'Cadastrar'}
      </Button>
    </form>
  )
}
