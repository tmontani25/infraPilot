import {
  LayoutDashboard,
  Monitor,
  HelpCircle,
  Bell,
  Palette,
  Server,
  HardDrive,
  Settings,
  Wrench,
  UserCog,
  Network,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'admin',
    email: 'admin@infrapilot.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'infraPilot',
      logo: Server,
      plan: 'OpenStack',
    },
  ],
  navGroups: [
    {
      title: 'Infrastructure',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Machines Virtuelles',
          url: '/vms',
          icon: Server,
        },
        {
          title: 'Volumes',
          url: '/volumes',
          icon: HardDrive,
        },
        {
          title: 'Réseaux',
          url: '/networks',
          icon: Network,
        },
      ],
    },
    {
      title: 'Paramètres',
      items: [
        {
          title: 'Paramètres',
          icon: Settings,
          items: [
            {
              title: 'Profil',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Compte',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Apparence',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Affichage',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Centre d\'aide',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
