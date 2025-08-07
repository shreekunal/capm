sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("project4.controller.View1", {
        onInit: function () {
            // Optional init logic
        },

        onNavigateToView2: function () {
            // Show toast message
            MessageToast.show("Navigating to View 2...");

            // Navigate to View2
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView2");
        }
    });
});
