from fastapi import FastAPI
from app.routes import playbooks, runs
from app.error_handler import register_error_handlers

app = FastAPI()

register_error_handlers(app)

app.include_router(playbooks.router)
app.include_router(runs.router)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
