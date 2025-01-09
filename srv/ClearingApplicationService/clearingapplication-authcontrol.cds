using { clearingapplicationService as service } from './clearingapplication-service';

// User must have finance-clearing-read and finance-clearing-maintain to read and maintain clearing applications
annotate service with @(requires:[
    'finance-clearing-read',
    'finance-clearing-maintain'
]);


// User must have finance-clearing-maintain to perform clearing & other changable operations
annotate service.ClearPremiumReceivables with @(requires: 'finance-clearing-maintain');
annotate service.ClearClaimReceivables with @(requires: 'finance-clearing-maintain');
annotate service.ClearPremiumPayables with @(requires: 'finance-clearing-maintain');
annotate service.ClearClaimPayables with @(requires: 'finance-clearing-maintain');
annotate service.SOAUpdate with @(requires: 'finance-clearing-maintain');
annotate service.SOAUpdatePreCheck with @(requires: 'finance-clearing-maintain');
annotate service.ClearSOAReference with @(requires: 'finance-clearing-maintain');

