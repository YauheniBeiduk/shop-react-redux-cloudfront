variable "unique_resource_id_prefix" {
  type        = string
  description = "Уникальный префикс для ресурсов"
}

variable "docker_hub_username" {
  type        = string
  description = "Имя пользователя Docker Hub"
}

variable "docker_hub_password" {
  type        = string
  sensitive   = true
  description = "Пароль Docker Hub"
}

variable "location" {
  type        = string
  default     = "East US"
  description = "Регион для ресурсов"
}


variable "chatbot_container_name" {
  type        = string
  description = "Имя контейнера"
  default     = "task-7"
}

variable "chatbot_container_tag_dh" {
  type        = string
  description = "Тег образа Docker Hub"
  default     = "latest"
}

variable "chatbot_container_tag_acr" {
  type        = string
  description = "Тег образа ACR"
  default     = "latest"
}

variable "docker_hub_registry_name" {
  type = string
  description = "Docker Hub registry name"
}