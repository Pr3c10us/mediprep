
resource "azurerm_communication_service" "mediprep" {
  name                = "mediprep-communicationservice"
  resource_group_name = azurerm_resource_group.mediprep.name
  data_location       = "United States"
}

resource "azurerm_email_communication_service" "mediprep" {
  name                = "example-emailcommunicationservice"
  resource_group_name = azurerm_resource_group.mediprep.name
  data_location       = "United States"
}