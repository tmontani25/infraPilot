import axios from 'axios'

// En dev, l'IP/hostname utilisé pour joindre l'API est celui avec lequel le
// navigateur a chargé le frontend (localhost en local, IP LAN pour un
// collègue sur le réseau) — évite de coder une adresse en dur.
const API_URL = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:4000/api/v1`

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

// Le compte cloud actif est choisi une fois (sélecteur dans la Topbar) et
// injecté automatiquement dans tous les appels qui parlent à un worker,
// pour éviter de faire passer providerId à travers chaque service/page.
let activeProviderId: number | null = null

export function setActiveProviderId(id: number | null) {
    activeProviderId = id
}

const ROUTES_WITHOUT_PROVIDER = ['/auth/', '/clients']

api.interceptors.request.use((config) => {
    const needsProvider = !ROUTES_WITHOUT_PROVIDER.some(route => config.url?.includes(route))
    // un appel peut déjà préciser son propre providerId (ex: consulter un compte
    // qui n'est pas celui actif) — dans ce cas on ne l'écrase pas
    if (needsProvider && activeProviderId != null && config.params?.providerId == null) {
        config.params = { ...config.params, providerId: activeProviderId }
    }
    return config
})
