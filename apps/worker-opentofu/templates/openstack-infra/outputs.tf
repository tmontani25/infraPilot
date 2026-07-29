output "instance_ids" {
  value = { for k, v in openstack_compute_instance_v2.vm : k => v.id }
}

output "instance_statuses" {
  value = { for k, v in openstack_compute_instance_v2.vm : k => v.power_state }
}
