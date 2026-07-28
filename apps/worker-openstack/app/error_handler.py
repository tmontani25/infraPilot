from fastapi import FastAPI
from fastapi.responses import JSONResponse
from openstack.exceptions import NotFoundException, HttpException, SDKException
from keystoneauth1.exceptions.base import ClientException as KeystoneClientException

def register_error_handlers(app: FastAPI):

#ressource non trouvée
    @app.exception_handler(NotFoundException)
    def not_found_handler(request, exc):
        return JSONResponse(status_code=404, content={"detail": "ressource introuvable"})

#erreur http, auth, quota cpu depassé etc
    @app.exception_handler(HttpException)
    def http_handler(request, exc):
        return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})

#erreur communication mon worker->openstack pas de reponse http (url injoignable timeout reponse json mal formee)
    @app.exception_handler(SDKException)
    def sdk_handler(request, exc):
        return JSONResponse(status_code=500, content={"detail": str(exc)})

#credentials du compte cloud invalides/incomplètes (mauvais mdp, champ manquant type auth_url...)
    @app.exception_handler(KeystoneClientException)
    def keystone_handler(request, exc):
        return JSONResponse(status_code=502, content={"detail": f"Connexion au compte cloud impossible : {exc}"})

#filet de sécurité : ne jamais laisser remonter une réponse non-JSON (le gateway Fastify
#s'attend à toujours pouvoir parser body.detail, une erreur texte brut casserait ça)
    @app.exception_handler(Exception)
    def unexpected_handler(request, exc):
        return JSONResponse(status_code=500, content={"detail": f"Erreur inattendue du worker : {exc}"})
