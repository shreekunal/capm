sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
  "use strict";

  return Controller.extend("project4.controller.View2", {

    onInit: function () {
      var oView = this.getView();

      // Initialize JSON Model for UI state
      var oUIModel = new JSONModel({
        selectedDepartment: null,
        selectedSupplier: null,
        requestDate: null,
        requestedBy: "",
        product: []
      });
      oView.setModel(oUIModel, "ui");

      // Load models for value help (optional based on dialogs)
      var oODataModel = this.getOwnerComponent().getModel();

      this._oDeptModel = new JSONModel();
      oODataModel.read("/Departments", {
        success: (oData) => this._oDeptModel.setData(oData.results),
        error: () => MessageBox.error("Failed to load Departments.")
      });

      this._oSupplierModel = new JSONModel();
      oODataModel.read("/Suppliers", {
        success: (oData) => this._oSupplierModel.setData(oData.results),
        error: () => MessageBox.error("Failed to load Suppliers.")
      });

      this._oProductModel = new JSONModel();
      oODataModel.read("/Products", {
        success: (oData) => this._oProductModel.setData(oData.results),
        error: () => MessageBox.error("Failed to load Products.")
      });
    },

    onDepartmentValueHelp: function () {
      // Implementation (if required)
    },

    onSupplierValueHelp: function () {
      // Implementation (if required)
    },

    onProductValueHelp: function (oEvent) {
      // Implementation (if required)
    },

    onAddProductRow: function () {
      var oUIModel = this.getView().getModel("ui");
      var aProducts = oUIModel.getProperty("/product") || [];
      aProducts.push({ productName: "", quantity: null, unit: "" });
      oUIModel.setProperty("/product", aProducts);
    },

    onDeleteProductRow: function () {
      var oTable = this.byId("productTable");
      var aSelectedIndices = oTable.getSelectedIndices();

      if (!aSelectedIndices.length) {
        MessageBox.warning("Please select at least one product to delete.");
        return;
      }

      var oUIModel = this.getView().getModel("ui");
      var aProducts = oUIModel.getProperty("/product") || [];

      aSelectedIndices.sort((a, b) => b - a).forEach(function (idx) {
        aProducts.splice(idx, 1);
      });

      oUIModel.setProperty("/product", aProducts);
      oTable.removeSelections();
    },

    onSubmit: function () {
      var oModel = this.getView().getModel();
      var oUIModel = this.getView().getModel("ui");
      var oData = oUIModel.getData();

      if (!oData.selectedDepartment || !oData.selectedSupplier || !oData.requestDate || !oData.requestedBy) {
        MessageBox.error("Please fill all mandatory fields in General Information.");
        return;
      }

      if (!oData.product.length) {
        MessageBox.error("Please add at least one product.");
        return;
      }

      for (var i = 0; i < oData.product.length; i++) {
        var p = oData.product[i];
        if (!p.productName || !p.quantity || !p.unit) {
          MessageBox.error("All product fields are mandatory.");
          return;
        }
        if (isNaN(p.quantity) || Number(p.quantity) <= 0) {
          MessageBox.error("Quantity must be a positive number.");
          return;
        }
      }

      var oPayload = {
        department: { cuid: oData.selectedDepartment.cuid },
        supplier: { cuid: oData.selectedSupplier.cuid },
        requestDate: oData.requestDate,
        requestedBy: oData.requestedBy,
        status: "New",
        product: oData.product.map(function (p) {
          return {
            productName: p.productName,
            quantity: Number(p.quantity),
            unit: p.unit
          };
        }),
        comments: ""
      };

      oModel.create("/ProcurementRequests", oPayload, {
        success: function () {
          MessageBox.success("Procurement request submitted successfully!");
          oUIModel.setData({
            selectedDepartment: null,
            selectedSupplier: null,
            requestDate: null,
            requestedBy: "",
            product: []
          });
          oModel.refresh(true);
        },
        error: function (oError) {
          MessageBox.error("Failed to submit procurement request: " + (oError.message || "Unknown error"));
        }
      });
    },

    onCancel: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("ListPage");
    }

  });
});
