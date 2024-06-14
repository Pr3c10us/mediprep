output "client_id" {
  value = azuread_application.mediprep.application_id
}

output "client_secret" {
  value = azuread_service_principal_password.mediprep.value
}

output "tenant_id" {
  value = data.azurerm_client_config.mediprep.tenant_id
}