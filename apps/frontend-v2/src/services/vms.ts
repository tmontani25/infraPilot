//wrapper de axios
//permet d'utilser les fonctions dans les composants react
import { api } from '../lib/apiClient'


export async function getVms(){

    const response = await api.get('/vms') // appel http
    return response.data
}

export async function startVm(id : string){
    const response = await api.post(`/vms/${id}/start`) // appel http
    return response.data
}

export async function stopVm(id : string){
    const response = await api.post(`/vms/${id}/stop`)
    return response.data
}

export async function rebootVm(id : string){
    const response = await api.post(`/vms/${id}/reboot`)
    return response.data
}