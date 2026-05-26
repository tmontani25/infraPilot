import {
  LayoutDashboard,
  Server,
  HardDrive,
  Settings,
  Network,
  Cloud,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@infrapilot.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'infraPilot',
      logo: Server,
      plan: 'Infrastructure Management',
    },
  ],
  navGroups: [
    {
      title: 'Mon Projet',
      items: [
        {
          title: 'Vue d\'ensemble',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Machines',
      items: [
        {
          title: 'OpenStack Infomaniak',
          icon: Cloud,
          items: [
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
              title: 'Apparence',
              url: '/settings/appearance',
            },
          ],
        },
      ],
    },
  ],
}
