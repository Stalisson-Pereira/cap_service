using cap.management as my from '../db/schema';

@path: 'service/cap'
service CatalogService {
    entity Products as projection on my.Products;
    annotate Products with @odata.draft.enabled;
    entity Customers as projection on my.Customers;
    annotate Customers with @odata.draft.enabled;
}

@path: 'service/cap-nodraft'
service CatalogServiceNoDraft {
    entity Products as projection on my.Products;
    entity Customers as projection on my.Customers;
}
