
using { FicaDashboardService as external } from '../external/FicaDashboardService';
@(impl:'./ficadashboardService.js')
// @(path: '/ficadashboardservice')
@protocol: [{ kind: 'odata-v2', path: '/v2/ficadashboardservice' }
,{ kind: 'odata-v4', path: '/ficadashboardservice' }]
service ficadashboardService @(requires:'finance-ficadashboard-read') {
    @readonly
    entity ficadetails as projection on external.ZC_FICADASHBOARD{
        *
    };
}
