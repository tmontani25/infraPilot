from fastapi import FastAPI
from app.routes import templates, deployments
from app.error_handler import register_error_handlers

app = FastAPI()

register_error_handlers(app)

app.include_router(templates.router)
app.include_router(deployments.router)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
