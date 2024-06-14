resource "azuread_application" "mediprep" {
  display_name = "mediprep"
}

resource "azuread_service_principal" "mediprep" {
  client_id = azuread_application.mediprep.client_id
}

resource "azuread_service_principal_password" "mediprep" {
  service_principal_id = azuread_service_principal.mediprep.id
}

resource "azurerm_role_assignment" "mediprep" {
  scope                = azurerm_resource_group.mediprep.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.mediprep.id
}