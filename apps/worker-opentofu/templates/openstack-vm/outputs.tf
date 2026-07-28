output "instance_id" {
  value = openstack_compute_instance_v2.vm.id
}

output "instance_status" {
  value = openstack_compute_instance_v2.vm.power_state
}
