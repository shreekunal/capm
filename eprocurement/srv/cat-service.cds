using my.company.procurement as db from '../db/schema';

service CatalogService {
  entity Suppliers as projection on db.Suppliers;
  entity Departments as projection on db.Departments;
  entity Products as projection on db.Products;
  entity ProcurementRequests as projection on db.ProcurementRequests;
  entity RequestItems as projection on db.RequestItems;
}

annotate CatalogService.Suppliers with @odata.draft.enabled;
annotate CatalogService.Departments with @odata.draft.enabled;
annotate CatalogService.Products with @odata.draft.enabled;
