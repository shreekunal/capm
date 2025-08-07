sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
  ], function(Controller, ValueHelpDialog, MessageBox, JSONModel) {
    "use strict";
  
    return Controller.extend("project4.controller.View2", {
      onInit: function() {
        // Initialize JSON model with empty or sample data
        var oData = {
          departmentName: "",
          supplierName: "",
          requestDate: "",
          requestedBy: "",
          ProductList: [],               // Editable product rows for current request
          ProcurementRequests: [         // List of all procurement requests (mock/sample data)
            // Sample data - replace with OData fetch logic in real apps
            {
              cuid: "PR001",
              department: { departmentName: "IT" },
              supplier: { name: "Supplier A" },
              requestDate: "2025-08-01",
              status: "New"
            },
            {
              cuid: "PR002",
              department: { departmentName: "Finance" },
              supplier: { name: "Supplier B" },
              requestDate: "2025-08-05",
              status: "Submitted"
            }
          ]
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel);
  
        // Initialize value help models (mock)
        this._oDeptModel = new JSONModel([
          { cuid: "D001", departmentName: "IT" },
          { cuid: "D002", departmentName: "Finance" },
          { cuid: "D003", departmentName: "HR" }
        ]);
        this._oSupplierModel = new JSONModel([
          { cuid: "S001", name: "Supplier A" },
          { cuid: "S002", name: "Supplier B" }
        ]);
        this._oProductModel = new JSONModel([
          { cuid: "P001", name: "Monitor" },
          { cuid: "P002", name: "Keyboard" },
          { cuid: "P003", name: "Mouse" }
        ]);
      },
  
      // Department Value Help Dialog
      onDepartmentValueHelp: function() {
        var that = this;
        if (!this._oDeptVHD) {
          this._oDeptVHD = new ValueHelpDialog({
            title: "Select Department",
            supportMultiselect: false,
            key: "cuid",
            descriptionKey: "departmentName",
            ok: function(evt) {
              var tokens = evt.getParameter("tokens");
              if (tokens.length > 0) {
                that.getView().getModel().setProperty("/departmentName", tokens[0].getText());
              }
              that._oDeptVHD.close();
            },
            cancel: function() {
              that._oDeptVHD.close();
            }
          });
          this._oDeptVHD.setModel(this._oDeptModel);
          this._oDeptVHD.getTable().bindRows("/");
        }
        this._oDeptVHD.open();
      },
  
      // Supplier Value Help Dialog
      onSupplierValueHelp: function() {
        var that = this;
        if (!this._oSuppVHD) {
          this._oSuppVHD = new ValueHelpDialog({
            title: "Select Supplier",
            supportMultiselect: false,
            key: "cuid",
            descriptionKey: "name",
            ok: function(evt) {
              var tokens = evt.getParameter("tokens");
              if (tokens.length > 0) {
                that.getView().getModel().setProperty("/supplierName", tokens[0].getText());
              }
              that._oSuppVHD.close();
            },
            cancel: function() {
              that._oSuppVHD.close();
            }
          });
          this._oSuppVHD.setModel(this._oSupplierModel);
          this._oSuppVHD.getTable().bindRows("/");
        }
        this._oSuppVHD.open();
      },
  
      // Product Value Help Dialog (for product table rows)
      onProductValueHelp: function(oEvent) {
        var oInput = oEvent.getSource();
        var that = this;
  
        if (!this._oProdVHD) {
          this._oProdVHD = new ValueHelpDialog({
            title: "Select Product",
            supportMultiselect: false,
            key: "cuid",
            descriptionKey: "name",
            ok: function(evt) {
              var tokens = evt.getParameter("tokens");
              if (tokens.length > 0) {
                oInput.setValue(tokens[0].getText());
              }
              that._oProdVHD.close();
            },
            cancel: function() {
              that._oProdVHD.close();
            }
          });
          this._oProdVHD.setModel(this._oProductModel);
          this._oProdVHD.getTable().bindRows("/");
        }
        this._oProdVHD.open();
      },
  
      // Add new blank product row
      onAddProductRow: function() {
        var oModel = this.getView().getModel();
        var aProducts = oModel.getProperty("/ProductList") || [];
        aProducts.push({ ProductName: "", Quantity: "", Unit: "" });
        oModel.setProperty("/ProductList", aProducts);
      },
  
      // Delete selected rows from product table
      onDeleteProductRow: function() {
        var oTable = this.byId("productTable");
        var aSelectedIndices = oTable.getSelectedIndices();
  
        if (!aSelectedIndices.length) {
          MessageBox.warning("Please select at least one product to delete.");
          return;
        }
  
        var oModel = this.getView().getModel();
        var aProducts = oModel.getProperty("/ProductList") || [];
  
        // Remove by descending index to avoid shift problems
        aSelectedIndices.sort(function(a, b) { return b - a; }).forEach(function(i) {
          aProducts.splice(i, 1);
        });
        oModel.setProperty("/ProductList", aProducts);
        oTable.removeSelections();
      },
  
      // Submit button handler: validate and (simulate) save
      onSubmit: function() {
        var oModel = this.getView().getModel();
        var oData = oModel.getData();
  
        // Basic validation
        if (!oData.departmentName || !oData.supplierName || !oData.requestDate || !oData.requestedBy) {
          MessageBox.error("Please fill all mandatory fields in General Information.");
          return;
        }
        if (!oData.ProductList.length) {
          MessageBox.error("Please add at least one product.");
          return;
        }
        for (var i = 0; i < oData.ProductList.length; i++) {
          var p = oData.ProductList[i];
          if (!p.ProductName || !p.Quantity || !p.Unit) {
            MessageBox.error("All product fields are mandatory.");
            return;
          }
          if (isNaN(p.Quantity) || Number(p.Quantity) <= 0) {
            MessageBox.error("Quantity must be a positive number.");
            return;
          }
        }
  
        // TODO: Implement backend OData create/update call here
  
        MessageBox.success("Procurement request submitted successfully!");
  
        // Optionally clear the form and product list after submit
        oModel.setData({
          departmentName: "",
          supplierName: "",
          requestDate: "",
          requestedBy: "",
          ProductList: [],
          ProcurementRequests: oData.ProcurementRequests || []
        });
      },
  
      // Cancel button handler: navigate back to list or previous page
      onCancel: function() {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("ListPage"); // Change ListPage to your actual route name
      },
  
      // Handler when user selects a procurement request from the All Requests table
      onRequestSelect: function(oEvent) {
        var oCtx = oEvent.getSource().getBindingContext();
        var oSelectedRequest = oCtx.getObject();
  
        // For example, update current form data with selected procurement request details
        var oModel = this.getView().getModel();
  
        // Assuming your current form is bound to flat properties like departmentName, supplierName etc,
        // you may need to map association property names accordingly:
  
        oModel.setProperty("/departmentName", oSelectedRequest.department?.departmentName || "");
        oModel.setProperty("/supplierName", oSelectedRequest.supplier?.name || "");
        oModel.setProperty("/requestDate", oSelectedRequest.requestDate || "");
        oModel.setProperty("/requestedBy", oSelectedRequest.requestedBy || "");
  
        // Load product list if available (assuming in requestItems or product)
        // For mock/demo: Clear or add an empty array
        oModel.setProperty("/ProductList", oSelectedRequest.product || []);
      }
  
    });
  });
  