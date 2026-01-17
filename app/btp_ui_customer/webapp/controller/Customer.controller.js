sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("btpuicustomer.controller.Customer", {

        onInit: function () {
            const oInputData = {
                newCustomer: {
                    name: "",
                    contact: "",
                    email: ""
                },
                newProduct: {
                    name: "",
                    description: "",
                    price: null,
                    stock: null
                }
            };
            this.getView().setModel(new JSONModel(oInputData), "inputModel");

            this.getView().setModel(new JSONModel({
                customerSelected: false,
                productSelected: false,
                isEditingCustomer: false,
                isEditingProduct: false
            }), "uiModel");

            this._selectedCustomerContext = null;
            this._selectedProductContext = null;
        },

        onRegisterCustomer: function () {
            this._clearForm("newCustomer");
            const oDialog = this.byId("idDialogCustomer");
            this._setCustomerDialogMode(false);
            if (oDialog) oDialog.open();
        },

        onRegisterProduct: function () {
            this._clearForm("newProduct");
            const oDialog = this.byId("idDialogProduct");
            this._setProductDialogMode(false);
            if (oDialog) oDialog.open();
        },

        onCloseDialogCustomer: function () {
            const oDialog = this.byId("idDialogCustomer");
            if (oDialog) oDialog.close();
            this._setCustomerDialogMode(false);
        },

        onCloseDialogProduct: function () {
            const oDialog = this.byId("idDialogProduct");
            if (oDialog) oDialog.close();
            this._setProductDialogMode(false);
        },

        onCustomerSelectionChange: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const bSelected = oEvent.getParameter("selected");
            this._selectedCustomerContext = bSelected && oItem ? oItem.getBindingContext() : null;
            this.getView().getModel("uiModel").setProperty("/customerSelected", !!this._selectedCustomerContext);
        },

        onProductSelectionChange: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const bSelected = oEvent.getParameter("selected");
            this._selectedProductContext = bSelected && oItem ? oItem.getBindingContext() : null;
            this.getView().getModel("uiModel").setProperty("/productSelected", !!this._selectedProductContext);
        },

        onSearchCustomer: function (oEvent) {
            const sQuery = (oEvent.getParameter("query") || "").trim();
            const oTable = this.byId("idTableCustomers");
            if (!oTable) return;
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;
            const aFilters = sQuery ? [new Filter("name", FilterOperator.Contains, sQuery)] : [];
            oBinding.filter(aFilters);
        },

        onSearchProduct: function (oEvent) {
            const sQuery = (oEvent.getParameter("query") || "").trim();
            const oTable = this.byId("idTableProducts");
            if (!oTable) return;
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;
            const aFilters = sQuery ? [new Filter("name", FilterOperator.Contains, sQuery)] : [];
            oBinding.filter(aFilters);
        },

        onSaveDialogCustomer: function () {
            if (this.getView().getModel("uiModel").getProperty("/isEditingCustomer")) {
                this._updateCustomer();
                return;
            }
            this._saveEntity({
                path: "/Customers",
                modelProperty: "newCustomer",
                groupId: "customerGroup",
                successMsg: "customerRegisteredSuccess",
                errorMsg: "customerRegisteredError",
                dialogId: "idDialogCustomer"
            });
        },

        onSaveDialogProduct: function () {
            if (this.getView().getModel("uiModel").getProperty("/isEditingProduct")) {
                this._updateProduct();
                return;
            }
            this._saveEntity({
                path: "/Products",
                modelProperty: "newProduct",
                groupId: "productGroup",
                successMsg: "productRegisteredSuccess",
                errorMsg: "productRegisteredError",
                dialogId: "idDialogProduct"
            });
        },

        onEditCustomer: function () {
            if (!this._selectedCustomerContext) return;
            const oData = this._selectedCustomerContext.getObject() || {};
            this.getView().getModel("inputModel").setProperty("/newCustomer", {
                name: oData.name || "",
                contact: oData.contact || "",
                email: oData.email || ""
            });
            this._setCustomerDialogMode(true);
            const oDialog = this.byId("idDialogCustomer");
            if (oDialog) oDialog.open();
        },

        onEditProduct: function () {
            if (!this._selectedProductContext) return;
            const oData = this._selectedProductContext.getObject() || {};
            this.getView().getModel("inputModel").setProperty("/newProduct", {
                name: oData.name || "",
                description: oData.description || "",
                price: oData.price ?? null,
                stock: oData.stock ?? null
            });
            this._setProductDialogMode(true);
            const oDialog = this.byId("idDialogProduct");
            if (oDialog) oDialog.open();
        },

        onDeleteCustomer: function () {
            if (!this._selectedCustomerContext) return;
            MessageBox.confirm("Deseja remover este cliente?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) return;
                    this._deleteCustomer();
                }.bind(this)
            });
        },

        onDeleteProduct: function () {
            if (!this._selectedProductContext) return;
            MessageBox.confirm("Deseja remover este produto?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) return;
                    this._deleteProduct();
                }.bind(this)
            });
        },

        _saveEntity: function (oParams) {
            const oView = this.getView();
            const oODataModel = oView.getModel();
            const oInputModel = oView.getModel("inputModel");
            const oNewData = oInputModel.getProperty("/" + oParams.modelProperty);
            const oPayload = { ...oNewData };
            const oResourceBundle = oView.getModel("i18n").getResourceBundle();

            if (oParams.modelProperty === "newProduct") {
                this._normalizeProductPayload(oPayload);
            }

            // Create new entry using bindList.create (OData V4 standard)
            // We use a temporary list binding for creation
            const oListBinding = oODataModel.bindList(oParams.path, null, [], [], { $$updateGroupId: oParams.groupId });
            
            const oCreatedContext = oListBinding.create(oPayload);

            oODataModel.submitBatch(oParams.groupId)
                .then(function () {
                    return oCreatedContext.created();
                })
                .then(function () {
                    MessageToast.show(oResourceBundle.getText(oParams.successMsg));
                    
                    // Clear form
                    this._clearForm(oParams.modelProperty);
                    
                    const oTable = this.byId(oParams.modelProperty === "newCustomer" ? "idTableCustomers" : "idTableProducts");
                    const oBinding = oTable && oTable.getBinding("items");
                    if (oBinding && oBinding.refresh) oBinding.refresh();

                    // Close dialog
                    const oDialog = this.byId(oParams.dialogId);
                    if (oDialog) {
                        oDialog.close();
                    } else {
                        // Fallback message if dialog not found, though unlikely if ID is correct
                        console.warn(oResourceBundle.getText("dialogNotFound"));
                    }
                }.bind(this))
                .catch(function () {
                    MessageToast.show(oResourceBundle.getText(oParams.errorMsg));
                });
        },

        _updateCustomer: function () {
            if (!this._selectedCustomerContext) return;
            const oView = this.getView();
            const oODataModel = oView.getModel();
            const oInputModel = oView.getModel("inputModel");
            const oResourceBundle = oView.getModel("i18n").getResourceBundle();
            const oPayload = oInputModel.getProperty("/newCustomer");
            const oContext = this._selectedCustomerContext;

            oContext.setProperty("name", oPayload.name);
            oContext.setProperty("contact", oPayload.contact);
            oContext.setProperty("email", oPayload.email);

            oODataModel.submitBatch("customerGroup")
                .then(function () {
                    MessageToast.show(oResourceBundle.getText("customerRegisteredSuccess"));
                    this._setCustomerDialogMode(false);
                    this._clearForm("newCustomer");
                    const oTable = this.byId("idTableCustomers");
                    const oBinding = oTable && oTable.getBinding("items");
                    if (oBinding && oBinding.refresh) oBinding.refresh();
                    if (oTable) oTable.removeSelections(true);
                    this._selectedCustomerContext = null;
                    oView.getModel("uiModel").setProperty("/customerSelected", false);
                    const oDialog = this.byId("idDialogCustomer");
                    if (oDialog) oDialog.close();
                }.bind(this))
                .catch(function () {
                    MessageToast.show(oResourceBundle.getText("customerRegisteredError"));
                });
        },

        _updateProduct: function () {
            if (!this._selectedProductContext) return;
            const oView = this.getView();
            const oODataModel = oView.getModel();
            const oInputModel = oView.getModel("inputModel");
            const oResourceBundle = oView.getModel("i18n").getResourceBundle();
            const oPayload = { ...oInputModel.getProperty("/newProduct") };
            this._normalizeProductPayload(oPayload);
            const oContext = this._selectedProductContext;

            oContext.setProperty("name", oPayload.name);
            oContext.setProperty("description", oPayload.description);
            oContext.setProperty("price", oPayload.price);
            oContext.setProperty("stock", oPayload.stock);

            oODataModel.submitBatch("productGroup")
                .then(function () {
                    MessageToast.show(oResourceBundle.getText("productRegisteredSuccess"));
                    this._setProductDialogMode(false);
                    this._clearForm("newProduct");
                    const oTable = this.byId("idTableProducts");
                    const oBinding = oTable && oTable.getBinding("items");
                    if (oBinding && oBinding.refresh) oBinding.refresh();
                    if (oTable) oTable.removeSelections(true);
                    this._selectedProductContext = null;
                    oView.getModel("uiModel").setProperty("/productSelected", false);
                    const oDialog = this.byId("idDialogProduct");
                    if (oDialog) oDialog.close();
                }.bind(this))
                .catch(function () {
                    MessageToast.show(oResourceBundle.getText("productRegisteredError"));
                });
        },

        _deleteCustomer: function () {
            if (!this._selectedCustomerContext) return;
            const oView = this.getView();
            const oODataModel = oView.getModel();
            const oResourceBundle = oView.getModel("i18n").getResourceBundle();
            const oContext = this._selectedCustomerContext;

            oContext.delete();
            oODataModel.submitBatch("customerGroup")
                .then(function () {
                    MessageToast.show("Cliente removido com sucesso!");
                    const oTable = this.byId("idTableCustomers");
                    const oBinding = oTable && oTable.getBinding("items");
                    if (oBinding && oBinding.refresh) oBinding.refresh();
                    if (oTable) oTable.removeSelections(true);
                    this._selectedCustomerContext = null;
                    oView.getModel("uiModel").setProperty("/customerSelected", false);
                }.bind(this))
                .catch(function () {
                    MessageToast.show(oResourceBundle.getText("customerRegisteredError"));
                });
        },

        _deleteProduct: function () {
            if (!this._selectedProductContext) return;
            const oView = this.getView();
            const oODataModel = oView.getModel();
            const oResourceBundle = oView.getModel("i18n").getResourceBundle();
            const oContext = this._selectedProductContext;

            oContext.delete();
            oODataModel.submitBatch("productGroup")
                .then(function () {
                    MessageToast.show("Produto removido com sucesso!");
                    const oTable = this.byId("idTableProducts");
                    const oBinding = oTable && oTable.getBinding("items");
                    if (oBinding && oBinding.refresh) oBinding.refresh();
                    if (oTable) oTable.removeSelections(true);
                    this._selectedProductContext = null;
                    oView.getModel("uiModel").setProperty("/productSelected", false);
                }.bind(this))
                .catch(function () {
                    MessageToast.show(oResourceBundle.getText("productRegisteredError"));
                });
        },

        _setCustomerDialogMode: function (bEditing) {
            const oView = this.getView();
            oView.getModel("uiModel").setProperty("/isEditingCustomer", !!bEditing);
            const oDialog = this.byId("idDialogCustomer");
            if (!oDialog) return;
            oDialog.setTitle(bEditing ? "Edit Customer" : "Register Customer");
            const oBeginButton = oDialog.getBeginButton();
            if (oBeginButton) oBeginButton.setText(bEditing ? "Update" : "Save");
        },

        _setProductDialogMode: function (bEditing) {
            const oView = this.getView();
            oView.getModel("uiModel").setProperty("/isEditingProduct", !!bEditing);
            const oDialog = this.byId("idDialogProduct");
            if (!oDialog) return;
            oDialog.setTitle(bEditing ? "Edit Product" : "Register Product");
            const oBeginButton = oDialog.getBeginButton();
            if (oBeginButton) oBeginButton.setText(bEditing ? "Update" : "Save");
        },

        _normalizeProductPayload: function (oPayload) {
            if (typeof oPayload.price === "string") {
                const nPrice = parseFloat(oPayload.price.replace(",", "."));
                oPayload.price = Number.isFinite(nPrice) ? nPrice : null;
            }
            if (typeof oPayload.stock === "string") {
                const nStock = parseInt(oPayload.stock, 10);
                oPayload.stock = Number.isFinite(nStock) ? nStock : null;
            }
        },

        _clearForm: function(sModelProperty) {
            const oInputModel = this.getView().getModel("inputModel");
            if (sModelProperty === "newCustomer") {
                oInputModel.setProperty("/newCustomer", {
                    name: "",
                    contact: "",
                    email: ""
                });
            } else if (sModelProperty === "newProduct") {
                oInputModel.setProperty("/newProduct", {
                    name: "",
                    description: "",
                    price: null,
                    stock: null
                });
            }
        }
    });
});
