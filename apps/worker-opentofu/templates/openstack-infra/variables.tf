variable "machines" {
  type = list(object({
    name       = string
    image_id   = string
    flavor_id  = string
    network_id = string
  }))
  description = "Liste des machines à créer, chacune avec ses propres caractéristiques"
}
