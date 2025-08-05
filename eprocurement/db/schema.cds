using {
  cuid,
  managed
} from '@sap/cds/common';

namespace my.company.procurement;

entity Suppliers : cuid, managed {
  name             : String(100) @mandatory;
  contactEmail     : String(100) @mandatory;
  phone            : String(30)  @mandatory;
  registrationDate : Date        @mandatory;
  status           : String(20)  @mandatory  @assert.range  enum {
    New;
    Approved;
    Blocked;
  };
  vatNumber        : String(30);
  address          : String(255);
  isApproved       : Boolean default false;
}

entity Departments : cuid, managed {
  departmentName : String(100) @mandatory;
  description    : String(255);
  manager        : String(100) @mandatory;
  costCenter     : String(20)  @mandatory  @assert.range  enum {
    COST1001;
    COST1002;
    COST1003;
    COST1004;
    COST1005;
    COST1006;
    COST1007;
    COST1008;
    COST1009;
    COST1010;
  };
}

entity Products : cuid, managed {
  name        : String(100)    @mandatory;
  description : String(255);
  category    : String(50);
  price       : Decimal(15, 2) @mandatory;
  unit        : String(10)     @mandatory  @assert.range  enum {
    EA;
    BOX;
    KG;
    L;
    M;
    CM;
    PACK;
    SET;
    ROLL;
  };
  isActive    : Boolean default true;
}

entity ProcurementRequests : cuid, managed {
  product     : Composition of many RequestItems
                  on product.parent = $self;
  department  : Association to Departments;
  supplier    : Association to Suppliers;
  quantity    : Integer;
  requestedBy : String(100);
  requestDate : Date;
  status      : String(20) @assert.range enum {
    New;
    Submitted;
    Approved;
    Ordered;
    Received;
  };
  comments    : String(255);
}

entity RequestItems : cuid {
  parent      : Association to ProcurementRequests;
  productName : String;
  quantity    : Decimal;
  unit        : String;
}
