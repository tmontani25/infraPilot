import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

export default async function authenticate(request: FastifyRequest, reply : FastifyReply){

    await request.jwtVerify({onlyCookie: true})

}