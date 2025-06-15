provider "azurerm" {
  features {}

  subscription_id = "a6f44485-53c8-422a-ac6f-44de3af88f97"
  tenant_id       = "efe9a2c7-0d9d-473a-9de0-dc9db6406318"
}

resource "azurerm_resource_group" "chatbot_rg" {
  name     = "${var.unique_resource_id_prefix}-rg-chatbot"
  location = var.location
}

resource "azurerm_log_analytics_workspace" "chatbot_log_analytics_workspace" {
  name                = "${var.unique_resource_id_prefix}-log-analytics-chatbot"
  location            = azurerm_resource_group.chatbot_rg.location
  resource_group_name = azurerm_resource_group.chatbot_rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "chatbot_env" {
  name                       = "${var.unique_resource_id_prefix}-cae-chatbot"
  location                   = azurerm_resource_group.chatbot_rg.location
  resource_group_name        = azurerm_resource_group.chatbot_rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.chatbot_log_analytics_workspace.id

  depends_on = [azurerm_log_analytics_workspace.chatbot_log_analytics_workspace]
}

resource "azurerm_container_registry" "chatbot_acr" {
  name                = "${var.unique_resource_id_prefix}chatbotacr"
  resource_group_name = azurerm_resource_group.chatbot_rg.name
  location            = azurerm_resource_group.chatbot_rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app" "chatbot_ca_docker_hub" {
  name                         = "${var.unique_resource_id_prefix}-chatbot-ca-dh"
  resource_group_name          = azurerm_resource_group.chatbot_rg.name
  container_app_environment_id = azurerm_container_app_environment.chatbot_env.id
  revision_mode                = "Single"

  secret {
    name  = "dockerhub-password"
    value = var.docker_hub_password
  }

  registry {
    server               = "docker.io"
    username             = var.docker_hub_username
    password_secret_name = "dockerhub-password"
  }

  template {
    container {
      name   = "chatbot"
      image  = "docker.io/${var.docker_hub_username}/task-7:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "CONTAINER_REGISTRY"
        value = "Docker Hub"
      }
    }
  }

  ingress {
    external_enabled           = true
    target_port                = 3000
    allow_insecure_connections = false

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

resource "azurerm_container_app" "chatbot_ca_docker_acr" {
  name                         = "${var.unique_resource_id_prefix}-chatbot-ca-acr"
  resource_group_name          = azurerm_resource_group.chatbot_rg.name
  container_app_environment_id = azurerm_container_app_environment.chatbot_env.id
  revision_mode                = "Single"

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.chatbot_acr.admin_password
  }

  registry {
    server               = azurerm_container_registry.chatbot_acr.login_server
    username             = azurerm_container_registry.chatbot_acr.admin_username
    password_secret_name = "acr-password"
  }

  template {
    container {
      name   = "chatbot"
      image  = "${azurerm_container_registry.chatbot_acr.login_server}/task-7:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "CONTAINER_REGISTRY"
        value = "Azure Container Registry"
      }
    }
  }

  ingress {
    external_enabled           = true
    target_port                = 3000
    allow_insecure_connections = false

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  depends_on = [azurerm_container_registry.chatbot_acr]
}
