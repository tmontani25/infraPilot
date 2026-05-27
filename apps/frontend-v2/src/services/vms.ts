//wrapper de axios
//permet d'utilser les fonctions dans les composants react
import { api } from '../lib/apiClient'


export async function getVms(){

    const response = await api.get('/vms') // appel http

    return response.data
}
