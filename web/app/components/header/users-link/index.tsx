import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import classNames from '@/utils/classnames'

type UsersLinkProps = {
  className?: string
}

const UsersLink = ({ className }: UsersLinkProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'users'

  return (
    <Link
      href="/users"
      className={classNames(
        className,
        'group',
        activated && 'bg-components-main-nav-nav-button-bg-active shadow-md',
        activated
          ? 'text-components-main-nav-nav-button-text-active'
          : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover',
      )}
    >
      {t('common.menus.users')}
    </Link>
  )
}

export default UsersLink
