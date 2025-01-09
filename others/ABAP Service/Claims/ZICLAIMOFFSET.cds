@AbapCatalog.sqlViewName: 'ZICLAIMOFFSET'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Claim Offset View'
define view ZI_CLAIMOFFSET
  as select from dfkkop as item
    inner join   dfkkko as header on item.opbel = header.opbel
{
 key item.opbel,
 key item.opupz,
 key item.opupk,
 key item.opupw,
  item.gpart,
  item.yymember,
  item.yyfronter,
  item.spart,
  header.yyuway,
  item.budat,
  item.blart,
  item.betrw,
  item.betrh,
  item.waers,
  item.yybitref,
  item.bukrs,
  03 as sort_order

}
where
      stbel      =  ''
  and storb      =  ''
  and item.blart =  'DR'
  and augst      != '9'
  and hvorg      not like 'T%'
  and xpyor      =  ''
union select from dfkkop as item
  inner join      dfkkko as header on item.opbel = header.opbel
{
 key item.opbel,
 key item.opupz,
 key item.opupk,
 key item.opupw,
  item.gpart,
  item.yymember,
  item.yyfronter,
  item.spart,
  header.yyuway,
  item.budat,
  item.blart,
  item.betrw,
  item.betrh,
  item.waers,
  item.yybitref,
  item.bukrs,
  case item.blart when 'SD'
       then 01
       when 'RD'
       then 02
       when 'DM'
       then 04
       else 09
       end as sort_order
}
where
       stbel      =  ''
  and  storb      =  ''
  and(
       item.blart =  'DM'
    or item.blart =  'SD'
    or item.blart =  'RD'
  )
  and  augst      != '9'
  and  hvorg      not like 'T%'
  and  pymet      =  'O'
  and  xpyor      =  '';
