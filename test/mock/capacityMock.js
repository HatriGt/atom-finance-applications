module.exports = [
    {
        request: {
            'method': 'GET',
            'path': `/v2/capacity-new-srv/Stamps?$select=ID,STAMP_NAME,ItsPoolUWY%2FUWYEAR,ItsPoolUWY%2FPOOLUWY_NAME,ItsPoolUWY%2FINCEPTION,ItsPoolUWY%2FEXPIRYDATE,ItsPoolUWY%2FItsPool%2FPOOL_NAME,ItsPoolUWY%2FItsPool%2FPOOL_CD,ItsPoolUWY%2FItsPool%2FItsLob%2FLOB_NAME&$expand=ItsPoolUWY,ItsPoolUWY%2FItsPool,ItsPoolUWY%2FItsPool%2FItsLob&$filter=(ID%20eq%2026362)`
        },
        response: {
            'statusCode': 200,
            'body': JSON.stringify(
                {
                    "d": {
                        "results": [
                            {
                                "ID": 26362,
                                "STAMP_NAME": "2022_GA_Sirius_Stamp",
                                "ItsPoolUWY": {
                                    "ID": 103,
                                    "UWYEAR": 2022,
                                    "POOLUWY_NAME": "PA22",
                                    "INCEPTION": "/Date(1646092800000)/",
                                    "EXPIRYDATE": "/Date(1677542400000)/",
                                    "ItsPool": {
                                        "ID": 1,
                                        "POOL_NAME": "Pool A",
                                        "POOL_CD": "A",
                                        "ItsLob": {
                                            "ID": 1,
                                            "LOB_NAME": "Aviation",
                                            "__metadata": {
                                                "type": "atom.srv.cap_v2.CapcityService.LinesOfBusiness",
                                                "uri": "https://adev02-adev01-dev-dev-capacity-management-router.cfapps.eu10-004.hana.ondemand.com/v2/capacity-new-srv/LinesOfBusiness(1)"
                                            }
                                        },
                                        "__metadata": {
                                            "type": "atom.srv.cap_v2.CapcityService.Pools",
                                            "uri": "https://adev02-adev01-dev-dev-capacity-management-router.cfapps.eu10-004.hana.ondemand.com/v2/capacity-new-srv/Pools(1)"
                                        }
                                    },
                                    "__metadata": {
                                        "type": "atom.srv.cap_v2.CapcityService.PoolUWYears",
                                        "uri": "https://adev02-adev01-dev-dev-capacity-management-router.cfapps.eu10-004.hana.ondemand.com/v2/capacity-new-srv/PoolUWYears(103)"
                                    }
                                },
                                "__metadata": {
                                    "type": "atom.srv.cap_v2.CapcityService.Stamps",
                                    "uri": "https://adev02-adev01-dev-dev-capacity-management-router.cfapps.eu10-004.hana.ondemand.com/v2/capacity-new-srv/Stamps(26362)"
                                }
                            }
                        ]
                    }
                } )
        }
    }
];