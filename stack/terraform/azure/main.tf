terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "3.107.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "mediprep" {
  name = "mediprep-resources"
  location = "West Europe"
}

data "azurerm_client_config" "mediprep" {
}