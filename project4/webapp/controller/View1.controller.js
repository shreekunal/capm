sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("project4.controller.View1", {

        onInit: function () {
            // Initialization logic, if any
        },

        onApplyFilter: function () {
            const oView = this.getView();
            const oTable = oView.byId("requestTable");
            const oBinding = oTable.getBinding("items");

            const sDept = oView.byId("filterDepartment").getValue();
            const sSupp = oView.byId("filterSupplier").getValue();
            const sStatus = oView.byId("filterStatus").getSelectedKey();

            const aFilters = [];

            if (sDept) {
                aFilters.push(new Filter("department/departmentName", FilterOperator.Contains, sDept));
            }

            if (sSupp) {
                aFilters.push(new Filter("supplier/name", FilterOperator.Contains, sSupp));
            }

            if (sStatus) {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onCreateRequest: function () {
            // Logic to open a create dialog or navigate to create screen
            sap.m.MessageToast.show("Create Request clicked");
        },

        onRequestPress: function (oEvent) {
            // Optional: navigate to details view for selected item
            const oContext = oEvent.getSource().getBindingContext();
            const sRequestId = oContext.getProperty("ID");

            // Example: navigate to View2 with request ID
            this.getOwnerComponent().getRouter().navTo("View2", {
                requestId: sRequestId
            });
        },

        onNavigateToView2: function () {
            this.getOwnerComponent().getRouter().navTo("View2");
        }

    });
});
