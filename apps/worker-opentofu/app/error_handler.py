from fastapi import FastAPI
from fastapi.responses import JSONResponse


def register_error_handlers(app: FastAPI):

    # filet de sécurité : ne jamais renvoyer de texte brut, toujours du JSON avec "detail"
    @app.exception_handler(Exception)
    def unexpected_handler(request, exc):
        return JSONResponse(status_code=500, content={"detail": f"Erreur inattendue du worker : {exc}"})
