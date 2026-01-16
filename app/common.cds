using CatalogService from '../srv/cat-service';

annotate CatalogService.Products with @(
    UI : { 
        // Filter Bar 
        SelectionFields  : [
            customers_ID
        ],

        // Table Column
        LineItem  : [
            {
                $Type : 'UI.DataField',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Value : description,
            },
            {
                $Type : 'UI.DataField',
                Value : price,
            },
            {
                $Type : 'UI.DataField',
                Value : stock,
            },
        ],

        // Object Page designing
        HeaderInfo  : {
            $Type : 'UI.HeaderInfoType',
            TypeName : 'Product',
            TypeNamePlural : 'Products',
        },

        // Facets
        Facets  : [
            {
                $Type : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#Default',
                ID : 'Default',
                Label : 'General',
            },
            {
                $Type : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#Admin',
                ID : 'AdminData',
                Label : 'administrative Data',
            },
        ],

        // Fieldgroups
        FieldGroup #Default : {
            $Type : 'UI.FieldGroupType',
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : name,
                },
                {
                    $Type : 'UI.DataField',
                    Value : description,
                },
                {
                    $Type : 'UI.DataField',
                    Value : stock,
                },
                {
                    $Type : 'UI.DataField',
                    Value : customers_ID,
                },
            ],
        },

        FieldGroup #Admin : {
            $Type : 'UI.FieldGroupType',
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : createdAt,
                },
                {
                    $Type : 'UI.DataField',
                    Value : createdBy,
                },
                {
                    $Type : 'UI.DataField',
                    Value : modifiedAt,
                },
                {
                    $Type : 'UI.DataField',
                    Value : modifiedBy,
                },
            ],
        },
    },
) {
    name @title : 'Name';
    description @title : 'Description';
    stock @title : 'Stock';
    customers @( 
        title : 'Customer',
        Common : {  
            ValueListWithFixedValues,
            ValueList : {
                $Type : 'Common.ValueListType',
                CollectionPath : 'Customers',
                Label : 'customers',
                Parameters : [
                    {
                        $Type : 'Common.ValueListParameterInOut',
                        LocalDataProperty : customers_ID,
                        ValueListProperty : 'ID',
                    },
                    {
                        $Type : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'name',
                    },
                    {
                        $Type : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'contact',
                    },
                    {
                        $Type : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'email',
                    },
                ],
            },

        }, 
    
    );
};
