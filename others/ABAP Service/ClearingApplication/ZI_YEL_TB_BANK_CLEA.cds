@AbapCatalog.sqlViewName: 'ZI_YEL_BANK_CLEA'
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Bank clearing'
@VDM.viewType: #BASIC
@ObjectModel.usageType.sizeCategory: #S
@ObjectModel.usageType.dataClass:  #MASTER
@ObjectModel.usageType.serviceQuality: #A
define view ZI_YEL_TB_BANK_CLEA
  as select from    V_T012k_DDL      as k
    inner join      V_T012t_Ddl      as t  on  k.bukrs = t.bukrs
                                           and k.hbkid = t.hbkid
                                           and k.hktid = t.hktid
    inner join      yel_tb_bank_clea as c  on k.bankn = c.bank_account
{
  key company_code,
  key division,
  key currency,
  key bank_account    as ElsecoBankAccountNumber,
      gl_account      as GLAccount,
      gl_bank_charges as GLAccountCharges,
      text1           as description
//      tf.mandt as Mandt,
//      tf.applk as Applk,
//      tf.buber as Buber,
//      tf.ktopl as Ktopl,
//      tf.key01 as Key01,
//      tf.key02 as Key02,
//      tf.key03 as Key03,
//      tf.key04 as Key04,
//      tf.key05 as Key05,
//      tf.key06 as Key06,
//      tf.key07 as Key07,
//      tf.key08 as Key08,
//      tf.fun01 as Fun01,
//      tf.fun02 as Fun02,
//      tf.fun03 as Fun03,
//      tf.fun04 as Fun04,
//      tf.fun05 as Fun05,
//      tf.fun06 as Fun06
}
where
  t.spras = 'E';
