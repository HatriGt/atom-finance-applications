@AbapCatalog.sqlViewName: 'ZIFICADASH'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'FICA Dashboard Data Service'
define view ZI_FICADASHBOARD
  as select from    dfkkko            as header
    inner join      dfkkop            as item      on header.opbel = item.opbel
    left outer join I_BusinessPartner as bp        on item.gpart = bp.BusinessPartner
    left outer join t001              as cc        on item.bukrs = cc.bukrs
    left outer join I_BusinessPartner as bp_member on item.yymember = bp.BusinessPartner

{
  header.opbel                      as ficaDoc,
  case
  when header.blart = 'DR' then 'To be Paid'
  when header.blart = 'CP' then 'Received'
  when header.blart = 'PO' or header.blart = 'EN' then 'Booked'
  when header.blart = 'DM' then 'Broker - Claim'
  else ''
  end                               as action,
  header.yyinstallment_num          as installment,
  item.faedn                        as dueDate,
  header.budat                      as postingDate,
  header.yyextref                   as externalReference,
  header.yypremium_id               as premiumId,
  header.yyendorsementref           as endorsementReference,
  header.waers                      as currency,
  sum( item.betrw)                  as premium,
  item.gpart                        as businessPartnerId,
  bp.BusinessPartnerFullName        as businessPartner,
  item.herkf_kk,
  header.cpudt                      as enteredOn,
  header.yyucr                      as ucr,
  header.yyelsclaimnum              as claimReference,
  header.yytr_id                    as transactionReference,
  header.blart                      as docType,
  'Policy'                          as type,
  item.yymember                     as memberID,
  bp_member.BusinessPartnerFullName as memberName,
  item.augbl                        as clearingDocument,
  item.augdt                        as clearingDate,
  sum(item.augbt)                   as clearingAmount,
  sum(item.betrh)                   as settlementAmount,
  cc.waers                          as settlementCurrency,
  item.yyext_roe                    as externalROE
}
where
       bltyp        = ''
  and(
       header.blart = 'PO'
    or header.blart = 'CP'
    or header.blart = 'DR'
    or header.blart = 'EN'
  )
  and  header.storb = ''
  and  header.stbel = ''
group by
  header.yyinstallment_num,
  header.blart,
  header.opbel,
  header.budat,
  header.yyextref,
  header.yypremium_id,
  header.yyendorsementref,
  header.waers,
  item.hvorg,
  item.faedn,
  item.gpart,
  bp.BusinessPartnerFullName,
  item.herkf_kk,
  header.yyucr,
  header.yyelsclaimnum,
  header.cpudt,
  header.yytr_id,
  header.blart,
  item.yymember,
  item.augbl,
  item.augdt,
  cc.waers,
  item.yyext_roe,
  bp_member.BusinessPartnerFullName


union select from dfkkko            as header
  inner join      dfkkop            as item      on header.opbel = item.opbel
  left outer join I_BusinessPartner as bp        on item.gpart = bp.BusinessPartner
  left outer join t001              as cc        on item.bukrs = cc.bukrs
  left outer join I_BusinessPartner as bp_member on item.yymember = bp.BusinessPartner
{
  item.augbl                        as ficaDoc,
  'Paid'                            as action,
  header.yyinstallment_num          as installment,
  item.faedn                        as dueDate,
  item.budat                        as postingDate,
  item.yyextref                     as externalReference,
  header.yypremium_id               as premiumId,
  header.yyendorsementref           as endorsementReference,
  item.waers                        as currency,
  sum(item.betrw)                   as premium,
  item.gpart                        as businessPartnerId,
  bp.BusinessPartnerFullName        as businessPartner,
  item.herkf_kk,
  header.cpudt                      as enteredOn,
  header.yyucr                      as ucr,
  header.yyelsclaimnum              as claimReference,
  header.yytr_id                    as transactionReference,
  header.blart                      as docType,
  'Policy'                          as type,
  item.yymember                     as memberID,
  bp_member.BusinessPartnerFullName as memberName,
  item.augbl                        as clearingDocument,
  item.augdt                        as clearingDate,
  sum(item.augbt)                   as clearingAmount,
  sum(item.betrh)                   as settlementAmount,
  cc.waers                          as settlementCurrency,
  item.yyext_roe                    as externalROE
}
where
      item.augbl   != ''
  and item.blart   =  'DR'
  and header.storb =  ''
  and header.stbel =  ''
