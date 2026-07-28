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

resource "openstack_networking_secgroup_v2" "lamp" {
  name        = "${var.instance_name}-lamp-sg"
  description = "SSH (22) + HTTP/HTTPS (80/443) pour la stack LAMP"
}

resource "openstack_networking_secgroup_rule_v2" "ssh" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.lamp.id
}

resource "openstack_networking_secgroup_rule_v2" "http" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 80
  port_range_max    = 80
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.lamp.id
}

resource "openstack_networking_secgroup_rule_v2" "https" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 443
  port_range_max    = 443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.lamp.id
}

resource "openstack_compute_instance_v2" "vm" {
  name            = var.instance_name
  image_id        = var.image_id
  flavor_id       = var.flavor_id
  security_groups = [openstack_networking_secgroup_v2.lamp.name]
  user_data       = file("${path.module}/cloud-init.sh")

  network {
    uuid = var.network_id
  }
}
