using { clearingapplicationService } from '../../srv/ClearingApplicationService/clearingapplication-service';

annotate clearingapplicationService.ActionLogger with @(
    UI.SelectionFields: [
        ExtRef,
        IntRef,
        PolicyNo,
        UCR,
        TrRef,
        TrType
    ],

    UI.LineItem       : [
        {
            $Type            : 'UI.DataField',
            Value            : TrType,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : Status,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : BitRef,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ExtRef,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : IntRef,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : UCR,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ClaimRef,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : TrRef,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : MemberBPID,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : UniqueClearingIdentifier,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ClearingType,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : PolicyNo,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : EndorsementRef,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : PremiumId,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : Installment,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ClearedDate,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ClearedTime,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : DocumentNo,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ItemNo,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : RepItem,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : SubItem,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : AmountCleared,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : RoeRecCurr,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : DeltaDueRoe,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : OriginalCurrency,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ExpectedPayCurrency,
            ![@UI.Importance]: #High,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ClearedBy,
            ![@UI.Importance]: #Medium,
        },
        {
            $Type            : 'UI.DataField',
            Value            : CreatedDocuments,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : AdditionalInfo,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : ID,
            ![@UI.Importance]: #Low,
            ![@UI.Hidden] 
        },


    ]

);


annotate clearingapplicationService.ActionLoggerOverview with @(
    UI.SelectionFields: [
        Status,
        ClearedDateTime,
        // ClearedDate,
        // ClearedTime,
        ExtRef,
        IntRef,
        UCR,
        ClaimRef,
        TrRef,
        // TrType,
        // BitRef,
        EndorsementRef,
    Installment,
        ClearedBy,
        CreatedDocuments,
    // ClearingType
    ],

    UI.LineItem       : [
        {
            $Type                : 'UI.DataField',
            Value                : ClearedDateTime,
            ![@UI.Importance]    : #High,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '9em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : Status,
            ![@UI.Importance]    : #High,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '9em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : ExtRef,
            ![@UI.Importance]    : #High,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : IntRef,
            ![@UI.Importance]    : #High,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '15em',
            },
        },
        // Claim Related Fields
        {
            $Type                : 'UI.DataField',
            Value                : UCR,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : ClaimRef,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : TrRef,
            ![@UI.Importance]    : #High,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10em',
            },
        },
        // Policy Related Fields
        {
            $Type                : 'UI.DataField',
            Value                : EndorsementRef,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '5em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : Installment,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '5em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : ClearedBy,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : ExpectedPayCurrency,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '4em',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : CreatedDocuments,
            ![@UI.Importance]    : #Medium,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10em',
            },
        },
        {
            $Type            : 'UI.DataField',
            Value            : ClearingType,
            ![@UI.Importance]: #Low,
        },
        {
            $Type            : 'UI.DataField',
            Value            : UniqueClearingIdentifier,
            ![@UI.Importance]: #Low,
        },

    ]


);


annotate clearingapplicationService.ActionLoggerOverview with {

    ExtRef @(Common.ValueList: {
        $Type          : 'Common.ValueListType',
        CollectionPath : 'ExternalReferenceVH',
        Parameters     : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: ExtRef,
            ValueListProperty: 'ExtRef',
        }, ],
        Label          : 'External Reference',
        SearchSupported: true
    }, )
}

annotate clearingapplicationService.ActionLoggerOverview with {

    IntRef @(Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'InternalReferenceVH',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: IntRef,
            ValueListProperty: 'IntRef',
        }, ],
    }, )
}

annotate clearingapplicationService.ActionLoggerOverview with {

    Status @(Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'ClearingStatusVH',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: Status,
            ValueListProperty: 'Status',
        }, ],
    }, )
}

annotate clearingapplicationService.ActionLoggerOverview with {

    ClearedBy @(Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'ClearedByVH',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: ClearedBy,
            ValueListProperty: 'ClearedBy',
        }, ],
    }, )
}


annotate clearingapplicationService.ExternalReferenceVH with @(UI.LineItem: [{
    $Type                : 'UI.DataField',
    Value                : ExtRef,
    ![@UI.Importance]    : #High,
    ![@HTML5.CssDefaults]: {
        $Type: 'HTML5.CssDefaultsType',
        width: '9em',
    },
}]);

annotate clearingapplicationService.UCRVH with @(UI.LineItem: [{
    $Type                : 'UI.DataField',
    Value                : UCR,
    ![@UI.Importance]    : #High,
    ![@HTML5.CssDefaults]: {
        $Type: 'HTML5.CssDefaultsType',
        width: '9em',
    },
}]);

annotate clearingapplicationService.ClaimRefVH with @(UI.LineItem: [{
    $Type                : 'UI.DataField',
    Value                : ClaimRef,
    ![@UI.Importance]    : #High,
    ![@HTML5.CssDefaults]: {
        $Type: 'HTML5.CssDefaultsType',
        width: '9em',
    },
}]);

annotate clearingapplicationService.TrRefVH with @(UI.LineItem: [{
    $Type                : 'UI.DataField',
    Value                : TrRef,
    ![@UI.Importance]    : #High,
    ![@HTML5.CssDefaults]: {
        $Type: 'HTML5.CssDefaultsType',
        width: '9em',
    },
}]);
