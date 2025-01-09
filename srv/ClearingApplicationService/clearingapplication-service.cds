using atom.db.finance as db from '../../db/database/finance/data-model';
using atom.util.types as types from '../../db/database/util/types';
using {clearingapplicationservices as external} from '../external/clearingapplicationservices';
using {BankAccount.ZC_YEL_TB_BANK_CLEA as BankAccountExternal} from '../external/BankAccount';
using {Product.Coverholder as CoverholderMasterData} from '../external/Product';
using {CRM.BusinessPartners as BusinessPartnersCRM} from '../external/CRM';
using {DealService.InternalReferencesWithAttributes as InternalReferencesWithAttributesDeal} from '../external/DealService';
using {MDM.Divisions as DivisionsMDM} from '../external/MDM';


@(impl: './clearingapplicationService.js')
// @(path: '/clearingapplication')
@protocol: [{ kind: 'odata-v2', path: '/v2/clearingapplication' }
,{ kind: 'odata-v4', path: '/clearingapplication' }]
service clearingapplicationService  {


    @cds.persistence.exists: false
    entity Coverholder                                                                                                          as projection on CoverholderMasterData;

    @cds.persistence.exists: false
    entity BusinessPartners                                                                                                     as projection on BusinessPartnersCRM;

    @cds.persistence.exists: false
    entity InternalReferencesWithAttributes                                                                                     as projection on InternalReferencesWithAttributesDeal;

    @cds.persistence.exists: false
    entity Divisions                                                                                                            as projection on DivisionsMDM;

    @cds.persistence.exists: false
    entity BankAccount                                                                                                          as projection on BankAccountExternal;

    @cds.persistence.exists: false
    entity PremiumReceivablesPendingTransactions                                                                                as projection on db.PremiumReceivablesPendingTransactions;

    @cds.persistence.exists: false
    entity ClaimReceivablesPendingTransactions                                                                                  as projection on db.ClaimReceivablesPendingTransactions;

    @cds.persistence.exists: false
    entity PremiumPayablesPendingTransactions                                                                                   as projection on db.PremiumPayablesPendingTransactions;

    @cds.persistence.exists: false
    entity ClaimPayablesPendingTransactions                                                                                     as projection on db.ClaimPayablesPendingTransactions;

    @cds.persistence.exists: false
    entity UIMPendingTransactions                                                                                               as projection on db.UIMPendingTransactions;

    @cds.persistence.exists: false
    entity ClearingOP                                                                                                           as projection on external.ClearingOPSet;

    @cds.persistence.exists: false
    entity CRClearingOP                                                                                                         as projection on external.CRClearingOPSet;

    @cds.persistence.exists: false
    entity ClearSOATable                                                                                                        as projection on external.ClearSOATableSet;

    @cds.persistence.exists: false
    entity UpdateSOATable                                                                                                       as projection on external.UpdateSOATableSet;

    @cds.persistence.exists: false
    entity SOAUpdateCheckResponse                                                                                               as projection on external.SOAUpdatePrecheckResponseSet;


    @cds.capabilities.insertable: true
    @cds.capabilities.readable  : true
    entity InterfaceLog                                                                                                         as projection on db.InterfaceLog;

    @cds.capabilities.insertable: true
    @cds.capabilities.readable  : true
    entity ClearingStatusLog                                                                                                    as projection on db.ClearingStatusLog;

    @cds.capabilities.insertable: true
    @cds.capabilities.readable  : true
    @cds.capabilities.deletable : true
    entity ClearingTableUserVariants @(restrict: [{where: '(VariantOf = $user ) or (VariantOf != $user and isPublic = true)'}]) as
        projection on db.ClearingTableUserVariants {
            ID,
            @Common.Label: 'Variant Created By'
            VariantOf,
            @Common.Label: 'Variant Created For'
            VariantFor,
            @Common.Label: 'Variant Name'
            VariantName,
            VariantFieldsAsJson,
            @Common.Label: 'Is Default'
            isDefault,
            @Common.Label: 'Is Public'
            isPublic,
            @Common.Label: 'Variant Created By'
            @UI.Hidden   : true
            VariantCreatedBy
        }

    // Common Actions
    action CheckPostingPeriod(PostingDate : DateTime, CompanyCode : String(4))                                                                           returns Boolean;
    action ConvLocalCurrency(ForeignAmount : types.Amount, ForeignCurrency : types.Currency, LocalCurrency : types.Currency, Rate : Decimal(9, 5))       returns types.ConvForeignCurrency;
    action ConvLocalCurrencyInBulk(Payload : array of types.ConvForeignCurrency)                                                                         returns array of types.ConvForeignCurrency;
    action UpdateUserVariants(UserVariants : array of ClearingTableUserVariants)                                                                         returns Boolean;
    action GetPayerPayee(IsPayerRequested : Boolean,
                         ExtRef : String,
                         UMR : String)                                                                                                                   returns {
        BP : array of String
    };

    // Premium Receivables
    action SOAUpdatePreCheck (SOAUpdate : array of UpdateSOATable)                                             returns SOAUpdateCheckResponse;
    action SOAUpdate (SOAUpdate : array of UpdateSOATable)                                                     returns array of ClearingOP;
    action ClearSOAReference (ClearSOATable : array of ClearSOATable)                                                                                        ;
    action UpdatePremiumReceivablesResponse (response : array of types.FicaCreationPremiumReceivablesResponse) returns Boolean;
    action UpdateUIMResponse (response : array of types.FICACreationUIMResponse)                               returns Boolean;
    action GetPremiumReceivables(SelectionFilters : String)                                                                                              returns array of LargeString;
    action ClearPremiumReceivables (clearingdata : array of types.ClearingPayloadInit)                         returns String; //Boolean; // todo change it back to boolean


    // Claim Receivables
    action GetClaimReceivables(SelectionFilters : String)                                                                                                returns array of LargeString;
    action ClearClaimReceivables (clearingdata : array of types.CRClearingPayloadInit)                         returns String;
    action UpdateClaimReceivablesResponse (response : array of types.FicaCreationClaimReceivablesResponse)     returns Boolean;
   
    // Premium Payables
    action GetPremiumPayables(SelectionFilters : String)                                                                                                 returns array of LargeString;
    action ClearPremiumPayables (clearingdata : array of types.ClearingPayloadInit)                            returns array of LargeString;
   
    // Claim Payables
    action GetClaimPayables(SelectionFilters : String)                                                                                                   returns array of LargeString;
    action ClearClaimPayables (clearingdata : array of types.CRClearingPayloadInit)                            returns array of LargeString;


    // ActionLogger
    @cds.persistence.exists    : false
    @readonly
    entity ActionLogger                                                                                                         as
        projection on db.ActionLogger {
            key ID, 
                UniqueClearingIdentifier,
                ClearingType,
                @UI.Hidden: true
                ClearedDate,
                @UI.Hidden: true
                ClearedTime,
                ClearedDate || ' ' || ClearedTime as ClearedDateTime : Timestamp,
                ExtRef,
                IntRef,
                TrType,
                BitRef,
                EndorsementRef,
                PremiumId,
                PolicyNo,
                Installment,
                UCR,
                ClaimRef,
                TrRef,
                MemberBPID,
                DocumentNo,
                ItemNo,
                RepItem,
                SubItem,
                AmountCleared,
                RoeRecCurr,
                DeltaDueRoe,
                OriginalCurrency,
                ExpectedPayCurrency,
                ClearedBy,
                case CreatedDocuments
                    when
                        '[]'
                    then
                        ''
                    else
                        CreatedDocuments
                end as CreatedDocuments : String(300),
                AdditionalInfo,
                case Status
                    when
                        0
                    then
                        'InProcess'
                    when
                        1
                    then
                        'Success'
                    when
                        2
                    then
                        'Failed'
                    when
                        4
                    then
                        'Not Applicable'
                end as Status : String(15),
                @UI.Hidden: true
                createdAt
        }
        order by
            createdAt desc;

    @readonly              : true
    @cds.persistence.exists: false
    entity ActionLoggerOverview                                                                                                 as
        select from ActionLogger {
            key UniqueClearingIdentifier,
                @Common.FilterDefaultValue: 'This Year'
            key ClearedDateTime,
            key ExtRef,
            key IntRef,
            key EndorsementRef,
            key Installment,
            key ClearedBy,
            key CreatedDocuments,
            key Status,
            key ClearingType,
            key ExpectedPayCurrency,
            key UCR,
            key ClaimRef, 
            key TrRef,
            @UI.Hidden: true
            key createdAt
        }
        where
            TrType not in (
                'Payment', 'Unallocated Insurance Monies', 'OVER PAYMENT', 'Bank Charge'
            )
        group by
            UniqueClearingIdentifier,
            Status,
            ClearedDate,
            ClearedTime,
            ClearedDateTime,
            ExtRef,
            IntRef,
            EndorsementRef,
            Installment,
            ClearedBy,
            CreatedDocuments,
            ClearingType,
            ExpectedPayCurrency,
            UCR,
            ClaimRef, 
            TrRef,
            createdAt
        order by
            createdAt desc;


    // Value Helps
    @cds.persistence.exists: false
    entity ClearingStatusVH                                                                                                     as
        select from ActionLogger distinct {
            key Status
        };

    @cds.persistence.exists: false
    entity ExternalReferenceVH                                                                                                  as select distinct key ExtRef from ActionLoggerOverview;

    @cds.persistence.exists: false
    entity InternalReferenceVH                                                                                                  as select distinct key IntRef from ActionLoggerOverview;


    @cds.persistence.exists: false
    entity ClearedByVH                                                                                                          as select distinct key ClearedBy from ActionLoggerOverview;

    @cds.persistence.exists: false
    entity UCRVH                                                                                                                as select distinct key UCR from ActionLoggerOverview;

    @cds.persistence.exists: false
    entity ClaimRefVH                                                                                                           as select distinct key ClaimRef from ActionLoggerOverview;

    @cds.persistence.exists: false
    entity TrRefVH                                                                                                              as select distinct key TrRef from ActionLoggerOverview;


    // Common Actions For Application Specific
    function GetMySapUser() returns String;

    // Entities to Display Logs
 
    entity ClearingLogExpanded                                                                                                  as projection on db.ClearingLogExpanded;
    @cds.autoexpose: true
    entity ClearingLog                                                                                                          as projection on db.ClearingLog {
        *,
        case Status
            when
                0
            then
                'InProcess'
            when
                1
            then
                'Success'
            when
                2
            then
                'Failed'
            when
                4
            then
                'Not Applicable'
        end as Status : String(15)
    } excluding {
     Status
    };
    @cds.autoexpose: true
    entity ClearingLogDB as projection on db.ClearingLog;

}
