module.exports = [
    {
      request: {
        'method': 'GET',
        'path': `/v2/dealmgmt-srv/InternalReferencesWithAttributes`
      },
      response: {
        'statusCode': 200,
        'body': JSON.stringify(
            {
                "d": {
                    "results": [
                        {
                            "PK_ID": "aaa",
                            "PARENT_ID": "0",
                            "INTERNAL_REFERENCE_NO": "11000069524148304-001",
                            "LINE_SIZE_VL": "10",
                            "PREMIUM_SPLIT_VL": "50",
                            "EXTERNAL_REFERENCE_NO": null,
                            "SECTION_PK_ID": 252,
                            "EXTREF_PK_ID": null,
                            "PARTICIPATION_PK_ID": null,
                            "DEAL_PK_ID": null,
                            "DEAL_NAME": null,
                            "SUBMISSION_ID": null,
                            "UMR_NO": null,
                            "LOB_ID": 1,
                            "LOB_NAME": "Aviation",
                            "SECTION_NAME_TT": "Liabs GA RW",
                            "PARTICIPATION_NAME": null,
                            "INSURED_ID": null,
                            "INSURED_FULL_NAME": null,
                            "BROKER_ID": null,
                            "BROKER_FULL_NAME": null,
                            "POOL_ID": null,
                            "POOL_CD": null,
                            "POOL_NAME": null,
                            "COVERHOLDER_ID": null,
                            "COVERHOLDER_CODE": null,
                            "COVERHOLDER_NAME": null,
                            "RISK_INCEPTION_DT": "/Date(1704067200001+0000)/",
                            "RISK_EXPIRY_DT": "/Date(1735689599999+0000)/",
                            "PRODUCT_NAME": "Large Risk-DEV",
                            "PRODUCT_ID": 3,
                            "INTRISK_ID": 100,
                            "INTRISK_CODE": "Liabs GA RW",
                            "INTRISK_DESCRIPTION": "Liabs GA RW",
                            "LLRISK_CODE": "L3",
                            "LLOYDSRISK_ID": 36,
                            "LLRISK_DESCRIPTION": "General Aviation Liability",
                            "RISK_JURISDICTION_CD": "FR",
                            "RATE_OF_EXCHANGE_AM": null,
                            "RISK_LOCATION_CD": "AS",
                            "EXREF_STATUS_CD": null,
                            "STAMP_ID": 26362,
                            "__metadata": {
                                "type": "atom.srv.deal.DealService.InternalReferencesWithAttributes",
                                "uri": "https://adev02-dev-default-elseco-deal-srv.cfapps.eu10-004.hana.ondemand.com/v2/dealmgmt-srv/InternalReferencesWithAttributes(124L)"
                            }
                        },
                        {
                            "PK_ID": "981",
                            "PARENT_ID": "0",
                            "INTERNAL_REFERENCE_NO": "11000069524148304-001",
                            "LINE_SIZE_VL": "10",
                            "PREMIUM_SPLIT_VL": "50",
                            "EXTERNAL_REFERENCE_NO": null,
                            "SECTION_PK_ID": 252,
                            "EXTREF_PK_ID": null,
                            "PARTICIPATION_PK_ID": null,
                            "DEAL_PK_ID": null,
                            "DEAL_NAME": null,
                            "SUBMISSION_ID": null,
                            "UMR_NO": null,
                            "LOB_ID": 1,
                            "LOB_NAME": "Aviation",
                            "SECTION_NAME_TT": "Liabs GA RW",
                            "PARTICIPATION_NAME": null,
                            "INSURED_ID": null,
                            "INSURED_FULL_NAME": null,
                            "BROKER_ID": null,
                            "BROKER_FULL_NAME": null,
                            "POOL_ID": null,
                            "POOL_CD": null,
                            "POOL_NAME": null,
                            "COVERHOLDER_ID": null,
                            "COVERHOLDER_CODE": null,
                            "COVERHOLDER_NAME": null,
                            "RISK_INCEPTION_DT": "/Date(1704067200001+0000)/",
                            "RISK_EXPIRY_DT": "/Date(1735689599999+0000)/",
                            "PRODUCT_NAME": "Large Risk-DEV",
                            "PRODUCT_ID": 3,
                            "INTRISK_ID": 100,
                            "INTRISK_CODE": "Liabs GA RW",
                            "INTRISK_DESCRIPTION": "Liabs GA RW",
                            "LLRISK_CODE": "L3",
                            "LLOYDSRISK_ID": 36,
                            "LLRISK_DESCRIPTION": "General Aviation Liability",
                            "RISK_JURISDICTION_CD": "FR",
                            "RATE_OF_EXCHANGE_AM": null,
                            "RISK_LOCATION_CD": "AS",
                            "EXREF_STATUS_CD": null,
                            "STAMP_ID": 26362,
                            "__metadata": {
                                "type": "atom.srv.deal.DealService.InternalReferencesWithAttributes",
                                "uri": "https://adev02-dev-default-elseco-deal-srv.cfapps.eu10-004.hana.ondemand.com/v2/dealmgmt-srv/InternalReferencesWithAttributes(981L)"
                            }
                        }
                    ]
                }
            }   
        )
      }
  },
  {
    request: {
      'method': 'GET',
      'path': `/v2/dealmgmt-srv/InternalReferencesWithAttributes?$filter=(INTERNAL_REFERENCE_NO%20eq%20%2711000069524148304-001%27)`
    },
    response: {
      'statusCode': 200,
      'body': JSON.stringify(
          {
              "d": {
                  "results": [
                      {
                          "PK_ID": "124",
                          "PARENT_ID": "0",
                          "INTERNAL_REFERENCE_NO": "11000069524148304-001",
                          "LINE_SIZE_VL": "10",
                          "PREMIUM_SPLIT_VL": "50",
                          "EXTERNAL_REFERENCE_NO": null,
                          "SECTION_PK_ID": 252,
                          "EXTREF_PK_ID": null,
                          "PARTICIPATION_PK_ID": null,
                          "DEAL_PK_ID": null,
                          "DEAL_NAME": null,
                          "SUBMISSION_ID": null,
                          "UMR_NO": null,
                          "LOB_ID": 1,
                          "LOB_NAME": "Aviation",
                          "SECTION_NAME_TT": "Liabs GA RW",
                          "PARTICIPATION_NAME": null,
                          "INSURED_ID": null,
                          "INSURED_FULL_NAME": null,
                          "BROKER_ID": null,
                          "BROKER_FULL_NAME": null,
                          "POOL_ID": null,
                          "POOL_CD": null,
                          "POOL_NAME": null,
                          "COVERHOLDER_ID": null,
                          "COVERHOLDER_CODE": null,
                          "COVERHOLDER_NAME": null,
                          "RISK_INCEPTION_DT": "/Date(1704067200001+0000)/",
                          "RISK_EXPIRY_DT": "/Date(1735689599999+0000)/",
                          "PRODUCT_NAME": "Large Risk-DEV",
                          "PRODUCT_ID": 3,
                          "INTRISK_ID": 100,
                          "INTRISK_CODE": "Liabs GA RW",
                          "INTRISK_DESCRIPTION": "Liabs GA RW",
                          "LLRISK_CODE": "L3",
                          "LLOYDSRISK_ID": 36,
                          "LLRISK_DESCRIPTION": "General Aviation Liability",
                          "RISK_JURISDICTION_CD": "FR",
                          "RATE_OF_EXCHANGE_AM": null,
                          "RISK_LOCATION_CD": "AS",
                          "EXREF_STATUS_CD": null,
                          "STAMP_ID": 26362,
                          "__metadata": {
                              "type": "atom.srv.deal.DealService.InternalReferencesWithAttributes",
                              "uri": "https://adev02-dev-default-elseco-deal-srv.cfapps.eu10-004.hana.ondemand.com/v2/dealmgmt-srv/InternalReferencesWithAttributes(124L)"
                          }
                      },
                      {
                          "PK_ID": "981",
                          "PARENT_ID": "0",
                          "INTERNAL_REFERENCE_NO": "11000069524148304-001",
                          "LINE_SIZE_VL": "10",
                          "PREMIUM_SPLIT_VL": "50",
                          "EXTERNAL_REFERENCE_NO": null,
                          "SECTION_PK_ID": 252,
                          "EXTREF_PK_ID": null,
                          "PARTICIPATION_PK_ID": null,
                          "DEAL_PK_ID": null,
                          "DEAL_NAME": null,
                          "SUBMISSION_ID": null,
                          "UMR_NO": null,
                          "LOB_ID": 1,
                          "LOB_NAME": "Aviation",
                          "SECTION_NAME_TT": "Liabs GA RW",
                          "PARTICIPATION_NAME": null,
                          "INSURED_ID": null,
                          "INSURED_FULL_NAME": null,
                          "BROKER_ID": null,
                          "BROKER_FULL_NAME": null,
                          "POOL_ID": null,
                          "POOL_CD": null,
                          "POOL_NAME": null,
                          "COVERHOLDER_ID": null,
                          "COVERHOLDER_CODE": null,
                          "COVERHOLDER_NAME": null,
                          "RISK_INCEPTION_DT": "/Date(1704067200001+0000)/",
                          "RISK_EXPIRY_DT": "/Date(1735689599999+0000)/",
                          "PRODUCT_NAME": "Large Risk-DEV",
                          "PRODUCT_ID": 3,
                          "INTRISK_ID": 100,
                          "INTRISK_CODE": "Liabs GA RW",
                          "INTRISK_DESCRIPTION": "Liabs GA RW",
                          "LLRISK_CODE": "L3",
                          "LLOYDSRISK_ID": 36,
                          "LLRISK_DESCRIPTION": "General Aviation Liability",
                          "RISK_JURISDICTION_CD": "FR",
                          "RATE_OF_EXCHANGE_AM": null,
                          "RISK_LOCATION_CD": "AS",
                          "EXREF_STATUS_CD": null,
                          "STAMP_ID": 26362,
                          "__metadata": {
                              "type": "atom.srv.deal.DealService.InternalReferencesWithAttributes",
                              "uri": "https://adev02-dev-default-elseco-deal-srv.cfapps.eu10-004.hana.ondemand.com/v2/dealmgmt-srv/InternalReferencesWithAttributes(981L)"
                          }
                      }
                  ]
              }
          }   
      )
    }
}
];