sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'btpuicap/test/integration/FirstJourney',
		'btpuicap/test/integration/pages/ProductsList',
		'btpuicap/test/integration/pages/ProductsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductsList, ProductsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('btpuicap') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductsList: ProductsList,
					onTheProductsObjectPage: ProductsObjectPage
                }
            },
            opaJourney.run
        );
    }
);