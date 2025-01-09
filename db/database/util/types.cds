namespace atom.util.types;

type Currency                               : String(3);
type Amount                                 : Decimal(15, 2);
type DocumentNo : String(12);

type ClearingStatus                         : Int16 enum {
    InProcess     = 0;
    Success       = 1;
    Failed        = 2;
    NotApplicable = 4;
}

type ClearingTypes                          : String(20) enum {
    PremiumReceivables = 'PremiumReceivables';
    ClaimReceivables = 'ClaimReceivables';
    PremiumPayables = 'PremiumPayables';
    ClaimPayables = 'ClaimPayables';
}

type ConvForeignCurrency                    : {
    No: Int64;
    ForeignAmount   : types.Amount;
    ForeignCurrency : types.Currency;
    LocalAmount     : types.Amount;
    LocalCurrency   : types.Currency;
    Rate            : Decimal(11, 5)
}

type FicaCreationPremiumReceivablesResponse : {
    UniqueClearingIdentifier : UUID not null;
    ExtRef                   : String(241) not null;
    IntRef                   : String(241) not null;
    TrType                   : String(50) not null;
    BitRef                   : String(128) not null;
    EndorsementRef           : String(10) not null;
    PolicyNo                 : String(50) not null;
    PremiumId                : String(16) not null;
    Installment              : String(30) not null;
    CreatedDocuments         : String(5000) not null;
    Status                   : String(10) not null;
}

type FicaCreationClaimReceivablesResponse   : {
    UniqueClearingIdentifier : UUID not null;
    ExtRef                   : String(241) not null;
    IntRef                   : String(241) not null;
    TrType                   : String(50) not null;
    BitRef                   : String(128) not null;
    UCR                      : String(241) not null;
    ClaimRef                 : String(35) not null;
    TrRef                    : String(35) not null;
    MemberBPID               : String(10) not null;
    CreatedDocuments         : String(5000) not null;
    Status                   : String(10) not null;
}

type FICACreationUIMResponse                : {
    UniqueClearingIdentifier : UUID not null;
    DocumentNo               : String(12) not null;
    ItemNo                   : String(4);
    RepItem                  : String(3);
    SubItem                  : String(3);
    CreatedDocuments         : String(5000) not null;
    Status                   : String(10);
}


type ClearingPayloadInitHeaderData          : {
    POSTING_DATE        : Date;
    COMPANY_CODE        : String(4);
    DIVISION            : String(2);
    BANK_ACCOUNT_NUMBER : String(30);
    GL_ACCOUNT          : String(10);
    GL_ACCOUNT_CHARGES : String(10);
    SUB_TRANSACTION   : String(12);
    GL_ACCOUNT_FOR_OP  : String(12);
};

type ClearingPayloadInit                    : {
    HEADER_DATA           : types.ClearingPayloadInitHeaderData;
    BUSINESS_PARTNER_NO   : String(10);
    TRANSACTION_TYPE      : String(50);
    BIT_REFERENCE         : String(128);
    PREMIUM_ID            : String(16);
    INTERNAL_REFERENCE_NO : String(241);
    EXTERNAL_REFERENCE_NO : String(241);
    ORIGINAL_CURRENCY     : Currency; // Not Needed
    AMOUNT_CLEARED        : Amount; // AllocAmnSettCurr
    EXPECTED_PAY_CURRENCY : Currency; // Curr for AMOUNT_CLEARED
    ROE_REC_CURRENCY      : Decimal(9, 5); // Needed ?
    // ACTUAL_CURRENCY_REC   : Currency; // Needed ?--- Not Needed
    // EXPECTED_PAY_AMOUNT   : Amount; // Not Needed
    DELTA_DUE_ROE         : Amount;
    INSTALLMENT           : String(30);
    DUE_DATE              : Date;
    // SECTION_NAME          : String(20);
    ENDORSEMENT_REF       : String(10);
    UMR                   : String(60);
    // POSTING_COMMENTS      : String(128); // Needed ?
    // POSTING_TYPE          : String(20);
    // PAYMENT_REF           : String(20);
    TAX                   : Boolean;
    TAX_CODE              : String(5);
    TAX_JURISDICTION      : String(5);
    TAX_BASE              : String(3);
    TAX_RATE              : Amount;
    // INCEPTION_DATE        : Date;
    // EXPIRY_DATE           : Date;
    // ELSECO_LINE_SIZE      : Decimal(11, 6);
    PROCESS_ID            : String(30); // Needed ?
    // CLEARABLE_AMOUNT      : Amount; // not needed
    // FINANCE_CLEARED       : Amount; // not needed
    POLICY_NUMBER         : String(50);
    DOCUMENT_NUMBER       : String(12);
    ITEM_NUMBER           : String(4);
    REP_ITEM              : String(3);
    SUB_ITEM              : String(3);
    FIXED_ROE             : String(1);
    PAYMENT_REF           : String(16);
    SOA_COUNT             : String(3);
    ALLOCAMN              : Amount;
    DOCUMENT_TYPE         : String(2);
    HVORG                 : String(4);
    POSTING_TYPE          : String(20);
    ORIGIN: String(2);

}


type CRClearingPayloadInit                  : {
    HEADER_DATA           : types.ClearingPayloadInitHeaderData;
    BUSINESS_PARTNER_NO   : String(10);
    TRANSACTION_TYPE      : String(50);
    BIT_REFERENCE         : String(128);
    INTERNAL_REFERENCE_NO : String(241);
    EXTERNAL_REFERENCE_NO : String(241);
    ORIGINAL_CURRENCY     : Currency; // Not Needed
    AMOUNT_CLEARED        : Amount; // AllocAmnSettCurr
    EXPECTED_PAY_CURRENCY : Currency; // Curr for AMOUNT_CLEARED
    ROE_REC_CURRENCY      : Decimal(9, 5); // Needed ?
    DUE_DATE              : Date;
    UMR                   : String(60);
    UCR                   : String(241);
    CLAIM_REFERENCE       : String(35);
    TRANSACTION_REFERENCE : String(35);
    UWAY                  : String(4);
    COLLECTION_TYPE       : String(1);
    CONTRACT_ACCOUNT      : String(12);
    MEMBERBPID            : String(10);
    DOCUMENT_NUMBER       : String(12);
    ITEM_NUMBER           : String(4);
    REP_ITEM              : String(3);
    SUB_ITEM              : String(3);
    FIXED_ROE             : String(1);
    PAYMENT_REF           : String(16);
    ALLOCAMN              : Amount;
    DOCUMENT_TYPE         : String(2);
    HVORG                 : String(4);
    POSTING_TYPE          : String(20);
    DELTA_DUE_ROE         : Amount;
    ORIGIN                : String(2);
    AGREEMENT_ID          : String(30);
    FRONTING_AGREEMENT_ID : String(30);
    STAMP_MEMBER_ID       : String(10);
    AGREEMENT_TYPE        : String(30);
}
