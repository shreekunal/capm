sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Fragment, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("project4.controller.View2", {
        onInit: function () {
            const oUIModel = new sap.ui.model.json.JSONModel({
                selectedDepartmentName: "Select Department",
                selectedSuppname: "Select Supplier"
            });
            this.getView().setModel(oUIModel, "ui");
        },

        // Department SelectDialog
        onDeptHelpRequest: function () {
            var oView = this.getView();

            if (!this._pDeptDialog) {
                this._pDeptDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project4.fragment.DepartmentDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDeptDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onDeptSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("departmentName", FilterOperator.Contains, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onDeptDialogClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var sDeptName = oSelectedItem.getTitle();
                this.getView().getModel("ui").setProperty("/selectedDepartmentName", sDeptName);
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

        // Supplier SelectDialog
        onSuppHelpRequest: function () {
            var oView = this.getView();

            if (!this._pSuppDialog) {
                this._pSuppDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project4.fragment.SupplierDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pSuppDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onSuppSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("name", FilterOperator.Contains, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onSuppDialogClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var sSuppName = oSelectedItem.getTitle();
                this.getView().getModel("ui").setProperty("/selectedSuppname", sSuppName);
            }
            oEvent.getSource().getBinding("items").filter([]);
        }
    });
});
