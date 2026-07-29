"""Clé SSH utilisée pour se connecter aux VMs cibles. Contrairement aux workers
OpenStack/OpenTofu (credentials par CloudProvider, transmises à chaque requête),
Ansible a besoin d'une clé privée locale sur le disque de ce worker — configurée
une fois via .env, elle doit correspondre à une keypair OpenStack installée sur
les VMs cibles."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SSH_KEY_PATH = os.getenv("ANSIBLE_SSH_PRIVATE_KEY_PATH", str(Path.home() / ".ssh" / "id_rsa"))
