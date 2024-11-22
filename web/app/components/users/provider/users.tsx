'use client'

import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { XMarkIcon } from '@heroicons/react/20/solid'
import Avatar from '../../base/avatar'
import Button from '../../base/button'
import Modal from '../../base/modal'
import Input from '../../base/input'
import { Register } from './register'
import { deleteUserAPI, getUsers } from '@/service/common'
import { useAppContext } from '@/context/app-context'

export function Users() {
  const [data, setData] = useState([])
  const [editData, setEditData] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [deleteUser, setDeleteUser] = useState<boolean>(false)
  const [confirmationDelete, setConfirmationDelete] = useState<string>('')

  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [errorDeleting, setErrorDeleting] = useState<string | null>(null)

  const { userProfile } = useAppContext()

  const fetchUsers = useCallback(async () => {
    const users = await getUsers(userProfile.id)
    setData(users)
  }, [userProfile.id])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEditUser = useCallback((id: string) => {
    setEditData(true)
    setUserId(id)
  }, [])

  const handleEditedUser = useCallback(async () => {
    setEditData(false)
    setUserId(null)
    await fetchUsers()
  }, [fetchUsers])

  const handleDeleteUser = useCallback(async (id: string) => {
    setUserId(id)
    setDeleteUser(true)
    setErrorDeleting(null)
  }, [])

  const handleDeleteUserConfirmation = useCallback(async () => {
    if (confirmationDelete !== 'EXCLUIR')
      return
    setIsDeleting(true)
    try {
      console.log(userId)

      await deleteUserAPI({
        userId,
      })
      await fetchUsers()
      setDeleteUser(false)
      setConfirmationDelete('')
    }
    catch (error) {
      setErrorDeleting('Erro ao excluir o usuário. Tente novamente.')
    }
    finally {
      setIsDeleting(false)
    }
  }, [confirmationDelete, fetchUsers, userId])

  return (
    <div className="overflow-visible lg:overflow-visible max-w-[500px]">
      <div className="flex items-center py-[7px] border-b border-gray-200 min-w-[480px]">
        <div className="grow px-3 text-xs font-medium text-gray-500">Nome</div>
        <div className="shrink-0 w-[104px] text-xs font-medium text-gray-500 text-end">
          Criado em
        </div>
        <div className="shrink-0 w-[96px] px-3 text-xs font-medium text-gray-500 text-end">
          Ações
        </div>
      </div>
      <div className="min-w-[480px] relative">
        {data.length > 0
          && data.map((account: any) => (
            <div
              key={account.id}
              className="flex items-center border-b border-gray-100"
            >
              <div className="grow flex items-center py-2 px-3">
                <Avatar size={24} className="mr-2" name={account.name} />
                <div className="">
                  <div className="text-[13px] font-medium text-gray-700 leading-[18px]">
                    {account.name}
                  </div>
                  <div className="text-xs text-gray-500 leading-[18px]">
                    {account.email}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center w-[104px] py-2 text-[13px] text-gray-700">
                {dayjs(account.created_at).format('DD/MM/YYYY')}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleEditUser(account.id)}
                >
                  Editar
                </Button>
                <Button
                  variant="warning"
                  size="small"
                  onClick={() => handleDeleteUser(account.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
      </div>

      <Modal
        overflowVisible
        isShow={editData}
        onClose={() => setEditData(false)}
      >
        <div className="flex justify-between mb-2">
          <div className="text-xl font-semibold text-gray-900">
            Editar usuário
          </div>
          <XMarkIcon
            className="w-4 h-4 cursor-pointer"
            onClick={() => setEditData(false)}
          />
        </div>
        <Register userId={userId} handleUpdated={handleEditedUser} />
      </Modal>

      <Modal
        overflowVisible
        isShow={deleteUser}
        onClose={() => setDeleteUser(false)}
      >
        <div className="flex justify-between mb-2">
          <div className="text-xl font-semibold text-gray-900">
            Excluir usuário
          </div>
          <XMarkIcon
            className="w-4 h-4 cursor-pointer"
            onClick={() => setDeleteUser(false)}
          />
        </div>
        <div className="grid gap-2">
          <div className="grid">
            <span className="text-sm">
              Deseja realmente excluir este usuário?
            </span>
            <span className="text-sm block">
              Para confirmar ação digite <strong>EXCLUIR</strong> abaixo.
            </span>
          </div>
          <Input
            value={confirmationDelete}
            onChange={e => setConfirmationDelete(e.target.value)}
            disabled={isDeleting}
          />
          {errorDeleting && (
            <div className="text-red-500 text-sm">{errorDeleting}</div>
          )}
          <Button
            variant="warning"
            disabled={confirmationDelete !== 'EXCLUIR' || isDeleting}
            onClick={handleDeleteUserConfirmation}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
