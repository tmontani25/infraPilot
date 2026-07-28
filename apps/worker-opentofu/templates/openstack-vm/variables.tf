variable "instance_name" {
  type        = string
  description = "Nom de la VM"
}

variable "image_id" {
  type        = string
  description = "ID de l'image OpenStack"
}

variable "flavor_id" {
  type        = string
  description = "ID du flavor OpenStack"
}

variable "network_id" {
  type        = string
  description = "ID du réseau OpenStack"
}
