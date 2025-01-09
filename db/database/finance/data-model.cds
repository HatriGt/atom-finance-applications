namespace atom.db.finance;

using atom.util.types as types from '../util/types';
using {
    cuid,
    managed,
    User
} from '@sap/cds/common';


entity PremiumReceivablesPendingTransactions : cuid, managed {
    ExtRef         : String(241) not null;
    IntRef         : String(241) not null;
    TrType         : String(50) not null;
    BitRef         : String(128) not null;
    EndorsementRef : String(10);
    PremiumId      : String(16);
    PolicyNo       : String(50);
    Installment    : String(30) not null;
    Status         : types.ClearingStatus;
}

entity ClaimReceivablesPendingTransactions : cuid, managed {
    ExtRef     : String(241);
    IntRef     : String(241);
    TrType     : String(50);
    BitRef     : String(128);
    UCR        : String(241);
    ClaimRef   : String(35);
    TrRef      : String(35);
    MemberBPID : String(10);
    Status     : types.ClearingStatus;
}

entity PremiumPayablesPendingTransactions : cuid, managed {
    ExtRef         : String(241) not null;
    IntRef         : String(241) not null;
    TrType         : String(50) not null;
    EndorsementRef : String(10);
    PremiumId      : String(16);
    PolicyNo       : String(50);
    Installment    : String(30) not null;
    DocumentNo     : String(12);
    ItemNo         : String(4);
    RepItem        : String(3);
    SubItem        : String(3);
    Status         : types.ClearingStatus;
}

entity ClaimPayablesPendingTransactions : cuid, managed {
    ExtRef     : String(241);
    IntRef     : String(241);
    TrType     : String(50);
    UCR        : String(241);
    ClaimRef   : String(35);
    TrRef      : String(35);
    DocumentNo : String(12);
    ItemNo     : String(4);
    RepItem    : String(3);
    SubItem    : String(3);
    Status     : types.ClearingStatus;
}

entity UIMPendingTransactions : cuid, managed {
    DocumentNo : String(12);
    ItemNo     : String(4);
    RepItem    : String(3);
    SubItem    : String(3);
    Status     : types.ClearingStatus;
}


entity InterfaceLog : cuid, managed {
    ExtRef                   : String(241) not null;
    ClaimRef                 : String(35);
    ClearingType             : types.ClearingTypes;
    Date                     : Date = current_date;
    UniqueClearingIdentifier : UUID;
    Payload                  : LargeString not null;
    Response                 : LargeString;
    Status                   : types.ClearingStatus;
    StatusInfo               : LargeString;
}

entity ClearingLog : cuid, managed {
    @Common.Label: 'Clearing ID'
    UniqueClearingIdentifier : UUID not null;

    @Common.Label: 'External Reference'
    ExtRef                   : String(241) not null;

    @Common.Label: 'Claim ID'
    ClaimRef                 : String(35);

    @Common.Label: 'Clearing Type'
    ClearingType             : types.ClearingTypes;

    @Common.Label: 'Cleared On'
    ClearedOn                : Timestamp @cds.on.insert: $now;

    @Common.Label: 'Status'
    Status                   : types.ClearingStatus;

    @Common.Label: 'Created Documents'
    CreatedDocuments         : LargeString;

    @Common.Label: 'Error Info'
    ErrorInfo                : String(255);

    @Common.Label: 'Interface Log'
    ItsInterfaceLog          : Association to one InterfaceLog
                                   on  ItsInterfaceLog.UniqueClearingIdentifier = $self.UniqueClearingIdentifier;
                                //    and ItsInterfaceLog.ExtRef                   = $self.ExtRef
                                //    and ItsInterfaceLog.ClaimRef                 = $self.ClaimRef;
    ItsClearingLogExpanded   : Association to many ClearingLogExpanded
                                   on  ItsClearingLogExpanded.UniqueClearingIdentifier = $self.UniqueClearingIdentifier;
                                //    and ItsClearingLogExpanded.ExtRef                   = $self.ExtRef
                                //    and ItsClearingLogExpanded.ClaimRef                 = $self.ClaimRef;
}

entity ClearingLogExpanded : cuid, managed {
    @Common.Label: 'Unique Clearing Identifier'
    UniqueClearingIdentifier : UUID;

    @Common.Label: 'Transaction Type'
    TransactionType          : String(50);

    @Common.Label: 'External Reference'
    ExtRef                   : String(241) not null;

    @Common.Label: 'Internal Reference'
    IntRef                   : String(241);

    @Common.Label: 'Installment'
    Installment              : String(30);

    @Common.Label: 'Claim ID'
    ClaimRef                 : String(35);

    @Common.Label: 'Transaction ID'
    TrRef                    : String(35);

    @Common.Label: 'Amount Cleared'
    AmountCleared            : types.Amount;

    @Common.Label: 'Original Currency'
    OriginalCurrency         : types.Currency;

    @Common.Label: 'Allocated Amount'
    AllocAmn                 : types.Amount;

    @Common.Label: 'Expected Pay Currency'
    ExpectedPayCurrency      : types.Currency;

    @Common.Label: 'Delta Due Roe'
    DeltaDueRoe              : types.Amount;

    @Common.Label: 'Bit Reference'
    BitReference             : String(128);

    @Common.Label: 'Endorsement Reference'
    EndorsementRef           : String(10);

    @Common.Label: 'Member BPID'
    MemberBPID               : String(10);
    
}

