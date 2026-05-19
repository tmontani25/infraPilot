#connection au projet openstack conn = session authentifiee contient token keystone

from dotenv import load_dotenv
import openstack

load_dotenv()
conn = openstack.connect()