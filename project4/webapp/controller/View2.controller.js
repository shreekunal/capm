sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Fragment, MessageToast, MessageBox, Filter, FilterOperator) {
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
                var sDeptId = oSelectedItem.getBindingContext().getProperty("ID"); // assuming property is ID
        
                const oUIModel = this.getView().getModel("ui");
                oUIModel.setProperty("/selectedDepartmentName", sDeptName);
                oUIModel.setProperty("/selectedDepartmentId", sDeptId);
            }
            oEvent.getSource().getBinding("items").filter([]);
        }
        ,

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
                var sSuppId = oSelectedItem.getBindingContext().getProperty("ID"); // assuming property is ID
        
                const oUIModel = this.getView().getModel("ui");
                oUIModel.setProperty("/selectedSuppname", sSuppName);
                oUIModel.setProperty("/selectedSupplierId", sSuppId);
            }
            oEvent.getSource().getBinding("items").filter([]);
        }
        ,


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
            const aSelectedItems = oTable.getSelectedItems();
            const oModel = this.getView().getModel("ui");
            let aProducts = oModel.getProperty("/product");

            // Remove selected rows based on binding context
            const aNewList = aProducts.filter(function (item, index) {
                const oItem = oTable.getItems()[index];
                return !aSelectedItems.includes(oItem);
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
            
            // Step 1: Create ProcurementRequest
            const oNewRequest = {
                department_ID: sDepartmentId,
                supplier_ID: sSupplierId,
                requestDate: sRequestDate,
                status: "New"
            };
        
            oODataModel.create("/ProcurementRequests", oNewRequest, {
                success: (oCreatedRequest) => {
                    const requestId = oCreatedRequest.ID;
        
                    // Step 2: Create each RequestItem
                    let pending = aProducts.length;
                    if (pending === 0) return;
        
                    aProducts.forEach(p => {
                        const oItem = {
                            parent_ID: requestId,  // or parent: requestId based on your OData model handling
                            productName: p.productName,
                            quantity: parseFloat(p.quantity),
                            unit: p.unit
                        };
                        if (!p.productName || isNaN(parseFloat(p.quantity))) {
                            MessageBox.error("Each product must have a valid name and quantity.");
                            return;
                        }
                        oODataModel.create("/RequestItems", oItem, {
                            success: () => {
                                pending--;
                                if (pending === 0) {
                                    MessageToast.show("Request submitted successfully");
                                    oUIModel.setProperty("/product", []);
                                }
                            },
                            error: () => {
                                MessageBox.error("Failed to create one or more request items.");
                            }
                        });
                    });
                },
                error: () => {
                    MessageBox.error("Submission failed. Could not create Procurement Request.");
                }
            });
        }
        ,

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
