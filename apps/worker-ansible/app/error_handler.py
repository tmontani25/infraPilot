from fastapi import FastAPI
from fastapi.responses import JSONResponse

def register_error_handlers(app: FastAPI):

    # filet de sécurité : ne jamais laisser remonter une réponse non-JSON (le gateway
    # Fastify s'attend à toujours pouvoir parser body.detail)
    @app.exception_handler(Exception)
    def unexpected_handler(request, exc):
        return JSONResponse(status_code=500, content={"detail": f"Erreur inattendue du worker : {exc}"})
