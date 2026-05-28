import { api } from '../lib/apiClient'
import type { Image, Flavor, Keypair } from '../types'

export async function getImages(): Promise<Image[]> {
  const { data } = await api.get('/images')
  return data
}

export async function getFlavors(): Promise<Flavor[]> {
  const { data } = await api.get('/flavors')
  return data
}

export async function getKeypairs(): Promise<Keypair[]> {
  const { data } = await api.get('/keypairs')
  return data
}