group by
  item.yyextref,
  item.augbl,
  item.budat,
  item.faedn,
  item.waers,
  item.hvorg,
  item.gpart,
  bp.BusinessPartnerFullName,
  header.yyinstallment_num,
  header.yypremium_id,
  header.yyendorsementref,
  item.herkf_kk,
  header.yyucr,
  header.yyelsclaimnum,
  header.cpudt,
  header.yytr_id,
  header.blart,
  item.yymember,
  item.augbl,
  item.augdt,
  cc.waers,
  item.yyext_roe,
  bp_member.BusinessPartnerFullName

// Claim Receivables
union select from dfkkko            as header
  inner join      dfkkop            as item      on header.opbel = item.opbel
  left outer join I_BusinessPartner as bp        on item.gpart = bp.BusinessPartner
  left outer join t001              as cc        on item.bukrs = cc.bukrs
  left outer join I_BusinessPartner as bp_member on item.yymember = bp.BusinessPartner
{
  header.opbel                      as ficaDoc,
  //case
  //  when header.blart = 'DM' then 'Broker - Claim'  // opbel
  //  when header.blart = 'CL' then 'Claim In' //
  //    when header.blart = 'CC' then 'Money in - Claims'
  //      when header.blart = 'CR' then 'Claim paymt. release'
  //        when header.blart = 'SC' then 'Claim Salvage - in'
  //          when header.blart = 'RC' then 'Claim Subrogatn - in'
  //  else ''
  //  end
  ''                                as action,
  header.yyinstallment_num          as installment,
  item.faedn                        as dueDate,
  header.budat                      as postingDate,
  header.yyextref                   as externalReference,
  header.yypremium_id               as premiumId,
  header.yyendorsementref           as endorsementReference,
  header.waers                      as currency,
  sum( item.betrw)                  as premium,
  item.gpart                        as businessPartnerId,
  bp.BusinessPartnerFullName        as businessPartner,
  item.herkf_kk,
  header.cpudt                      as enteredOn,
  header.yyucr                      as ucr,
  header.yyelsclaimnum              as claimReference,
  header.yytr_id                    as transactionReference,
  header.blart                      as docType,
  'Claim'                           as type,
  item.yymember                     as memberID,
  bp_member.BusinessPartnerFullName as memberName,
  item.augbl                        as clearingDocument,
  item.augdt                        as clearingDate,
  sum(item.augbt)                   as clearingAmount,
  sum(item.betrh)                   as settlementAmount,
  cc.waers                          as settlementCurrency,
  item.yyext_roe                    as externalROE
}
where
       bltyp        = ''
  and(
       header.blart = 'DM'
    or header.blart = 'CL'
    or header.blart = 'CC'
    or header.blart = 'CR'
    or header.blart = 'SC'
    or header.blart = 'RC'
  )
  and  header.storb = ''
  and  header.stbel = ''
group by
  header.yyinstallment_num,
  header.blart,
  header.opbel,
  header.budat,
  header.yyextref,
  header.yypremium_id,
  header.yyendorsementref,
  header.waers,
  item.hvorg,
  item.faedn,
  item.gpart,
  bp.BusinessPartnerFullName,
  item.herkf_kk,
  header.yyucr,
  header.yyelsclaimnum,
  header.cpudt,
  header.yytr_id,
  header.blart,
  item.yymember,
  item.augbl,
  item.augdt,
  cc.waers,
  item.yyext_roe,
  bp_member.BusinessPartnerFullName
