#connection au projet openstack conn = session authentifiee contient token keystone infomaniak
from dotenv import load_dotenv
import openstack

load_dotenv()
conn = openstack.connect()