output "client_id" {
  value = azuread_application.mediprep.client_id
}

output "client_secret" {
  value = azuread_service_principal_password.mediprep.value
  sensitive = true
}

output "tenant_id" {
  value = data.azurerm_client_config.mediprep.tenant_id
}