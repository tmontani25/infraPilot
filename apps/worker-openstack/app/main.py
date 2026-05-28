from fastapi import FastAPI
from app.routes import vms, volumes, resources, health, project
from app.error_handler import register_error_handlers

app = FastAPI()

register_error_handlers(app)

app.include_router(vms.router)
app.include_router(volumes.router)
app.include_router(resources.router)
app.include_router(health.router)
app.include_router(project.router)
