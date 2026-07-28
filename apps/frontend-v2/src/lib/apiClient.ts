import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:4000/api/v1',
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
    if (needsProvider && activeProviderId != null) {
        config.params = { ...config.params, providerId: activeProviderId }
    }
    return config
})
