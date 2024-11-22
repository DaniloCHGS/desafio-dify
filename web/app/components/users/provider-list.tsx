'use client'

import { useState } from 'react'
import type { UserCollection } from '../tools/types'
import TabSliderNew from '../base/tab-slider-new'
import { Plus02 } from '../base/icons/src/vender/line/general'
import { Users } from './provider/users'
import { Register } from './provider/register'
import cn from '@/utils/classnames'
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'

export const UserProiderList = () => {
  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: 'all',
  })

  const options = [
    {
      value: 'all',
      text: 'Todos',
    },
    {
      value: 'register',
      text: 'Cadastrar/Editar',
      icon: <Plus02 className="w-[14px] h-[14px] mr-1" />,
    },
  ]

  const [currentProvider, setCurrentProvider] = useState<
    UserCollection | undefined
  >()

  return (
    <div className="px-12 pt-2">
      <nav
        className={cn(
          'sticky top-0 flex justify-between items-center pt-4 pb-2 leading-[56px] bg-gray-100 z-20 flex-wrap gap-y-2',
          currentProvider && 'pr-6',
        )}
      >
        <TabSliderNew
          value={
            activeTab === 'register' ?? activeTab === 'edit'
              ? 'register'
              : 'all'
          }
          onChange={(state) => {
            setActiveTab(state)
            if (state !== activeTab)
              setCurrentProvider(undefined)
          }}
          options={options}
        />
      </nav>
      <div className="">{activeTab === 'all' && <Users />}</div>
      <div className="w-[480px]">
        {activeTab === 'register' && <Register />}
      </div>
    </div>
  )
}