entity ClearingStatusLog : cuid, managed {
    UniqueClearingIdentifier : UUID not null;
    ClearingType             : types.ClearingTypes;
    ClearedDate               : Date  = substring(createdAt, 1, 10);
    ClearedTime          : Time = substring(createdAt, 12, 8);
    ExtRef                   : String(241);
    IntRef                   : String(241);
    TrType                   : String(50) not null;
    BitRef                   : String(128);
    EndorsementRef           : String(10);
    PremiumId                : String(16);
    PolicyNo                 : String(50);
    Installment              : String(30);
    UCR                      : String(241);
    ClaimRef                 : String(35);
    TrRef                    : String(35);
    MemberBPID               : String(10);
    DocumentNo               : String(12);
    ItemNo                   : String(4);
    RepItem                  : String(3);
    SubItem                  : String(3);
    AmountCleared            : types.Amount;
    RoeRecCurr               : Decimal(9, 5);
    DeltaDueRoe              : types.Amount;
    OriginalCurrency         : types.Currency;
    ExpectedPayCurrency      : types.Currency;
    ClearedBy                : User @cds.on.insert: $user;
    CreatedDocuments         : String(5000);
    Status                   : types.ClearingStatus;
    AdditionalInfo           : LargeString;
}

entity ActionLogger : cuid, managed {
    @Common.Label: 'Unique Clearing Identifier'
    UniqueClearingIdentifier : UUID;

    @Common.Label: 'Clearing Type'
    ClearingType             : types.ClearingTypes;

    @Common.Label: 'Cleared Date'
    ClearedDate               : Date  = substring(createdAt, 1, 10);

    @Common.Label: 'Cleared Time'
    ClearedTime          : Time = substring(createdAt, 12, 8);

    @Common.Label: 'Ext Ref'
    ExtRef                   : String(241);

    @Common.Label: 'Int Ref'
    IntRef                   : String(241);

    @Common.Label: 'Tr Type'
    TrType                   : String(50);

    @Common.Label: 'Bit Ref'
    BitRef                   : String(128);

    @Common.Label: 'Endorsement Ref'
    EndorsementRef           : String(10);

    @Common.Label: 'Premium Id'
    PremiumId                : String(16);

    @Common.Label: 'Policy No'
    PolicyNo                 : String(50);

    @Common.Label: 'Installment'
    Installment              : String(30);

    @Common.Label: 'UCR'
    UCR                      : String(241);

    @Common.Label: 'Claim Ref'
    ClaimRef                 : String(35);

    @Common.Label: 'Tr Ref'
    TrRef                    : String(35);

    @Common.Label: 'Member BPID'
    MemberBPID               : String(10);

    @Common.Label: 'Document No'
    DocumentNo               : String(12);

    @Common.Label: 'Item No'
    ItemNo                   : String(4);

    @Common.Label: 'Rep Item'
    RepItem                  : String(3);

    @Common.Label: 'Sub Item'
    SubItem                  : String(3);

    @Common.Label: 'Amount Cleared'
    AmountCleared            : types.Amount;

    @Common.Label: 'Roe Rec Curr'
    RoeRecCurr               : Decimal(9, 5);

    @Common.Label: 'Delta Due Roe'
    DeltaDueRoe              : types.Amount;

    @Common.Label: 'Original Currency'
    OriginalCurrency         : types.Currency;

    @Common.Label: 'Expected Pay Currency'
    ExpectedPayCurrency      : types.Currency;

    @Common.Label: 'Cleared By'
    ClearedBy                : User @cds.on.insert: $user;

    @Common.Label: 'Created Documents'
    CreatedDocuments         : String(5000);

    @Common.Label: 'Status'
    Status                   : types.ClearingStatus;

    @Common.Label: 'Additional Info'
    AdditionalInfo           : LargeString;
}

entity ClearingTableUserVariants : cuid, managed {
    @Common.Label: 'Variant Created By'
    VariantOf           : User @cds.on.insert: $user;

    @Common.Label: 'Variant Created For'
    VariantFor          : types.ClearingTypes;

    @Common.Label: 'Variant Name'
    VariantName         : String(30) not null;
    VariantFieldsAsJson : LargeString not null;

    @Common.Label: 'Is Default'
    isDefault           : Boolean default false;

    @Common.Label: 'Is Public'
    isPublic            : Boolean default false;

    @Common.Label: 'Variant Created By'
    @UI.Hidden   : true
    VariantCreatedBy    : User @cds.on.insert: $user;
}
