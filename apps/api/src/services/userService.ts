import * as usersRepository from '../repository/usersRepository.js' 
import { NotFoundError, BadRequestError } from '../utils/appErrors.js'


export async function getUserById(id : number){
    const user = await usersRepository.getById(id)
    if (!user) {
        throw new NotFoundError('User not found')
    }
    return user
}

