terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 3.0"
    }
  }
}

# Le provider est configuré via les variables d'environnement standard
# OS_AUTH_URL, OS_USERNAME, OS_PASSWORD, etc. (injectées par le worker
# à partir des credentials du CloudProvider choisi).
provider "openstack" {}

resource "openstack_compute_instance_v2" "vm" {
  name      = var.instance_name
  image_id  = var.image_id
  flavor_id = var.flavor_id

  network {
    uuid = var.network_id
  }
}
