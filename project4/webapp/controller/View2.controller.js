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
            const oToday = new Date();
            const oUIModel = new sap.ui.model.json.JSONModel({
                selectedDepartmentName: "Select Department",
                selectedSuppname: "Select Supplier",
                requestDate: oToday.toISOString().split("T")[0],
                product: [] // initialize empty product list
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
        },


        onAddProductRow: function () {
            const oModel = this.getView().getModel("ui");
            const aProducts = oModel.getProperty("/product") || [];
        
            aProducts.push({
                productName: "",
                quantity: "",
                unit: "EA" // default unit
            });
        
            oModel.setProperty("/product", aProducts);
        },
        
        onDeleteProductRow: function () {
            const oTable = this.byId("productTable");
            const aSelectedIndices = oTable.getSelectedIndices();
            const oModel = this.getView().getModel("ui");
            let aProducts = oModel.getProperty("/product");
        
            // Remove selected rows
            const aNewList = aProducts.filter(function (item, index) {
                return !oTable.isIndexSelected(index);
            });
        
            oModel.setProperty("/product", aNewList);
            oTable.removeSelections(true);
        },
        
        
        onSubmit: function () {
            const oView = this.getView();
            const oUIModel = oView.getModel("ui");
            const oODataModel = oView.getModel(); // default OData model
        
            const sDepartmentId = oUIModel.getProperty("/selectedDepartmentId");
            const sSupplierId = oUIModel.getProperty("/selectedSupplierId");
            const sRequestDate = oUIModel.getProperty("/requestDate");
            const aProducts = oUIModel.getProperty("/product");
        
            if (!sDepartmentId || !sSupplierId || !sRequestDate || aProducts.length === 0) {
                MessageBox.error("Please fill all required fields and add at least one product.");
                return;
            }
        
            const oNewRequest = {
                department_ID: sDepartmentId,
                supplier_ID: sSupplierId,
                requestDate: sRequestDate,
                status: "New",
                RequestItems: aProducts.map(p => ({
                    productName: p.productName,
                    quantity: parseFloat(p.quantity),
                    unit: p.unit
                }))
            };
        
            oODataModel.create("/ProcurementRequests", oNewRequest, {
                success: () => {
                    MessageToast.show("Request submitted successfully");
                    oUIModel.setProperty("/product", []);
                    // Optionally clear other fields too
                },
                error: (oError) => {
                    MessageBox.error("Submission failed");
                }
            });
        },

        onCancel: function () {
            const oUIModel = this.getView().getModel("ui");
            MessageBox.confirm("Are you sure you want to cancel?", {
                onClose: (sAction) => {
                    if (sAction === "OK") {
                        oUIModel.setProperty("/selectedDepartmentId", "");
                        oUIModel.setProperty("/selectedDepartmentName", "Select Department");
                        oUIModel.setProperty("/selectedSupplierId", "");
                        oUIModel.setProperty("/selectedSuppname", "Select Supplier");
                        oUIModel.setProperty("/product", []);
                    }
                }
            });
        }
        
        
    });
});
