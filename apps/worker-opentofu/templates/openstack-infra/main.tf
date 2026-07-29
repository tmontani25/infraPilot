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
  for_each  = { for m in var.machines : m.name => m }
  name      = each.value.name
  image_id  = each.value.image_id
  flavor_id = each.value.flavor_id

  network {
    uuid = each.value.network_id
  }
}
