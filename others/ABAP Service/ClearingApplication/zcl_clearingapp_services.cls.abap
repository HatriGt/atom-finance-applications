CLASS zcl_clearingapp_services DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    TYPES: BEGIN OF ty_fkkcl_extended_pr.
             INCLUDE TYPE fkkcl.
             TYPES: yyendorsementref TYPE dfkkko-yyendorsementref,
             yypremium_type   TYPE dfkkko-yypremium_type,
             yypremium_id     TYPE dfkkko-yypremium_id.
    TYPES: END OF ty_fkkcl_extended_pr.

    TYPES: BEGIN OF ty_fkkcl_extended_pp.
             INCLUDE TYPE fkkcl.
             TYPES: yyendorsementref TYPE dfkkko-yyendorsementref,
             yypremium_type   TYPE dfkkko-yypremium_type,
             yypremium_id     TYPE dfkkko-yypremium_id,
             yypolicy_num     TYPE dfkkko-yypolicy_num,
             yyuway           TYPE dfkkko-yyuway.
    TYPES: END OF ty_fkkcl_extended_pp.



    TYPES: BEGIN OF ty_fkkcl_extended_cr.
             INCLUDE TYPE fkkcl.
             TYPES: yyucr   TYPE dfkkko-yyucr,
             yytr_id TYPE dfkkko-yytr_id,
             yyuway  TYPE dfkkko-yyuway.
    TYPES: END OF ty_fkkcl_extended_cr.



    TYPES: tt_fkkcl_extended_pr TYPE STANDARD TABLE OF ty_fkkcl_extended_pr WITH DEFAULT KEY,
           tt_fkkcl_extended_pp TYPE STANDARD TABLE OF ty_fkkcl_extended_pp WITH DEFAULT KEY,
           tt_fkkcl_extended_cr TYPE STANDARD TABLE OF ty_fkkcl_extended_cr WITH DEFAULT KEY,
           tra_soa_reference    TYPE RANGE OF yel_tb_clear_soa-soa_reference.

    TYPES: BEGIN OF ty_docs_in_group_with_amount.
    TYPES: yybitref          TYPE dfkkop-yybitref,
           yyintref          TYPE dfkkop-yyintref,
           yyendorsementref  TYPE dfkkko-yyendorsementref,
           yypremium_id      TYPE dfkkko-yypremium_id,
           yyinstallment_num TYPE dfkkop-yyinstallment_num,
           members           TYPE tt_fkkcl_extended_pr.
    TYPES: END OF ty_docs_in_group_with_amount.

    TYPES: BEGIN OF ty_crdocs_in_group_with_amount.
    TYPES: yybitref      TYPE dfkkop-yybitref,
           yyintref      TYPE dfkkop-yyintref,
           yyucr         TYPE dfkkko-yyucr,
           yyelsclaimnum TYPE dfkkop-yyelsclaimnum,
           yytr_id       TYPE dfkkko-yytr_id,
           yymember      TYPE dfkkop-yymember,
           members       TYPE tt_fkkcl_extended_pr.
    TYPES: END OF ty_crdocs_in_group_with_amount.

    TYPES: tyr_bp    TYPE RANGE OF  bu_partner,
           tyr_opbel TYPE RANGE OF opbel_kk.


    TYPES: BEGIN OF ty_create_and_clear_fm_params,
             item      TYPE numc3,
             is_fkkko  TYPE fkkko,
             it_fkkcl  TYPE fkkcl_t,
             it_fkkopk TYPE fkkopk_t,
           END OF ty_create_and_clear_fm_params,

           tt_create_and_clear_fm_params TYPE STANDARD TABLE OF ty_create_and_clear_fm_params,

           BEGIN OF ty_fkkcl_cc_ip,
             fkkko TYPE fkkko,
             fkkcl TYPE fkkcl_t,
           END OF ty_fkkcl_cc_ip,
           tt_fkkcl_cc_ip TYPE STANDARD TABLE OF ty_fkkcl_cc_ip.
    TYPES: BEGIN OF ty_opbel,
             opbel TYPE opbel_kk,
           END OF ty_opbel,
           ty_lt_seltab    TYPE STANDARD TABLE OF iseltab WITH DEFAULT KEY,
           ty_lt_fkkcl_int TYPE STANDARD TABLE OF fkkcl WITH DEFAULT KEY,
           ty_lt_fkkcl_all TYPE STANDARD TABLE OF fkkcl WITH DEFAULT KEY,
           tt_opbel        TYPE STANDARD TABLE OF ty_opbel WITH KEY opbel,

           BEGIN OF ty_doc_detail,
             opbel    TYPE opbel_kk,
             opupk    TYPE opupk_kk,
             opupz    TYPE opupz_kk,
             opupw    TYPE opupw_kk,
             yybitref TYPE yybitref,
           END OF ty_doc_detail.

    TYPES: BEGIN OF ty_claimfund,
             company_code         TYPE char04,
             fica_document_number TYPE char12,
             document_type        TYPE char2,
             pool_uwy_name        TYPE char4,
             pool_name            TYPE char13,
             profit_center        TYPE char10,
             claim_reference_no   TYPE char35,
             member_bpid          TYPE char20,
             member_name          TYPE char255,
             fronter_bpid         TYPE char30,
             payer_bpid           TYPE char10,
             payer_name           TYPE char255,
             waers                TYPE char5,
             uwy                  TYPE char13,
             fronter_name         TYPE char30,
             amount_betrw         TYPE betrw_kk,
             amount_betrh         TYPE betrw_kk,
           END OF ty_claimfund,
           tt_claimfund TYPE STANDARD TABLE OF ty_claimfund WITH DEFAULT KEY,

           BEGIN OF ty_fica_document_number,
             fica_document_number TYPE char12,
           END OF ty_fica_document_number.


    CLASS-DATA: at_bpdetail TYPE STANDARD TABLE OF but000.
    CLASS-METHODS get_open_items
      IMPORTING
        iv_no_enqueue   TYPE boole_d DEFAULT 'X'
        it_dfkkop_opbel TYPE tt_opbel
        it_where        TYPE tt_rsdswhere OPTIONAL
      EXPORTING
        et_fkkcl_all    TYPE ty_lt_fkkcl_all
      EXCEPTIONS
        open_item_select_error.
    CLASS-METHODS get_bp_name
      IMPORTING
                iv_bp_id          TYPE but000-partner
                ir_bp_list        TYPE tyr_bp
      RETURNING VALUE(rv_bp_name) TYPE but000-name1_text.

    CLASS-METHODS get_premiumreceivables
      IMPORTING
        is_selectionparameters TYPE  zcl_clearingapplicati_dpc_ext=>ty_selection_filters
      EXPORTING
        et_clearingop          TYPE zcl_clearingapplicati_mpc=>tt_clearingop
      EXCEPTIONS
        open_item_select_error.
    CLASS-METHODS get_premiumpayables
      IMPORTING
        is_selectionparameters TYPE  zcl_clearingapplicati_dpc_ext=>ty_prepay_selection_filters
      EXPORTING
        et_clearingop          TYPE zcl_clearingapplicati_mpc=>tt_clearingop
      EXCEPTIONS
        open_item_select_error.

    CLASS-METHODS get_claimreceivables
      IMPORTING
        is_selectionparameters TYPE  zcl_clearingapplicati_dpc_ext=>ty_claimrec_selection_filters
      EXPORTING
        et_clearingop          TYPE zcl_clearingapplicati_mpc=>tt_crclearingop
      EXCEPTIONS
        open_item_select_error.
    CLASS-METHODS get_claimpayables
      IMPORTING
        is_selectionparameters TYPE  zcl_clearingapplicati_dpc_ext=>ty_selection_filters
      EXPORTING
        et_clearingop          TYPE zcl_clearingapplicati_mpc=>tt_clearingop
      EXCEPTIONS
        open_item_select_error.

    CLASS-METHODS get_payerpayee
      IMPORTING
                ira_extref           TYPE zcl_clearingapplicati_dpc_ext=>tra_extref
                ira_umr              TYPE zcl_clearingapplicati_dpc_ext=>tra_umr
                ispayerrequested     TYPE boolean
      RETURNING VALUE(rt_payerpayee) TYPE zcl_clearingapplicati_dpc_ext=>tt_bp.

    CLASS-METHODS convert_to_local_currency
      IMPORTING date                TYPE dats
                iv_foreign_amount   TYPE     betrw_kk
                iv_foreign_currency TYPE blwae_kk
                iv_local_currency   TYPE blwae_kk
                iv_rate             TYPE kursf_kk
      RETURNING VALUE(rv_amount)    TYPE betrw_kk.

    CLASS-METHODS convert_to_foreign_currency
      IMPORTING date                TYPE dats
                iv_foreign_currency TYPE blwae_kk
                iv_local_amount     TYPE     betrw_kk
                iv_local_currency   TYPE blwae_kk
                iv_rate             TYPE kursf_kk OPTIONAL
      RETURNING VALUE(rv_amount)    TYPE betrw_kk.

    CLASS-METHODS get_soa_data
      IMPORTING
        ira_soa_reference TYPE tra_soa_reference
      CHANGING
        cs_clearingop     TYPE zcl_clearingapplicati_mpc=>ts_clearingop.

    CLASS-METHODS check_soa_data_before_save
      IMPORTING
        it_clearingop             TYPE zcl_clearingapplicati_mpc=>tt_updatesoatable
      EXPORTING
        ev_is_new_soa_available   TYPE boole_d
        ev_is_no_data_to_be_saved TYPE boole_d
        ev_is_soa_ref_empty_error TYPE boole_d
        ev_all_ok_to_save         TYPE boole_d
        ev_soa_new_ids            TYPE string.

    CLASS-METHODS save_soa_data
      IMPORTING
                it_clearingop TYPE zcl_clearingapplicati_mpc=>tt_updatesoatable
      EXPORTING et_clearingop TYPE zcl_clearingapplicati_mpc=>tt_updatesoatable.

    CLASS-METHODS clear_soa_table
      IMPORTING
        it_clearsoatable TYPE zcl_clearingapplicati_mpc=>tt_clearsoatable.

    CLASS-METHODS get_total_amount_in_orig_curr
      IMPORTING
                it_fkkcl         TYPE tt_fkkcl_extended_pr
      RETURNING VALUE(rv_amount) TYPE betrw_kk.
    CLASS-METHODS get_premium_type
      IMPORTING
                is_fkkcl              TYPE ty_fkkcl_extended_pr
      RETURNING VALUE(rv_premiumtype) TYPE char50.

    CLASS-METHODS create_doc_and_clear_testmode
      IMPORTING
        iv_purpose              TYPE char2
        it_cdc                  TYPE ztcdcmany
      EXPORTING
        VALUE(et_cdc_fm_params) TYPE tt_create_and_clear_fm_params
      CHANGING
        VALUE(cv_status)        TYPE char10
        VALUE(ct_return)        TYPE zttficamanyret
        VALUE(cv_err_flg)       TYPE char1.
    CLASS-METHODS create_doc_and_clear
      IMPORTING
        VALUE(it_cdc_fm_params) TYPE tt_create_and_clear_fm_params
        VALUE(it_fica_create)   TYPE ztficamany
        VALUE(it_cdc)           TYPE ztcdcmany
        VALUE(purpose)          TYPE char02
      EXPORTING
        VALUE(et_cdc)           TYPE ztcdcmany
      CHANGING
        VALUE(cv_status)        TYPE char10
        VALUE(ct_return)        TYPE zttficamanyret
        VALUE(cv_err_flg)       TYPE char1.

    CLASS-METHODS update_cp_soa_tables
      IMPORTING
        purpose     TYPE char02
        it_add_info TYPE ztfkkcl_addinfo.

    CLASS-METHODS update_payref_tables
      IMPORTING
        iv_opbel    TYPE opbel_kk
        it_add_info TYPE ztfkkcl_addinfo.
    CLASS-METHODS conv_fica_ldgr_amn_to_sap_bapi
      IMPORTING
        iv_currency    TYPE blwae_kk
      CHANGING
        ct_fica_ledger TYPE bapidfkkopk_tab.

    CLASS-METHODS conv_fica_pp_amn_to_sap_bapi
      IMPORTING
        iv_currency TYPE blwae_kk
      CHANGING
        ct_fica_pp  TYPE bapidfkkop_tab.

    CLASS-METHODS perform_auto_clearing_for_cr
      IMPORTING
        iv_testrun  TYPE abap_bool
        iv_item_no  TYPE i OPTIONAL
        is_cc_doc   TYPE ty_doc_detail
        is_add_info TYPE zsfkkcl_addinfo
      EXPORTING
        es_return   TYPE zstficamanyret
        ev_err_flg  TYPE char1.
    CLASS-METHODS perform_documents_reversal
      IMPORTING
        it_docs   TYPE tyr_opbel
      EXPORTING
        et_return TYPE zttficamanyret.
    CLASS-METHODS perform_claimfund_clearing
      CHANGING
        ct_input      TYPE zttclaimfundclear
        cv_error_flag TYPE char1
        ct_return     TYPE bapireturn_t.
    CLASS-METHODS perform_premiumoffset_clearing
      CHANGING
        ct_input      TYPE zttclaimfundclear
        cv_error_flag TYPE char1
        ct_return     TYPE bapireturn_t.

    CLASS-METHODS construct_offset_config_where
      IMPORTING
                is_config      TYPE yel_clmoffsetcfg
                iv_postingdate TYPE budat
      CHANGING  cv_where       TYPE string.

    CLASS-METHODS get_startenddate_for_quarter
      IMPORTING
                iv_postingdate TYPE budat
      CHANGING  cv_where       TYPE string.

    CLASS-METHODS conv_any_to_jsonstring
      IMPORTING
                im_data          TYPE any
      RETURNING VALUE(rv_string) TYPE string.

    CLASS-METHODS convert_amn_sap_to_display
      IMPORTING
                iv_original_currency TYPE waers_curc
                iv_amount_in_sap     TYPE dec11_4
      RETURNING VALUE(rv_amount)     TYPE dec11_4.
    CLASS-METHODS get_reconciliation_key
      IMPORTING
        iv_key          TYPE char02
        iv_commit      TYPE boolean DEFAULT ''
      returning value(rv_reconkey)
            TYPE fikey_kk.

    CLASS-DATA: av_bankstat_um_hvorg      TYPE dfkkop-hvorg,
                av_originalcurr_xratediff TYPE RANGE OF blwae_kk.

    CONSTANTS: ac_sign_i                      TYPE char1 VALUE 'I',
               ac_option_eq                   TYPE char2 VALUE 'EQ',
               ac_option_cp                   TYPE char2 VALUE 'CP',
               ac_fi_bankstat_um_hvorg        TYPE char50 VALUE 'YEL_FI_BANKSTAT_UM_HVORG',
               ac_char_success                TYPE char10 VALUE 'Success',
               ac_char_failed                 TYPE char10 VALUE 'Failed',
               ac_message_type_error          TYPE char1 VALUE 'E',
               ac_message_type_information    TYPE char1 VALUE 'I',
               ac_message_type_success        TYPE char1 VALUE 'S',
               ac_dest_btpelescoext_authtoken TYPE char50 VALUE 'BTP_ELESCO_EXTENSION_OAUTH',
               ac_dest_btpelsecoextension_srv TYPE char50 VALUE 'BTP_ELESCO_EXTENSION_SRV'
               .

PROTECTED SECTION.

  PRIVATE SECTION.

    CLASS-DATA: at_amn1 TYPE REF TO data,
                at_amn2 TYPE REF TO data.

    TYPES:
      ty_lt_soa_data_new TYPE STANDARD TABLE OF yel_tb_clear_soa WITH DEFAULT KEY,
      ty_lt_soa_data_mod TYPE STANDARD TABLE OF yel_tb_clear_soa WITH DEFAULT KEY.
    CLASS-METHODS soa_save_check_wrapper
      IMPORTING
        it_clearingop   TYPE zcl_clearingapplicati_mpc=>tt_updatesoatable
      EXPORTING
        ev_soa_new_ids  TYPE string
        et_soa_new      TYPE zcl_clearingapplicati_dpc_ext=>tt_soa_new
      CHANGING
        ct_soa_data_new TYPE ty_lt_soa_data_new
        ct_soa_data_mod TYPE ty_lt_soa_data_mod.

    CLASS-METHODS get_roe_tr
      IMPORTING
        is_clearingop TYPE zcl_clearingapplicati_mpc=>ts_clearingop
      EXPORTING
        iv_roe_tr     TYPE kursf_kk.
    CLASS-METHODS process_cdc_clearing_in_batch
      IMPORTING
        it_batch_add_info TYPE ztfkkcl_addinfo
        is_cdc            TYPE zscdcmany
        iv_recon_key      TYPE fikey_kk
      CHANGING
        ct_return         TYPE zttficamanyret
        cv_err_flg        TYPE char1
        et_cdc_fm_params  TYPE  tt_create_and_clear_fm_params.
    TYPES:
      ty_ra_hvorg TYPE RANGE OF dfkkop-hvorg.
    CLASS-METHODS set_claim_receivables_data
      IMPORTING
        ira_hvorg             TYPE ty_ra_hvorg
        it_fkkcl_extended_all TYPE tt_fkkcl_extended_cr
        is_fkkcl              TYPE zcl_clearingapp_services=>ty_fkkcl_extended_cr
      CHANGING
        cs_clearingop         TYPE zcl_clearingapplicati_mpc=>ts_crclearingop.




    CLASS-METHODS get_open_items_w_opupk_filter
      IMPORTING
        it_opbel_with_items TYPE dfkkop_t
        iv_no_enqueue       TYPE boole_d DEFAULT 'X'
        it_dfkkop_opbel     TYPE tt_opbel
      EXPORTING
        et_fkkcl_all        TYPE ty_lt_fkkcl_all
      EXCEPTIONS
        open_item_select_error.

    CLASS-METHODS validate_claim_fund_clearamn
      IMPORTING
        it_fkkcl           TYPE fkkcl_t
        iv_posting_date    TYPE dats
        iv_settlement_curr TYPE blwae_kk
        iv_yybitref        TYPE yybitref
      EXPORTING
        ev_error_flag      TYPE boole_d.


    CLASS-METHODS validate_claim_offset_clearamn
      IMPORTING
        iv_posting_date    TYPE dats
        iv_settlement_curr TYPE blwae_kk
        iv_yybitref        TYPE yybitref
      EXPORTING
        ev_error_flag      TYPE boole_d
      CHANGING
        ct_fkkcl           TYPE fkkcl_t.

    CLASS-METHODS fetch_data_claim_offset_view
      IMPORTING
                iv_where_condition   TYPE string
                iv_settlement_curr   TYPE blwae_kk
                iv_posting_date      TYPE sy-datum
                iv_amn_to_be_cleared TYPE betrh_kk
                iv_yybitref          TYPE yybitref
      RETURNING VALUE(rt_dfkkop)
                  TYPE dfkkop_t.



    CLASS-METHODS perform_bulk_clearing_in_fm
      IMPORTING
        it_fkkcl_cc_ip TYPE tt_fkkcl_cc_ip
      CHANGING
        cv_error_flag  TYPE char1
        ct_return      TYPE bapireturn_t.

    CLASS-METHODS init_claim_clearing_process
      IMPORTING
        it_fkkcl       TYPE zcl_clearingapp_services=>ty_lt_fkkcl_all
        iv_tabix       TYPE syst-tabix
        iv_dm_yybitref TYPE dfkkop-yybitref
        iv_dm_opbel    TYPE dfkkop-opbel
        iv_dm_betrw    TYPE dfkkop-betrw
      CHANGING
        cv_error_flag  TYPE char1
        ct_return      TYPE bapireturn_t
        cs_input       TYPE zsclaimfundclear.



ENDCLASS.



CLASS zcl_clearingapp_services IMPLEMENTATION.


  METHOD check_soa_data_before_save.


    DATA: lt_soa_data_new TYPE TABLE OF yel_tb_clear_soa,
          lt_soa_data_mod TYPE TABLE OF yel_tb_clear_soa,
          lt_soa_new      TYPE zcl_clearingapplicati_dpc_ext=>tt_soa_new,

          ls_soa_data_old TYPE yel_tb_clear_soa,
          ls_soa_data     TYPE yel_tb_clear_soa,

          lv_lines        TYPE i,
          lv_message      TYPE string,
          lv_answer       TYPE c.

    CLEAR: lt_soa_data_new[],
           lt_soa_data_mod[].

    soa_save_check_wrapper(
      EXPORTING
        it_clearingop = it_clearingop
      IMPORTING
        ev_soa_new_ids = ev_soa_new_ids
        et_soa_new     = lt_soa_new
      CHANGING
        ct_soa_data_new = lt_soa_data_new
        ct_soa_data_mod = lt_soa_data_mod ).





    IF lt_soa_data_new[] IS INITIAL AND
        lt_soa_data_mod[] IS INITIAL.
      ev_is_no_data_to_be_saved = abap_true.
      RETURN.
    ELSE.
      "If data will be saved to SOA table, we check that there are no empty SOA references
      DATA(lt_soa_aux) = lt_soa_data_new[].
      DELETE lt_soa_aux WHERE soa_reference IS NOT INITIAL.
      DESCRIBE TABLE lt_soa_aux LINES lv_lines.

      IF lv_lines GT 0.
        ev_is_soa_ref_empty_error = abap_true.
        RETURN.
      ENDIF.

      "If a new SOA reference is being added to an entry that already has one,
      "we ask for confirmation before saving
      IF lt_soa_new IS NOT INITIAL.
        ev_is_new_soa_available = abap_true.

        RETURN.
      ENDIF.
      ev_all_ok_to_save = abap_true.
    ENDIF.



  ENDMETHOD.


  METHOD clear_soa_table.


    LOOP AT it_clearsoatable ASSIGNING FIELD-SYMBOL(<fs_clearsoatable>).

      UPDATE yel_tb_clear_soa SET soa_reference    = ''
                                             soa_line_id      = ''
                                             clearable_amount = 0
                                             soa_comments     = ''
                                             clearable        = ''
                                            WHERE opbel   EQ <fs_clearsoatable>-opbel
                                            AND opupw   EQ <fs_clearsoatable>-opupw
                                            AND opupk   EQ <fs_clearsoatable>-opupk
                                            AND opupz   EQ <fs_clearsoatable>-opupz
                                            AND int_ref EQ <fs_clearsoatable>-int_ref.
      IF sy-subrc EQ 0.
        COMMIT WORK AND WAIT.
      ENDIF.

    ENDLOOP.


  ENDMETHOD.


  METHOD convert_to_foreign_currency.

    DATA: lv_amount_disp  TYPE dec11_4,
           lv_local_amount TYPE betrw_kk.

    IF iv_foreign_currency EQ iv_local_currency.
      " Convert amount considering the real decimals places
      MOVE iv_local_amount TO lv_amount_disp.
      CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        EXPORTING
          currency        = iv_local_currency
          amount_internal = lv_amount_disp
        IMPORTING
          amount_display  = lv_amount_disp
        EXCEPTIONS
          internal_error  = 1
          OTHERS          = 2.
      IF sy-subrc <> 0.
      ENDIF.
      MOVE lv_amount_disp TO rv_amount.
      RETURN.
    ENDIF.

    DATA(lv_date) = COND dats( WHEN date IS INITIAL THEN sy-datum ELSE date ).

    " Convert the amount to SAP Amount
    MOVE iv_local_amount TO lv_amount_disp .
    CALL FUNCTION 'CURRENCY_AMOUNT_DISPLAY_TO_SAP'
      EXPORTING
        currency        = iv_local_currency                " Currency indicator
        amount_display  = lv_amount_disp                " DE-EN-LANG-SWITCH-NO-TRANSLATION
      IMPORTING
        amount_internal = lv_amount_disp                 " Internal Format
      EXCEPTIONS
        internal_error  = 1                " DE-EN-LANG-SWITCH-NO-TRANSLATION
        OTHERS          = 2.
    IF sy-subrc <> 0.
    ENDIF.
    MOVE lv_amount_disp TO lv_local_amount.

    CALL FUNCTION 'CONVERT_TO_FOREIGN_CURRENCY'
      EXPORTING
*       client           = SY-MANDT
        date             = lv_date               " Currency translation date
        foreign_currency = iv_foreign_currency
        local_amount     = lv_local_amount
        local_currency   = iv_local_currency                 " Currency key for local currency
        rate             = iv_rate                " Predefined exchange rate
        "type_of_rate     = 'M'              " Type of rate M=Average rate G=Bank buying rate B=bank sellin
      IMPORTING
        foreign_amount   = rv_amount                 " Amount in local currency
      EXCEPTIONS
        no_rate_found    = 1                " No exch.rate entered in table TCURR
        overflow         = 2                " LOCAL_AMOUNT field is too small
        no_factors_found = 3                " No conversion factors in TCURF
        no_spread_found  = 4                " No spread entered in table TCURS
        derived_2_times  = 5                " Exchange rate type derived more than once
        OTHERS           = 6.
    IF sy-subrc EQ 0.
      MOVE rv_amount TO lv_amount_disp.
      " Convert amount considering the real decimals places
      CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        EXPORTING
          currency        = iv_foreign_currency
          amount_internal = lv_amount_disp
        IMPORTING
          amount_display  = lv_amount_disp
        EXCEPTIONS
          internal_error  = 1
          OTHERS          = 2.
      IF sy-subrc <> 0.
      ENDIF.
    ENDIF.

    MOVE lv_amount_disp TO rv_amount.


  ENDMETHOD.


  METHOD convert_to_local_currency.

    DATA: lv_amount_disp    TYPE dec11_4,
          lv_foreign_amount TYPE betrw_kk.

    IF iv_foreign_currency EQ iv_local_currency.

      " Convert amount considering the real decimals places
      MOVE iv_foreign_amount TO lv_amount_disp.
      CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        EXPORTING
          currency        = iv_local_currency
          amount_internal = lv_amount_disp
        IMPORTING
          amount_display  = lv_amount_disp
        EXCEPTIONS
          internal_error  = 1
          OTHERS          = 2.
      IF sy-subrc <> 0.
      ENDIF.
      MOVE lv_amount_disp TO rv_amount.
      RETURN.

    ENDIF.

    " Convert the amount to SAP Amount
    MOVE iv_foreign_amount TO lv_amount_disp .
    CALL FUNCTION 'CURRENCY_AMOUNT_DISPLAY_TO_SAP'
      EXPORTING
        currency        = iv_foreign_currency                " Currency indicator
        amount_display  = lv_amount_disp                " DE-EN-LANG-SWITCH-NO-TRANSLATION
      IMPORTING
        amount_internal = lv_amount_disp                 " Internal Format
      EXCEPTIONS
        internal_error  = 1                " DE-EN-LANG-SWITCH-NO-TRANSLATION
        OTHERS          = 2.
    IF sy-subrc <> 0.
    ENDIF.

    MOVE lv_amount_disp TO lv_foreign_amount.


    DATA(lv_date) = COND dats( WHEN date IS INITIAL THEN sy-datum ELSE date ).

    CALL FUNCTION 'CONVERT_TO_LOCAL_CURRENCY'
      EXPORTING
*       client           = SY-MANDT
        date             = lv_date               " Currency translation date
        foreign_amount   = lv_foreign_amount                 " Amount in foreign currency
        foreign_currency = iv_foreign_currency                 " Currency key for foreign currency
        local_currency   = iv_local_currency                 " Currency key for local currency
        rate             = iv_rate                " Predefined exchange rate
        type_of_rate     = 'M'              " Type of rate M=Average rate G=Bank buying rate B=bank sellin
      IMPORTING
        local_amount     = rv_amount                 " Amount in local currency
      EXCEPTIONS
        no_rate_found    = 1                " No exch.rate entered in table TCURR
        overflow         = 2                " LOCAL_AMOUNT field is too small
        no_factors_found = 3                " No conversion factors in TCURF
        no_spread_found  = 4                " No spread entered in table TCURS
        derived_2_times  = 5                " Exchange rate type derived more than once
        OTHERS           = 6.
    IF sy-subrc EQ 0.
      MOVE rv_amount TO lv_amount_disp.
      " Convert amount considering the real decimals places
      CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        EXPORTING
          currency        = iv_local_currency
          amount_internal = lv_amount_disp
        IMPORTING
          amount_display  = lv_amount_disp
        EXCEPTIONS
          internal_error  = 1
          OTHERS          = 2.
      IF sy-subrc <> 0.
      ENDIF.
    ENDIF.

    MOVE lv_amount_disp TO rv_amount.

  ENDMETHOD.


  METHOD conv_fica_ldgr_amn_to_sap_bapi.

    DATA:    lv_amount TYPE bapicurr_d.
    " Clearing Process Specific -> Convert Amount to SAP BAPI
    LOOP AT ct_fica_ledger ASSIGNING FIELD-SYMBOL(<fs_fica_ledger>).
      CLEAR lv_amount.
      lv_amount = <fs_fica_ledger>-amount.
      CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_BAPI'
        EXPORTING
          currency    = iv_currency
          sap_amount  = lv_amount
        IMPORTING
          bapi_amount = lv_amount.
      <fs_fica_ledger>-amount = lv_amount.
    ENDLOOP.

  ENDMETHOD.

  METHOD conv_fica_pp_amn_to_sap_bapi.

    DATA:    lv_amount TYPE bapicurr_d.
    " Clearing Process Specific -> Convert Amount to SAP BAPI
    LOOP AT ct_fica_pp ASSIGNING FIELD-SYMBOL(<fs_pp>).
      CLEAR lv_amount.
      lv_amount = <fs_pp>-amount.
      CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_BAPI'
        EXPORTING
          currency    = iv_currency
          sap_amount  = lv_amount
        IMPORTING
          bapi_amount = lv_amount.
      <fs_pp>-amount = lv_amount.
    ENDLOOP.

  ENDMETHOD.


  METHOD create_doc_and_clear.

    " Called only when clearing process is done against UIM.
    " Ideally this will have only one document created for N number UIM items cleared against.


    DATA: recon_key TYPE fikey_kk,
          lt_seltab TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl  TYPE STANDARD TABLE OF fkkcl,
          lv_count  TYPE sy-index,
          l_doc     TYPE opbel_kk,
          ls_ret    LIKE LINE OF ct_return.
    DATA(lo_xml) = NEW zcl_xml_util(  ).


    LOOP AT it_cdc_fm_params INTO DATA(is_cdc_fm_params).



      CALL FUNCTION 'FKK_CREATE_DOC_AND_CLEAR'
        EXPORTING
          i_fkkko       = is_cdc_fm_params-is_fkkko
          i_fkkopl_cf   = 'X'
          i_update_task = ''
        IMPORTING
          e_opbel       = l_doc
        TABLES
          t_fkkopk      = is_cdc_fm_params-it_fkkopk
          t_fkkcl       = is_cdc_fm_params-it_fkkcl.

      IF l_doc IS INITIAL.
        cv_err_flg = 'X'.
        ls_ret-message_type = ac_message_type_error.
        cv_status = 'Error'.
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
        RETURN.
      ELSE.
        ls_ret-message_type = ac_message_type_success.
        ls_ret-message = | Document { l_doc } created| .
        cv_status = 'Success'.

        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'.
      ENDIF.

      ls_ret-item = is_cdc_fm_params-item.
      ls_ret-document_number = l_doc.
      "ls_ret-type = 'FICACREATEANDCLEAR'.
      APPEND ls_ret TO ct_return.
      CLEAR : ls_ret .

      " Update Log Table
      DATA(ls_log) = VALUE ytficadoclog( guid = cl_system_uuid=>if_system_uuid_rfc4122_static~create_uuid_c36_by_version( version = 4 )
                                         crdate = sy-datum cdtime = sy-uzeit testmode = '' ).


      lo_xml->abap_to_xml(
        EXPORTING
          im_data    = it_cdc[ item = is_cdc_fm_params-item  ]
        IMPORTING
                ex_content = DATA(ls_xtring)
      ).


      CALL FUNCTION 'HR_KR_XSTRING_TO_STRING'
        EXPORTING
          in_xstring = ls_xtring
        IMPORTING
          out_string = ls_log-payload.

      INSERT  ytficadoclog FROM ls_log.
      COMMIT WORK AND WAIT.

    ENDLOOP.



    " Update SOA Tables
    IF cv_status = 'Success'.
      LOOP AT it_cdc ASSIGNING FIELD-SYMBOL(<fs_cdc>).
        zcl_clearingapp_services=>update_cp_soa_tables( purpose = purpose it_add_info = <fs_cdc>-it_add_info   ).
      ENDLOOP.

      " Called only when clearing process is done against UIM.
      DATA(lt_add_info) = VALUE ztfkkcl_addinfo( FOR <fs_line> IN it_fica_create
                                  FOR <fs_in> IN <fs_line>-it_add_info ( CORRESPONDING #( <fs_in> ) ) ).
      lt_add_info = VALUE #( BASE lt_add_info FOR <fs_cdc_1> IN it_cdc
                           FOR <fs_in> IN <fs_cdc_1>-it_add_info ( CORRESPONDING #( <fs_in> ) ) ).

      SORT lt_add_info BY trtype.
      IF line_exists( lt_add_info[ trtype = 'Unallocated Insurance Monies' ] ) .
        zcl_clearingapp_services=>update_payref_tables(
          EXPORTING
            iv_opbel    = l_doc
            it_add_info = lt_add_info
        ).
      ENDIF.
    ENDIF.




  ENDMETHOD.


  METHOD create_doc_and_clear_testmode.

    DATA: recon_key         TYPE fikey_kk,
          lt_seltab         TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl          TYPE STANDARD TABLE OF fkkcl,
          lv_count          TYPE sy-index,
          l_doc             TYPE opbel_kk,
          ls_ret            LIKE LINE OF ct_return,
          lt_fkkopk         TYPE STANDARD TABLE OF fkkopk,
          ls_fkkopk         TYPE fkkopk,
          lv_opupk          TYPE opupk_kk,
          ls_fkkko          TYPE fkkko,
          gl_account(10)
          ,
          lv_counter        TYPE i,
          lt_batch_add_info TYPE STANDARD TABLE OF zsfkkcl_addinfo.

    DATA(lo_xml) = NEW zcl_xml_util(  ).

    " For Premium Payables, Create Document and clear them.
    DATA(lv_where) = COND string( WHEN iv_purpose = 'PP' OR iv_purpose = 'CP' THEN '' ELSE `trtype EQ 'Unallocated Insurance Monies'`  ).

    LOOP AT it_cdc INTO DATA(ls_cdc).
      CLEAR: lv_counter, lt_batch_add_info.

      LOOP AT ls_cdc-it_add_info ASSIGNING FIELD-SYMBOL(<fs_fkkcl_ai>) WHERE (lv_where).
        lv_counter = lv_counter + 1.
        APPEND <fs_fkkcl_ai> TO lt_batch_add_info.

        IF lv_counter MOD 4999 = 0 OR lv_counter = lines( ls_cdc-it_add_info ).

          " Initially Create FIKey
          CALL FUNCTION 'ZF_BAPI_CTRACRECKEY'
            EXPORTING
              i_key      = ls_cdc-recon_key_prefix
              commit     = 'X'
            IMPORTING
              o_reconkey = recon_key.

          " Set FIKEY
          ls_cdc-is_fkkko-fikey = recon_key.

          " Process the batch
          zcl_clearingapp_services=>process_cdc_clearing_in_batch(
            EXPORTING
              it_batch_add_info = lt_batch_add_info
              is_cdc            = ls_cdc
              iv_recon_key      = recon_key
            CHANGING
              ct_return         = ct_return
              cv_err_flg        = cv_err_flg
              et_cdc_fm_params  = et_cdc_fm_params
          ).
          CLEAR: lt_batch_add_info.
        ENDIF.
      ENDLOOP.

      " Update Log Table (keep this part as it is)
      DATA(ls_log) = VALUE ytficadoclog( guid = cl_system_uuid=>if_system_uuid_rfc4122_static~create_uuid_c36_by_version( version = 4 )
                                         crdate = sy-datum cdtime = sy-uzeit testmode = 'X' ).

      lo_xml->abap_to_xml(
        EXPORTING
          im_data    = ls_cdc
        IMPORTING
                ex_content = DATA(ls_xtring)
      ).

      CALL FUNCTION 'HR_KR_XSTRING_TO_STRING'
        EXPORTING
          in_xstring = ls_xtring
        IMPORTING
          out_string = ls_log-payload.

      INSERT ytficadoclog FROM ls_log.
      COMMIT WORK AND WAIT.
    ENDLOOP.

  ENDMETHOD.


  METHOD get_bp_name.

    IF at_bpdetail IS NOT INITIAL.

      SELECT * FROM but000
      INTO TABLE @at_bpdetail
       WHERE partner IN @ir_bp_list.
    ENDIF.

    DATA: ls_but000 TYPE but000.

    READ TABLE at_bpdetail INTO ls_but000 WITH KEY partner = iv_bp_id BINARY SEARCH.
    IF sy-subrc IS INITIAL.
      CASE ls_but000-type.
        WHEN 1.
          CONCATENATE ls_but000-name_last ls_but000-name_first ls_but000-name_lst2 ls_but000-name_last2
                 INTO rv_bp_name SEPARATED BY space.
        WHEN 2.
          CONCATENATE ls_but000-name_org1 ls_but000-name_org2 ls_but000-name_org3 ls_but000-name_org4
                 INTO rv_bp_name SEPARATED BY space.
      ENDCASE.
    ELSE.
      SELECT SINGLE * FROM but000 WHERE partner = @iv_bp_id INTO @ls_but000.
      IF sy-subrc IS INITIAL.
        CASE ls_but000-type.
          WHEN 1.
            CONCATENATE ls_but000-name_last ls_but000-name_first ls_but000-name_lst2 ls_but000-name_last2
                   INTO rv_bp_name SEPARATED BY space.
          WHEN 2.
            CONCATENATE ls_but000-name_org1 ls_but000-name_org2 ls_but000-name_org3 ls_but000-name_org4
                   INTO rv_bp_name SEPARATED BY space.
        ENDCASE.
      ENDIF.
    ENDIF.



  ENDMETHOD.


  METHOD get_claimreceivables.

    TYPES: ty_businesspartners TYPE STANDARD TABLE OF char10,
           tt_fkkcl            TYPE STANDARD TABLE OF fkkcl WITH DEFAULT KEY.


    DATA: ra_hvorg         TYPE RANGE OF dfkkop-hvorg,
          ra_extref        TYPE RANGE OF char35,
          ra_bp            TYPE RANGE OF but000-partner,
          ra_ucr           TYPE RANGE OF dfkkko-yyucr,
          lt_seltab        TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl_int     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_all     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_po_en   TYPE STANDARD TABLE OF fkkcl,
          ra_pay_hvorg     TYPE RANGE OF dfkkop-hvorg,
          ra_soa_reference TYPE tra_soa_reference,
          lv_start_index   TYPE sy-tabix,
          lv_end_index     TYPE sy-tabix,
          lv_count         TYPE sy-tabix,
          lv_total_records TYPE i,
          sum_betrh        TYPE fkkcl-betrh,
          sum_betrw        TYPE fkkcl-betrw,
          ra_elsclaimnum   TYPE RANGE OF dfkkop-yyelsclaimnum,
          ra_transref      TYPE RANGE OF dfkkko-yytr_id.


    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fill Range Tables & Fetch Relevant Custom Table Data & Fetch Documents
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""



    DATA(lt_dfkkop_opbel) = VALUE tt_opbel( ).
    DATA(lt_dfkkop_opbel_uim) = VALUE tt_opbel( ).

    " Fill Selection Values in Range Tables
    ra_extref = VALUE #( FOR ls_extref IN is_selectionparameters-externalreferencenumbers sign = ac_sign_i option = ac_option_eq ( low = ls_extref ) ).

    ra_bp = VALUE #( FOR ls_bp IN is_selectionparameters-businesspartners sign = ac_sign_i option = ac_option_eq ( low = ls_bp ) ).

    ra_elsclaimnum = VALUE #( FOR ls_claimid IN is_selectionparameters-claimids sign = ac_sign_i option = ac_option_eq
     ( low = ls_claimid  ) ).

    ra_transref = VALUE #( FOR ls_tr_id IN is_selectionparameters-transrefs sign = ac_sign_i option = ac_option_eq
    ( low = ls_tr_id  ) ).

    ra_ucr = VALUE #( FOR ls_ucr IN is_selectionparameters-ucrnumbers sign = ac_sign_i option = ac_option_eq
    ( low = ls_ucr  )   ).

    " Get Documents based on the selection
    SELECT DISTINCT dfkkop~opbel FROM
    dfkkop
    INNER JOIN dfkkko AS header
    ON dfkkop~opbel = header~opbel
    INTO TABLE @lt_dfkkop_opbel
    WHERE dfkkop~yyextref IN @ra_extref
    AND augst = ''
    AND gpart IN @ra_bp
    AND spart = @is_selectionparameters-division
    AND bukrs = @is_selectionparameters-companycode
    AND dfkkop~yyelsclaimnum IN @ra_elsclaimnum
    AND header~yytr_id IN @ra_transref
    AND header~yyucr IN @ra_ucr
    AND ( dfkkop~blart = 'SC' OR dfkkop~blart = 'RC' OR
          ( dfkkop~blart = 'DM' AND dfkkop~pymet IN ( 'C', 'P' ) ) ).
    IF sy-subrc NE 0.
      RETURN.
    ENDIF.


    " Get UnAllocated Insurance Moneys
    SELECT DISTINCT opbel FROM
    dfkkop
    INTO TABLE @lt_dfkkop_opbel_uim
    WHERE augst = ''
    AND waers = @is_selectionparameters-currency
    AND hvorg = 'P210'
    AND gpart IN @ra_bp
    AND spart = @is_selectionparameters-division
    AND bukrs = @is_selectionparameters-companycode.
    IF sy-subrc NE 0.
    ENDIF.


    " Get Payment Operation HVORG
    SELECT 'I' AS sign, 'EQ' AS option, hvorg AS low
    FROM yel_tb_pay_hvorg
    INTO CORRESPONDING FIELDS OF TABLE @ra_hvorg.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fetch Open Items and Map Header Values With It & Remove unwanted Entries
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    get_open_items(
      EXPORTING
      it_dfkkop_opbel = lt_dfkkop_opbel
      IMPORTING
        et_fkkcl_all    = lt_fkkcl_all
         EXCEPTIONS
        open_item_select_error = 1
        ).
    IF sy-subrc NE 0.
      RAISE open_item_select_error .
    ENDIF.
    IF lt_fkkcl_all IS INITIAL.
      RETURN.
    ENDIF.

    DELETE lt_fkkcl_all WHERE spart NE is_selectionparameters-division.

    " Extend with header values
    SELECT opbel, yytr_id, yyucr, yyuway
    FROM dfkkko
    FOR ALL ENTRIES IN @lt_fkkcl_all
    WHERE opbel = @lt_fkkcl_all-opbel
    INTO TABLE @DATA(lt_dfkkko_l).
    IF sy-subrc NE 0.
      RETURN.
    ENDIF.

    TYPES: ls_dfkko_l LIKE LINE OF lt_dfkkko_l.

    DATA(lt_fkkcl_extended_all) = CORRESPONDING tt_fkkcl_extended_cr( lt_fkkcl_all  ).


    LOOP AT lt_fkkcl_extended_all ASSIGNING FIELD-SYMBOL(<fs_fkkcl_extended_all>).

      DATA(ls_dfkkko) = VALUE ls_dfkko_l( lt_dfkkko_l[ opbel = <fs_fkkcl_extended_all>-opbel ] OPTIONAL ).

      <fs_fkkcl_extended_all>-yyucr = ls_dfkkko-yyucr.
      <fs_fkkcl_extended_all>-yytr_id = ls_dfkkko-yytr_id.
      <fs_fkkcl_extended_all>-yyuway = ls_dfkkko-yyuway.
    ENDLOOP.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Group Entries Based on YYBITREF YYINTREF YYELSCLAIMNUM YYTR_ID YYMEMBER
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    DATA: members                        LIKE lt_fkkcl_extended_all,
          ls_fkkclline                   TYPE ty_fkkcl_extended_cr,
          lt_fkkcl_extended              TYPE tt_fkkcl_extended_cr,
          lt_crdocs_in_group_with_amount TYPE STANDARD TABLE OF ty_crdocs_in_group_with_amount.


    SORT lt_fkkcl_extended_all BY  yybitref yyintref yyelsclaimnum yytr_id yymember opbel opupk opupw opupz.

    LOOP AT lt_fkkcl_extended_all ASSIGNING <fs_fkkcl_extended_all>
     GROUP BY (
     yybitref = <fs_fkkcl_extended_all>-yybitref
                                              yyintref = <fs_fkkcl_extended_all>-yyintref
                                              yyelsclaimnum = <fs_fkkcl_extended_all>-yyelsclaimnum
                                              yytr_id = <fs_fkkcl_extended_all>-yytr_id
                                              yymember = <fs_fkkcl_extended_all>-yymember
                                                )
                                               ASSIGNING FIELD-SYMBOL(<group>).

      CLEAR: members, ls_fkkclline.

      LOOP AT GROUP <group> ASSIGNING FIELD-SYMBOL(<fs_fkkcl_extended_all_g>).
        members = VALUE #( BASE members ( <fs_fkkcl_extended_all_g> ) ).
      ENDLOOP.

      lv_count = lines( members ).

      LOOP AT members ASSIGNING FIELD-SYMBOL(<fs_members>).
        APPEND VALUE #( yybitref = <fs_members>-yybitref
                          yyintref = <fs_members>-yyintref
                           yyelsclaimnum = <fs_members>-yyelsclaimnum
                                                yytr_id = <fs_members>-yytr_id
                                                yymember = <fs_members>-yymember
                          members = members  ) TO lt_crdocs_in_group_with_amount.

        ls_fkkclline = CORRESPONDING #( <fs_members> ).
        IF lv_count > 1000.
          ls_fkkclline-opupz = 000.
          ls_fkkclline-opupk = 0000.
          ls_fkkclline-opupw = 000.
        ENDIF.
        EXIT.
      ENDLOOP.

      APPEND ls_fkkclline TO lt_fkkcl_extended.

    ENDLOOP.

    SORT lt_fkkcl_extended BY yybitref yyintref yyucr yyelsclaimnum yytr_id yymember .

    DELETE ADJACENT DUPLICATES FROM lt_fkkcl_extended COMPARING yybitref yyintref yyucr yyelsclaimnum yytr_id yymember.

*    ra_hvorg = VALUE #( ( sign = ac_sign_i option = ac_option_eq low = 'C' )
*    ( sign = ac_sign_i option = ac_option_eq low = 'P' ) ).

    " Fill Members Details into BP Range
    DATA(ra_bp_all) = ra_bp.
    ra_bp_all = VALUE #( BASE ra_bp FOR <fs_fkkcl_temp> IN lt_fkkcl_extended sign = ac_sign_i
       option = ac_option_eq ( low = <fs_fkkcl_temp>-yymember )  ).

    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Construct Claim Receivables Items OP
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


    LOOP AT lt_fkkcl_extended ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

      APPEND INITIAL LINE TO et_clearingop ASSIGNING FIELD-SYMBOL(<fs_clearingop>).

      " Default Mapping Fields
      <fs_clearingop>-ext_ref = <fs_fkkcl>-yyextref.
      <fs_clearingop>-int_ref = <fs_fkkcl>-yyintref.
      <fs_clearingop>-bit_ref = <fs_fkkcl>-yybitref.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-item = <fs_fkkcl>-opupk.
      <fs_clearingop>-rep_item = <fs_fkkcl>-opupw.
      <fs_clearingop>-subitem = <fs_fkkcl>-opupz.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-due_date = <fs_fkkcl>-faedn.
      <fs_clearingop>-vkont = <fs_fkkcl>-vkont.
      <fs_clearingop>-vtref = <fs_fkkcl>-vtref.
      <fs_clearingop>-spart = <fs_fkkcl>-spart.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-due_date = <fs_fkkcl>-faedn.
      <fs_clearingop>-claim_id = <fs_fkkcl>-yyelsclaimnum.
      <fs_clearingop>-tr_ref_num = <fs_fkkcl>-yytr_id.
      <fs_clearingop>-ucr = <fs_fkkcl>-yyucr.
      <fs_clearingop>-member_id = <fs_fkkcl>-yymember.
      <fs_clearingop>-post_date = <fs_fkkcl>-budat.
      <fs_clearingop>-uway = <fs_fkkcl>-yyuway.
      <fs_clearingop>-blart = <fs_fkkcl>-blart.
      <fs_clearingop>-hvorg = <fs_fkkcl>-hvorg.
      <fs_clearingop>-payment_ref = <fs_fkkcl>-xblnr. " check this ?>>>>>>>>>>>>>>
      <fs_clearingop>-profit_center = <fs_fkkcl>-prctr.
      <fs_clearingop>-origin = <fs_fkkcl>-herkf_kk.
      <fs_clearingop>-member_name = zcl_clearingapp_services=>get_bp_name(
         iv_bp_id   = CONV #(  <fs_fkkcl>-yymember )
         ir_bp_list = ra_bp_all ).
      <fs_clearingop>-bp_id =  <fs_fkkcl>-gpart.
      <fs_clearingop>-bp_name  = zcl_clearingapp_services=>get_bp_name(
          iv_bp_id   = <fs_fkkcl>-gpart
          ir_bp_list = ra_bp_all ).
      <fs_clearingop>-coll_type = <fs_fkkcl>-pymet.
      <fs_clearingop>-agreementid = <fs_fkkcl>-yyagreement_id.
      <fs_clearingop>-agreementtype = <fs_fkkcl>-yyatype.
      <fs_clearingop>-stampmemberid = <fs_fkkcl>-yystamp_member_id.
      <fs_clearingop>-frontingagreementid = <fs_fkkcl>-yyfronting_agreement_id.



      """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " Confirmed Fields
      """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      IF <fs_fkkcl>-blart EQ 'SC'.
        <fs_clearingop>-tr_type = 'Salvage Incoming'.
      ELSEIF <fs_fkkcl>-blart EQ 'RC'.
        <fs_clearingop>-tr_type = 'Subrogation Incoming'.
      ELSEIF <fs_fkkcl>-blart EQ 'DM' AND (  <fs_fkkcl>-pymet EQ 'C' OR <fs_fkkcl>-pymet EQ 'P' ).
        <fs_clearingop>-tr_type = 'Claim receivable from Member'.
      ENDIF.
      <fs_clearingop>-orig_curr = <fs_fkkcl>-waers.
      <fs_clearingop>-act_curr_rec = is_selectionparameters-currency.
      <fs_clearingop>-exp_pay_curr = <fs_fkkcl>-yyext_currency.
      <fs_clearingop>-fixed_roe = abap_true.


      """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " Confirmed Fields - ROE_TR, ROE_REC_CURR, AMN, SETT_AMN_ROE_TR, EXP_PAY_AMN
      " Not needed - ROE_TR & SETT_AMN_ROE_TR
      """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

      <fs_clearingop>-roe_tr = COND #(  WHEN <fs_fkkcl>-kursf > 0 THEN <fs_fkkcl>-kursf ELSE <fs_fkkcl>-yyext_roe ) .
      <fs_clearingop>-roe_rec_curr = <fs_clearingop>-roe_tr .


      " AMN
      SELECT SUM( betrw ) AS amount, a~budat
      INTO TABLE @DATA(lt_uncleared_amounts)
      FROM dfkkop AS a
      INNER JOIN dfkkko AS b
      ON a~opbel = b~opbel
      WHERE
      a~augst NE '9'
       AND a~yyextref = @<fs_fkkcl>-yyextref
      AND a~yyintref = @<fs_fkkcl>-yyintref
      AND a~yybitref = @<fs_fkkcl>-yybitref
      AND a~yyelsclaimnum = @<fs_fkkcl>-yyelsclaimnum
      AND b~yytr_id = @<fs_fkkcl>-yytr_id
      "AND a~yymember = @<fs_fkkcl>-yymember
       AND ( a~blart = 'SC' OR a~blart = 'RC' OR
          ( a~blart = 'DM' AND a~pymet IN ( 'C', 'P' ) ) )
      GROUP BY a~budat.
      IF sy-subrc EQ 0.
        SELECT SUM( amount )
           FROM  @lt_uncleared_amounts AS ca
            INTO @<fs_clearingop>-amn.

        <fs_clearingop>-amn =  convert_amn_sap_to_display(
                                             iv_original_currency = <fs_clearingop>-orig_curr
                                             iv_amount_in_sap     = CONV #(   <fs_clearingop>-amn )
                                           ) .

        <fs_clearingop>-amn = abs( <fs_clearingop>-amn ).
      ENDIF.

      " sett_amn_roe_tr & exp_pay_amn
      SELECT  * UP TO 1 ROWS
                        FROM tcurf
                        INTO TABLE @DATA(lt_tcurf)
                        WHERE kurst = 'M'
                        AND fcurr = @<fs_clearingop>-orig_curr
                        AND tcurr = @<fs_clearingop>-exp_pay_curr
                        AND gdatu > '20171231'
                        ORDER BY gdatu DESCENDING
                        .
      IF sy-subrc EQ 0 AND lt_tcurf IS NOT INITIAL.
        DATA(lv_ratio) = lt_tcurf[ 1 ]-ffact.
      ENDIF.
      IF lv_ratio = 0.
        lv_ratio = 1.
      ENDIF.
      <fs_clearingop>-exp_pay_amn = ( <fs_clearingop>-amn * <fs_clearingop>-roe_rec_curr ) / lv_ratio." - not working
      <fs_clearingop>-sett_amn_roe_tr = <fs_clearingop>-exp_pay_amn.
      CLEAR lv_ratio.


      " Apply Existing app logic
*      set_claim_receivables_data(
*            EXPORTING
*              ira_hvorg = ra_hvorg
*             it_fkkcl_extended_all = lt_fkkcl_extended_all
*              is_fkkcl = <fs_fkkcl>
*            CHANGING
*              cs_clearingop = <fs_clearingop> ).

    ENDLOOP.



    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Sort Logic
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    SORT et_clearingop BY bit_ref ASCENDING.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Get UIM Items & Fill It
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    get_open_items(
      EXPORTING
      it_dfkkop_opbel = lt_dfkkop_opbel_uim
      IMPORTING
        et_fkkcl_all    = lt_fkkcl_int
         EXCEPTIONS
open_item_select_error = 1
).
    IF sy-subrc NE 0.
      RAISE open_item_select_error .
    ENDIF.

    DATA: lt_uims TYPE  zcl_clearingapplicati_mpc=>tt_crclearingop.

    SORT lt_fkkcl_int BY gpart.
    LOOP AT lt_fkkcl_int INTO DATA(ls_fkkcl).
      AT NEW gpart.
        DATA(lv_gpart) = ls_fkkcl-gpart.
        DATA(lv_bp_name) = zcl_clearingapp_services=>get_bp_name(
              iv_bp_id   = ls_fkkcl-gpart
              ir_bp_list = ra_bp_all ).
      ENDAT.

      APPEND INITIAL LINE TO et_clearingop ASSIGNING <fs_clearingop>.

      <fs_clearingop>-bp_id               = lv_gpart.
      <fs_clearingop>-bp_name  = lv_bp_name.
      <fs_clearingop>-tr_type             = 'Unallocated Insurance Monies'.
      <fs_clearingop>-amn                 = convert_amn_sap_to_display(
                                             iv_original_currency = ls_fkkcl-waers
                                             iv_amount_in_sap     = CONV #(   ls_fkkcl-betrw )
                                           ) .
      <fs_clearingop>-exp_pay_amn         = <fs_clearingop>-amn.
*          ls_alv_main-alloc_amn           = ls_fkkcl-betrw.
*          ls_alv_main-alloc_amn_sett_curr = ls_fkkcl-betrw.
      <fs_clearingop>-orig_curr           = ls_fkkcl-waers.
      <fs_clearingop>-exp_pay_curr        = ls_fkkcl-waers.
      <fs_clearingop>-roe_rec_curr        = 1.
      <fs_clearingop>-opbel               = ls_fkkcl-opbel.
      <fs_clearingop>-vkont               = ls_fkkcl-vkont.
      <fs_clearingop>-item                = ls_fkkcl-opupk.
      <fs_clearingop>-payment_ref         = ls_fkkcl-xblnr. " need to implement payment ref additional logic


    ENDLOOP.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Common Filter
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Delete entries where Settlement Currency is not equal to the Selection Filter Currency
    DELETE et_clearingop WHERE exp_pay_curr NE is_selectionparameters-currency.


  ENDMETHOD.

  METHOD get_claimpayables.


    DATA: ra_hvorg         TYPE RANGE OF dfkkop-hvorg,
          ra_extref        TYPE RANGE OF dfkkko-yyextref,
          ra_bp            TYPE RANGE OF but000-partner,
          lt_seltab        TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl_int     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_all     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_po_en   TYPE STANDARD TABLE OF fkkcl,
          ra_pay_hvorg     TYPE RANGE OF dfkkop-hvorg,
          ra_soa_reference TYPE tra_soa_reference,
          lv_start_index   TYPE sy-tabix,
          lv_end_index     TYPE sy-tabix,
          lv_count         TYPE sy-tabix,
          lv_total_records TYPE i,
          sum_betrh        TYPE fkkcl-betrh,
          sum_betrw        TYPE fkkcl-betrw.

    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fill Range Tables & Fetch Relevant Custom Table Data & Fetch Documents
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


    " Get Main Transaction Items from TVARVC
    SELECT sign, opti AS option, low
    FROM tvarvc
    INTO CORRESPONDING FIELDS OF TABLE @ra_hvorg
    WHERE name EQ
    'YEL_HVORGPREMIUM'.

    SELECT hvorg AS low
      FROM yel_tb_pay_hvorg
      INTO CORRESPONDING FIELDS OF TABLE ra_pay_hvorg.


    DATA(lt_dfkkop_opbel) = VALUE tt_opbel( ).
    DATA(lt_dfkkop_opbel_uim) = VALUE tt_opbel( ).

    " Create Range Tables for Selection parameters with Multi-select option
    ra_extref = VALUE #( FOR ls_extref IN is_selectionparameters-externalreferencenumbers sign = ac_sign_i option = ac_option_eq ( low = ls_extref ) ).

    ra_bp = VALUE #( FOR ls_bp IN is_selectionparameters-businesspartners sign = ac_sign_i option = ac_option_eq ( low = ls_bp ) ).


    " Get the Documents from DFKKOP
    SELECT DISTINCT p~opbel
        FROM dfkkop AS p
        INNER JOIN dfkkko AS k
        ON p~opbel = k~opbel
        WHERE  p~augst = @abap_false
        AND k~blart IN ('CR')
        AND p~yyextref IN @ra_extref
        AND p~gpart IN @ra_bp
        AND k~stbel = ''
        AND k~storb = ''
        AND p~bukrs = @is_selectionparameters-companycode
       " AND p~waers = @is_selectionparameters-currency
        INTO TABLE @lt_dfkkop_opbel.
    IF sy-subrc NE 0.
      RETURN.
    ENDIF.

    " Get UnAllocated Insurance Moneys
    SELECT DISTINCT opbel FROM
    dfkkop
    INTO TABLE @lt_dfkkop_opbel_uim
    WHERE augst = ''
    AND waers = @is_selectionparameters-currency
    AND hvorg = 'P210'
    AND gpart IN @ra_bp
    AND spart = @is_selectionparameters-division
    AND bukrs = @is_selectionparameters-companycode.
    IF sy-subrc NE 0.
    ENDIF.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fetch Open Items and Map Header Values With It & Remove unwanted Entries
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    DATA(lt_where) = VALUE tt_rsdswhere( (   line = |yyext_currency EQ '{ is_selectionparameters-currency }'| )
                                           (  line = |AND spart EQ '{ is_selectionparameters-division }'| ) ).

    get_open_items(
             EXPORTING
             it_dfkkop_opbel = lt_dfkkop_opbel
                     it_where = lt_where
             IMPORTING
               et_fkkcl_all    = lt_fkkcl_all
               EXCEPTIONS
       open_item_select_error = 1
     ).
    IF sy-subrc NE 0.
      RAISE open_item_select_error .
    ENDIF.

    " Extend with header values
    SELECT opbel, yytr_id, yyucr, yyuway
    FROM dfkkko
    FOR ALL ENTRIES IN @lt_fkkcl_all
    WHERE opbel = @lt_fkkcl_all-opbel
    INTO TABLE @DATA(lt_dfkkko_l).
    IF sy-subrc NE 0.
      RETURN.
    ENDIF.

    TYPES: ls_dfkko_l LIKE LINE OF lt_dfkkko_l.

    DATA(lt_fkkcl_extended_all) = CORRESPONDING tt_fkkcl_extended_cr( lt_fkkcl_all  ).


    LOOP AT lt_fkkcl_extended_all ASSIGNING FIELD-SYMBOL(<fs_fkkcl_extended_all>).

      DATA(ls_dfkkko) = VALUE ls_dfkko_l( lt_dfkkko_l[ opbel = <fs_fkkcl_extended_all>-opbel ] OPTIONAL ).

      <fs_fkkcl_extended_all>-yyucr = ls_dfkkko-yyucr.
      <fs_fkkcl_extended_all>-yytr_id = ls_dfkkko-yytr_id.
      <fs_fkkcl_extended_all>-yyuway = ls_dfkkko-yyuway.
    ENDLOOP.

    IF lt_fkkcl_extended_all IS NOT INITIAL.
      SELECT saknr, txt50
           FROM skat
           INTO TABLE @DATA(lt_skat)
            FOR ALL ENTRIES IN @lt_fkkcl_extended_all
          WHERE saknr EQ @lt_fkkcl_extended_all-hkont
            AND spras EQ @sy-langu.

      SORT lt_skat BY saknr.
    ENDIF.
    " DELETE lt_fkkcl_extended_all WHERE herkf_kk EQ '01'. " Temporary Code

    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Construct Premium Receivables Items OP
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


    LOOP AT lt_fkkcl_extended_all ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

      APPEND INITIAL LINE TO et_clearingop ASSIGNING FIELD-SYMBOL(<fs_clearingop>).

      " Default Mapping Fields
      <fs_clearingop>-ext_ref = <fs_fkkcl>-yyextref.
      <fs_clearingop>-int_ref = <fs_fkkcl>-yyintref.
      <fs_clearingop>-bit_ref = space. " Empty for Payables
      <fs_clearingop>-hvorg = <fs_fkkcl>-hvorg.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-item = <fs_fkkcl>-opupk.
      <fs_clearingop>-rep_item = <fs_fkkcl>-opupw.
      <fs_clearingop>-subitem = <fs_fkkcl>-opupz.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-due_date = <fs_fkkcl>-faedn.
      <fs_clearingop>-vkont = <fs_fkkcl>-vkont.
      <fs_clearingop>-vtref = <fs_fkkcl>-vtref.
      <fs_clearingop>-spart = <fs_fkkcl>-spart.
      <fs_clearingop>-gpart = <fs_fkkcl>-gpart.
      <fs_clearingop>-blart = <fs_fkkcl>-blart.
      <fs_clearingop>-bukrs = <fs_fkkcl>-bukrs.
      <fs_clearingop>-xblnr = <fs_fkkcl>-xblnr.
      <fs_clearingop>-fixed_roe = 'X'. " ROE is Fixed for Payables always.
      <fs_clearingop>-claim_tr_ref = <fs_fkkcl>-yytr_id.
      <fs_clearingop>-claim_ref = <fs_fkkcl>-yyelsclaimnum.
      <fs_clearingop>-origin = <fs_fkkcl>-herkf_kk.

      <fs_clearingop>-bp_name  = get_bp_name(
      iv_bp_id   = <fs_fkkcl>-gpart
      ir_bp_list = ra_bp ).

      <fs_clearingop>-delta_due_roe = space.
      <fs_clearingop>-sett_amn_roe_tr =  convert_amn_sap_to_display(
                                             iv_original_currency = <fs_clearingop>-orig_curr
                                             iv_amount_in_sap     = CONV #(   <fs_fkkcl>-betrh )
                                           ) .
      <fs_clearingop>-tax = space.
      <fs_clearingop>-tax_jurisdiction = space.
      <fs_clearingop>-tax_code = space.
      <fs_clearingop>-tr_type = VALUE #( lt_skat[ saknr = <fs_fkkcl>-hkont ]-txt50 OPTIONAL ).
      <fs_clearingop>-orig_curr = <fs_fkkcl>-waers.
      <fs_clearingop>-exp_pay_curr = <fs_fkkcl>-yyext_currency.
      <fs_clearingop>-exp_pay_amn =  convert_amn_sap_to_display(
                                             iv_original_currency = <fs_clearingop>-orig_curr
                                             iv_amount_in_sap     = CONV #(   <fs_fkkcl>-betrh )
                                           ) .
      <fs_clearingop>-amn =  convert_amn_sap_to_display(
                                       iv_original_currency = <fs_clearingop>-orig_curr
                                       iv_amount_in_sap     = CONV #(   <fs_fkkcl>-betrw )
                                     ) .
      <fs_clearingop>-act_curr_rec = <fs_fkkcl>-waers.
      <fs_clearingop>-roe_rec_curr = <fs_fkkcl>-kursf.
      <fs_clearingop>-roe_tr = <fs_fkkcl>-yyext_roe.
    ENDLOOP.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Get UIM Items & Fill It
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    get_open_items(
      EXPORTING
      it_dfkkop_opbel = lt_dfkkop_opbel_uim
      IMPORTING
        et_fkkcl_all    = lt_fkkcl_int
        EXCEPTIONS
        open_item_select_error = 1
        ).
    IF sy-subrc NE 0.
      RAISE open_item_select_error .
    ENDIF.

    SORT lt_fkkcl_int BY gpart.
    LOOP AT lt_fkkcl_int INTO DATA(ls_fkkcl).
      AT NEW gpart.
        DATA(lv_gpart) = ls_fkkcl-gpart.
        DATA(lv_bp_name) = zcl_clearingapp_services=>get_bp_name(
              iv_bp_id   = ls_fkkcl-gpart
              ir_bp_list = ra_bp ).
      ENDAT.

      APPEND INITIAL LINE TO et_clearingop ASSIGNING <fs_clearingop>.

      <fs_clearingop>-gpart               = lv_gpart.
      <fs_clearingop>-bp_name  = lv_bp_name.
      <fs_clearingop>-tr_type             = 'Unallocated Insurance Monies'.
      <fs_clearingop>-amn                 = convert_amn_sap_to_display(
                                       iv_original_currency = ls_fkkcl-waers
                                       iv_amount_in_sap     = CONV #(   ls_fkkcl-betrw )
                                     ) .
      <fs_clearingop>-exp_pay_amn         = <fs_clearingop>-amn.
      <fs_clearingop>-orig_curr           = ls_fkkcl-waers.
      <fs_clearingop>-exp_pay_curr        = ls_fkkcl-waers.
      <fs_clearingop>-roe_rec_curr        = 1.
      <fs_clearingop>-opbel               = ls_fkkcl-opbel.
      <fs_clearingop>-vkont               = ls_fkkcl-vkont.
      <fs_clearingop>-item                = ls_fkkcl-opupk.
      <fs_clearingop>-xblnr = ls_fkkcl-xblnr.
      <fs_clearingop>-hvorg = ls_fkkcl-hvorg.
      <fs_clearingop>-item = ls_fkkcl-opupk.
      <fs_clearingop>-rep_item = ls_fkkcl-opupw.
      <fs_clearingop>-subitem = ls_fkkcl-opupz.


    ENDLOOP.


    " Delete entries where Settlement Currency is not equal to the Selection Filter Currency
    DELETE et_clearingop WHERE exp_pay_curr NE is_selectionparameters-currency.

  ENDMETHOD.


  METHOD get_payerpayee.
    DATA: lra_umr TYPE zcl_clearingapplicati_dpc_ext=>tra_umr.


    IF ispayerrequested EQ abap_true.

      IF ira_extref IS NOT INITIAL.
        SELECT broker
        FROM yel_tb_deal_head
        INTO TABLE rt_payerpayee
        WHERE ext_ref IN ira_extref
        AND status EQ '00'.


      ELSEIF ira_umr IS NOT INITIAL .
        LOOP AT ira_umr ASSIGNING FIELD-SYMBOL(<fs_umr>).
          DATA(lv_len) = strlen( <fs_umr>-low ).
          APPEND VALUE #( sign = ac_sign_i option = ac_option_cp
          low = COND #( WHEN lv_len GT 30 THEN |*| && |{ <fs_umr>-low(30) }| && |*|
                        ELSE |*| && |{ <fs_umr>-low }| && |*| )
           ) TO lra_umr.
        ENDLOOP.
        SELECT FROM yel_tb_deal_head
          FIELDS broker
          WHERE deal           IN @lra_umr
            AND status         EQ '00'
            INTO TABLE @rt_payerpayee.
      ENDIF.

    ELSE.
      IF ira_extref IS NOT INITIAL.
        SELECT broker
        FROM yel_tb_deal_head
        INTO TABLE rt_payerpayee
        WHERE ext_ref IN ira_extref
        AND status EQ '00'
        AND status_booking EQ 'CR'
        .

      ELSEIF ira_umr IS NOT INITIAL .
        LOOP AT ira_umr ASSIGNING <fs_umr>.
          lv_len = strlen( <fs_umr>-low ).
          APPEND VALUE #( sign = ac_sign_i option = ac_option_cp
          low = COND #( WHEN lv_len GT 30 THEN |*| && |{ <fs_umr>-low(30) }| && |*|
                        ELSE |*| && |{ <fs_umr>-low }| && |*| )
           ) TO lra_umr.
        ENDLOOP.
        SELECT FROM yel_tb_deal_head
          FIELDS broker
          WHERE deal           IN @ira_umr
            AND status         EQ '00'
            AND status_booking EQ 'CR'
            INTO TABLE @rt_payerpayee.

      ENDIF.
    ENDIF.

    SORT rt_payerpayee BY table_line ASCENDING.

    DELETE ADJACENT DUPLICATES FROM rt_payerpayee COMPARING table_line.

  ENDMETHOD.


  METHOD get_premiumpayables.
    TYPES: ty_businesspartners TYPE STANDARD TABLE OF char10,
           tt_fkkcl            TYPE STANDARD TABLE OF fkkcl WITH DEFAULT KEY.


    DATA: ra_hvorg         TYPE RANGE OF dfkkop-hvorg,
          ra_extref        TYPE RANGE OF dfkkop-yyextref,
          ra_bp            TYPE RANGE OF but000-partner,
          ra_member        TYPE RANGE OF but000-partner,
          lt_seltab        TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl_int     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_all     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_po_en   TYPE STANDARD TABLE OF fkkcl,
          ra_pay_hvorg     TYPE RANGE OF dfkkop-hvorg,
          ra_soa_reference TYPE tra_soa_reference,
          lv_start_index   TYPE sy-tabix,
          lv_end_index     TYPE sy-tabix,
          lv_count         TYPE sy-tabix,
          lv_total_records TYPE i,
          sum_betrh        TYPE fkkcl-betrh,
          sum_betrw        TYPE fkkcl-betrw,
          lt_where         TYPE TABLE OF rsdswhere,
          ls_where         TYPE rsdswhere,
          ra_uwyears       TYPE RANGE OF dfkkko-yyuway.



    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fill Range Tables & Fetch Relevant Custom Table Data & Fetch Documents
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


    " Get Main Transaction Items from TVARVC
    SELECT sign, opti AS option, low
    FROM tvarvc
    INTO CORRESPONDING FIELDS OF TABLE @ra_hvorg
    WHERE name EQ
    'YEL_HVORG_PAYPREM'.


    DATA(lt_dfkkop_opbel) = VALUE tt_opbel( ).
    DATA(lt_dfkkop_opbel_uim) = VALUE tt_opbel( ).

    SELECT 'I' AS sign, 'EQ' AS option, hvorg AS low
     FROM yel_tb_pay_hvorg
     INTO CORRESPONDING FIELDS OF TABLE @ra_pay_hvorg.

    SELECT SINGLE low
      INTO @DATA(lv_hvorg)
      FROM tvarvc
      WHERE name EQ 'YEL_FI_BANKSTAT_UM_HVORG'.
    IF sy-subrc NE 0 OR lv_hvorg IS INITIAL.
      lv_hvorg = 'P210'.    "default value
    ENDIF.

    " Get GL Account and Bank Charge GL Account for the Bank Selected
    SELECT gl_account, gl_bank_charges
        FROM yel_tb_bank_clea
        INTO TABLE @DATA(lt_bank_clea)
        WHERE
        bank_account = @is_selectionparameters-elsecobankaccountnumber.



    " Create Range Tables for Selection parameters with Multi-select option
    ra_extref = VALUE #( FOR ls_extref1 IN is_selectionparameters-externalreferencenumbers sign = ac_sign_i option = ac_option_eq ( low = ls_extref1 ) ).

    ra_bp = VALUE #( FOR ls_bp IN is_selectionparameters-businesspartners sign = ac_sign_i option = ac_option_eq ( low = ls_bp ) ).

    IF ra_bp IS INITIAL.
      RETURN.
    ENDIF.

    ra_soa_reference = VALUE #( FOR ls_soa_reference IN is_selectionparameters-soareferencenumbers  sign = ac_sign_i option = ac_option_eq ( low = ls_soa_reference ) ).

    ra_member = VALUE #( FOR ls_bp IN is_selectionparameters-members sign = ac_sign_i option = ac_option_eq ( low = ls_bp ) ).

    ra_uwyears = VALUE #( FOR ls_uwyear IN is_selectionparameters-uwyears sign = ac_sign_i option = ac_option_eq ( low = ls_uwyear ) ).


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fetch Open Items and Map Header Values With It & Remove unwanted Entries
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    " Get Contract Account
    SELECT vkont
    FROM fkkvkp
    INTO TABLE @DATA(lt_fkkvkp)
    WHERE gpart IN @ra_bp
    AND stdbk EQ @is_selectionparameters-companycode.
    IF sy-subrc NE 0 OR lt_fkkvkp IS INITIAL.
      RETURN.
    ENDIF.
    SELECT vkont
     FROM fkkvk
     INTO TABLE @DATA(lt_fkkvk)
      FOR ALL ENTRIES IN @lt_fkkvkp
    WHERE vkont EQ @lt_fkkvkp-vkont.

    lt_seltab = VALUE #( FOR <fs_fkkvk> IN lt_fkkvk
    INDEX INTO lv_index
    (  selnr = lv_index selfn = 'VKONT' selcu = <fs_fkkvk>-vkont ) ).

    " Construct Where Condition based on the filters selected in UI
    APPEND VALUE #( line = |( spart EQ '{ is_selectionparameters-division }' AND blart NE 'RC' AND blart NE 'SC' ) |
     ) TO lt_where.

    APPEND VALUE #( line = | AND ( ( hvorg EQ 'P190' AND yyext_currency EQ '{ is_selectionparameters-currency }' ) |
    ) TO lt_where.
    APPEND VALUE #( line = | OR ( hvorg NE 'P190' AND waers EQ '{ is_selectionparameters-currency }' ) )  |
    ) TO lt_where.

    APPEND VALUE #( line = |AND NOT ( blart EQ 'RD' AND pymet EQ 'F' )|
    ) TO lt_where.

    APPEND VALUE #( line = |AND NOT (  hvorg IN ('C230', 'Y230') AND pymet IN ('C', 'F', 'T') )|
      ) TO lt_where.


    IF ra_pay_hvorg[] IS INITIAL.
      ls_where-line = | AND blart NE 'CL'|. APPEND ls_where TO lt_where.
    ELSE.
      ls_where-line = | AND ( blart NE 'CL' OR ( |. APPEND ls_where TO lt_where.

      LOOP AT ra_pay_hvorg INTO DATA(ls_pay_hvorg).
        IF sy-tabix EQ 1.
          ls_where-line = | hvorg EQ '{ ls_pay_hvorg-low }'|. APPEND ls_where TO lt_where.
        ELSE.
          ls_where-line = | OR hvorg EQ '{ ls_pay_hvorg-low }'|. APPEND ls_where TO lt_where.
        ENDIF.
      ENDLOOP.
      ls_where-line = | ) )|. APPEND ls_where TO lt_where.
    ENDIF.

    IF ra_extref[] IS NOT INITIAL.
      LOOP AT ra_extref INTO DATA(ls_extref).
        IF sy-tabix EQ 1.
          ls_where-line = | AND ( ( yyextref EQ '{ ls_extref-low }'|. APPEND ls_where TO lt_where.
        ELSE.
          ls_where-line = | OR yyextref EQ '{ ls_extref-low }'|. APPEND ls_where TO lt_where.
        ENDIF.
        ls_where-line = | ) OR hvorg EQ '{ lv_hvorg }' )|. APPEND ls_where TO lt_where.

      ENDLOOP.
    ENDIF.

    IF ra_member[] IS NOT INITIAL.
      LOOP AT ra_member INTO DATA(ls_membr).
        IF sy-tabix EQ 1.
          ls_where-line = | AND ( ( yymember EQ '{ ls_membr-low }'|. APPEND ls_where TO lt_where.
        ELSE.
          ls_where-line = | OR yymember EQ '{ ls_membr-low }'|. APPEND ls_where TO lt_where.
        ENDIF.
        ls_where-line = | ) OR hvorg EQ '{ lv_hvorg }' )|. APPEND ls_where TO lt_where.

      ENDLOOP.
    ENDIF.

    IF is_selectionparameters-payablepostingstartdate IS NOT INITIAL AND is_selectionparameters-payablepostingenddate IS NOT INITIAL.
      DATA(lv_filter) = |budat BETWEEN '{ is_selectionparameters-payablepostingstartdate }' AND '{ is_selectionparameters-payablepostingenddate }'|.
      ls_where-line = | AND ( ( { lv_filter }|. APPEND ls_where TO lt_where.
      ls_where-line = | ) OR hvorg EQ '{ lv_hvorg }' )|. APPEND ls_where TO lt_where.

    ENDIF.

    IF is_selectionparameters-fronter IS NOT INITIAL.
      ls_where-line = | AND ( yymember EQ '{ is_selectionparameters-fronter }' OR yyfronter EQ '{ is_selectionparameters-fronter }'|. APPEND ls_where TO lt_where.
      ls_where-line = | OR hvorg EQ '{ lv_hvorg }' )|. APPEND ls_where TO lt_where.
    ENDIF.

    CALL FUNCTION 'FKK_OPEN_ITEM_SELECT'
      EXPORTING
        i_applk             = ac_message_type_success
        i_no_enqueue        = 'X'
        i_payment_date      = sy-datum
        i_auth_actvt        = '03'
      TABLES
        t_seltab            = lt_seltab
        t_fkkcl             = lt_fkkcl_all
        t_where             = lt_where
      EXCEPTIONS
        concurrent_clearing = 1
        payment_orders      = 2
        OTHERS              = 3.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.
    CALL FUNCTION 'DEQUEUE_ALL'.

    IF ra_hvorg[] IS NOT INITIAL.
      DELETE lt_fkkcl_all WHERE hvorg NOT IN ra_hvorg[] AND hvorg NE lv_hvorg.
    ENDIF.


    " Extend with header values
    IF lt_fkkcl_all IS NOT INITIAL.
      SELECT opbel,
        yyextref,
        yyendorsementref,
        yypremium_id,
        yyuway,
        yyinstallment_num,
        yypremium_type,
        yypolicy_num
        FROM dfkkko
        FOR ALL ENTRIES IN @lt_fkkcl_all
        WHERE opbel = @lt_fkkcl_all-opbel
        INTO TABLE @DATA(lt_dfkkko_l).
      IF sy-subrc NE 0.
        RETURN.
      ENDIF.
    ELSE.
      RETURN.
    ENDIF.

    TYPES: ls_dfkko_l LIKE LINE OF lt_dfkkko_l.

    DATA(lt_fkkcl_extended_all) = CORRESPONDING tt_fkkcl_extended_pp( lt_fkkcl_all  ).

    LOOP AT lt_fkkcl_extended_all ASSIGNING FIELD-SYMBOL(<fs_fkkcl_extended_all>).

      DATA(ls_dfkkko) = VALUE ls_dfkko_l( lt_dfkkko_l[ opbel = <fs_fkkcl_extended_all>-opbel ] OPTIONAL ).

      <fs_fkkcl_extended_all>-yyendorsementref = ls_dfkkko-yyendorsementref.
      <fs_fkkcl_extended_all>-yyinstallment_num = ls_dfkkko-yyinstallment_num.
      <fs_fkkcl_extended_all>-yypremium_id = ls_dfkkko-yypremium_id.
      <fs_fkkcl_extended_all>-yypremium_type = ls_dfkkko-yypremium_type.
      <fs_fkkcl_extended_all>-yyuway = ls_dfkkko-yyuway.
      <fs_fkkcl_extended_all>-yypolicy_num = ls_dfkkko-yypolicy_num.

    ENDLOOP.

    IF ra_uwyears IS NOT INITIAL.
      DELETE lt_fkkcl_extended_all WHERE yyuway  NOT IN ra_uwyears[].
    ENDIF.

    DELETE lt_fkkcl_extended_all WHERE ( hvorg EQ 'C230'
                                    OR hvorg EQ 'Y230' ) AND (
                                    pymet EQ 'C' OR  pymet EQ 'F'
                                    OR pymet EQ 'T'
                                     ).

    IF lt_fkkcl_extended_all IS NOT INITIAL.
      SELECT saknr, txt50
           FROM skat
           INTO TABLE @DATA(lt_skat)
            FOR ALL ENTRIES IN @lt_fkkcl_extended_all
          WHERE saknr EQ @lt_fkkcl_extended_all-hkont
            AND spras EQ @sy-langu.

      SORT lt_skat BY saknr.
    ENDIF.

    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Construct Premium Payable & UIM Items OP
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    LOOP AT lt_fkkcl_extended_all ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

      APPEND INITIAL LINE TO et_clearingop ASSIGNING FIELD-SYMBOL(<fs_clearingop>).

      " Default Mapping Fields
      <fs_clearingop>-ext_ref = <fs_fkkcl>-yyextref.
      <fs_clearingop>-int_ref = <fs_fkkcl>-yyintref.
      <fs_clearingop>-bit_ref = space. " Empty for Payables
      <fs_clearingop>-hvorg = <fs_fkkcl>-hvorg.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-item = <fs_fkkcl>-opupk.
      <fs_clearingop>-rep_item = <fs_fkkcl>-opupw.
      <fs_clearingop>-subitem = <fs_fkkcl>-opupz.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-due_date = <fs_fkkcl>-faedn.
      <fs_clearingop>-endorsement_ref = <fs_fkkcl>-yyendorsementref.
      <fs_clearingop>-premium_id = <fs_fkkcl>-yypremium_id.
      <fs_clearingop>-installment = <fs_fkkcl>-yyinstallment_num.
      <fs_clearingop>-vkont = <fs_fkkcl>-vkont.
      <fs_clearingop>-vtref = <fs_fkkcl>-vtref.
      <fs_clearingop>-spart = <fs_fkkcl>-spart.
      <fs_clearingop>-gpart = <fs_fkkcl>-gpart.
      <fs_clearingop>-blart = <fs_fkkcl>-blart.
      <fs_clearingop>-policynum = <fs_fkkcl>-yypolicy_num.
      <fs_clearingop>-bukrs = <fs_fkkcl>-bukrs.
      <fs_clearingop>-xblnr = <fs_fkkcl>-xblnr.
      <fs_clearingop>-origin = <fs_fkkcl>-herkf_kk.
      <fs_clearingop>-bp_name  = zcl_clearingapp_services=>get_bp_name(
         iv_bp_id   = <fs_fkkcl>-gpart
         ir_bp_list = ra_bp ).

      <fs_clearingop>-orig_curr = <fs_fkkcl>-waers.
      <fs_clearingop>-roe_tr = 1. "Always 1 "<fs_fkkcl>-yyext_roe.
      <fs_clearingop>-act_curr_rec = is_selectionparameters-currency.
      <fs_clearingop>-exp_pay_curr = <fs_fkkcl>-yyext_currency.
      <fs_clearingop>-roe_rec_curr = 1.
      <fs_clearingop>-fixed_roe = space.

      <fs_clearingop>-amn =  convert_amn_sap_to_display(
                                             iv_original_currency = <fs_clearingop>-orig_curr
                                             iv_amount_in_sap     = conv #(   <fs_fkkcl>-betrw )
                                           ) .

      <fs_clearingop>-exp_pay_amn = <fs_clearingop>-amn.

      IF <fs_fkkcl>-hvorg EQ 'P190'.
        <fs_clearingop>-exp_pay_curr = <fs_fkkcl>-yyext_currency.
        <fs_clearingop>-roe_rec_curr = <fs_fkkcl>-kursf.
      ELSE.
        <fs_clearingop>-exp_pay_curr = <fs_fkkcl>-waers.
        <fs_clearingop>-roe_rec_curr = 1.
      ENDIF.
      <fs_clearingop>-sett_amn_roe_tr = <fs_clearingop>-amn. " Same as AMN
      IF <fs_fkkcl>-hvorg EQ lv_hvorg.
        <fs_clearingop>-xblnr = <fs_fkkcl>-xblnr.
        SELECT SINGLE posting_type
                               soa_reference_fab
                               comments
                   INTO CORRESPONDING FIELDS OF <fs_clearingop>
                   FROM yel_tb_payrefdet
                   WHERE doc_no EQ <fs_fkkcl>-opbel.
      ENDIF.
      <fs_clearingop>-tr_type = VALUE #( lt_skat[ saknr = <fs_fkkcl>-hkont ]-txt50 OPTIONAL ).


      IF  is_selectionparameters-payablepostingstartdate IS NOT INITIAL AND
            <fs_fkkcl>-budat NOT BETWEEN is_selectionparameters-payablepostingstartdate
            AND is_selectionparameters-payablepostingenddate AND
            <fs_clearingop>-tr_type NE 'Unallocated Insurance Monies'.

        CONTINUE.

      ENDIF.

      " Fill SOA Reference
      zcl_clearingapp_services=>get_soa_data(
        EXPORTING
          ira_soa_reference = ra_soa_reference
        CHANGING
          cs_clearingop     = <fs_clearingop>
      ).

      IF <fs_clearingop>-int EQ 3.
        DATA(lv_current_index) = lines( et_clearingop ).
        DELETE et_clearingop INDEX lv_current_index.
        CONTINUE.
      ENDIF.

    ENDLOOP.

    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Common Filter
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    DELETE et_clearingop WHERE exp_pay_curr NE is_selectionparameters-currency.

    DATA(lt_clearingop_uim) = et_clearingop.

    DELETE lt_clearingop_uim WHERE tr_type NE 'Unallocated Insurance Monies'.
    DELETE et_clearingop WHERE tr_type EQ 'Unallocated Insurance Monies'.

    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Sort Logic
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    SORT et_clearingop BY ext_ref installment endorsement_ref tr_type int_ref   bit_ref ASCENDING.



    APPEND LINES OF lt_clearingop_uim TO et_clearingop.


  ENDMETHOD.


  METHOD get_premiumreceivables.
    TYPES: ty_businesspartners TYPE STANDARD TABLE OF char10,
           tt_fkkcl            TYPE STANDARD TABLE OF fkkcl WITH DEFAULT KEY.

    DATA: ra_hvorg         TYPE RANGE OF dfkkop-hvorg,
          ra_extref        TYPE RANGE OF dfkkop-yyextref,
          ra_bp            TYPE RANGE OF but000-partner,
          lt_seltab        TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl_int     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_all     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_po_en   TYPE STANDARD TABLE OF fkkcl,
          ra_pay_hvorg     TYPE RANGE OF dfkkop-hvorg,
          ra_soa_reference TYPE tra_soa_reference,
          lv_start_index   TYPE sy-tabix,
          lv_end_index     TYPE sy-tabix,
          lv_count         TYPE sy-tabix,
          lv_total_records TYPE i,
          sum_betrh        TYPE fkkcl-betrh,
          sum_betrw        TYPE fkkcl-betrw.


    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fill Range Tables & Fetch Relevant Custom Table Data & Fetch Documents
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


    " Get Main Transaction Items from TVARVC
    SELECT sign, opti AS option, low
    FROM tvarvc
    INTO CORRESPONDING FIELDS OF TABLE @ra_hvorg
    WHERE name EQ
    'YEL_HVORGPREMIUM'.

    DATA(lt_dfkkop_opbel) = VALUE tt_opbel( ).
    DATA(lt_dfkkop_opbel_uim) = VALUE tt_opbel( ).

    " Create Range Tables for Selection parameters with Multi-select option
    ra_extref = VALUE #( FOR ls_extref IN is_selectionparameters-externalreferencenumbers sign = ac_sign_i option = ac_option_eq ( low = ls_extref ) ).

    ra_bp = VALUE #( FOR ls_bp IN is_selectionparameters-businesspartners sign = ac_sign_i option = ac_option_eq ( low = ls_bp ) ).

    IF ra_bp IS INITIAL.
      RETURN.
    ENDIF.

    ra_soa_reference = VALUE #( FOR ls_soa_reference IN is_selectionparameters-soareferencenumbers  sign = ac_sign_i option = ac_option_eq ( low = ls_soa_reference ) ).

    IF ra_soa_reference IS NOT INITIAL.
      SELECT *
       INTO TABLE @DATA(lt_soa_data)
       FROM yel_tb_clear_soa
       WHERE soa_reference IN @ra_soa_reference.
      IF sy-subrc EQ 0 AND lt_soa_data IS NOT INITIAL.
        SORT lt_soa_data BY opbel.
        DELETE ADJACENT DUPLICATES FROM lt_soa_data COMPARING opbel.
        " Get the Documents from DFKKOP
        SELECT DISTINCT dfkkop~opbel FROM dfkkop
           INNER JOIN @lt_soa_data AS soa
           ON dfkkop~opbel = soa~opbel
           WHERE yyextref IN @ra_extref
           AND augst = @abap_false
           AND bukrs = @is_selectionparameters-companycode
           AND gpart IN @ra_bp
           AND spart = @is_selectionparameters-division
           AND blart IN (  'PO' , 'EN', 'CP' )
           INTO TABLE @lt_dfkkop_opbel .
        IF sy-subrc NE 0.
          RETURN.
        ENDIF.
      ENDIF.
    ELSE.


      " Get the Documents from DFKKOP
      SELECT DISTINCT opbel FROM dfkkop
         INTO TABLE @lt_dfkkop_opbel
         WHERE yyextref IN @ra_extref
         AND augst = @abap_false
         AND bukrs = @is_selectionparameters-companycode
         AND gpart IN @ra_bp
         AND spart = @is_selectionparameters-division
         AND blart IN (  'PO' , 'EN', 'CP' ) .
      IF sy-subrc NE 0.
        RETURN.
      ENDIF.
    ENDIF.


    " Get UnAllocated Insurance Moneys
    SELECT DISTINCT opbel FROM
    dfkkop
    INTO TABLE @lt_dfkkop_opbel_uim
    WHERE augst = ''
    AND waers = @is_selectionparameters-currency
    AND hvorg = 'P210'
    AND gpart IN @ra_bp
    AND spart = @is_selectionparameters-division
    AND bukrs = @is_selectionparameters-companycode.
    IF sy-subrc NE 0.
    ENDIF.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Fetch Open Items and Map Header Values With It & Remove unwanted Entries
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    DATA(lt_where) = VALUE tt_rsdswhere( (   line = |yyext_currency EQ '{ is_selectionparameters-currency }'| )
                                           (  line = |AND spart EQ '{ is_selectionparameters-division }'| ) ).

    get_open_items(
      EXPORTING
      it_dfkkop_opbel = lt_dfkkop_opbel
              it_where = lt_where
      IMPORTING
        et_fkkcl_all    = lt_fkkcl_all
      EXCEPTIONS
      open_item_select_error = 1
    ).
    IF sy-subrc NE 0.
      RAISE open_item_select_error .
    ENDIF.

*    " Remove Unwanted Entries
*    delete lt_fkkcl_all where ( ( blart EQ 'CL' OR budat NE '00000000'  ) AND hvorg NOT IN ra_pay_hvorg )
*    and  spart ne is_selectionparameters-division or  blart EQ 'RC' OR blart EQ 'SC' .
    "DELETE lt_fkkcl_all WHERE yybitref CP '2*'. " Temporary code

    " Extend with header values
    IF lt_fkkcl_all IS NOT INITIAL.
      SELECT opbel, yyendorsementref, yypremium_id, yypremium_type, yyinstallment_num
       FROM dfkkko
       FOR ALL ENTRIES IN @lt_fkkcl_all
       WHERE opbel = @lt_fkkcl_all-opbel
       INTO TABLE @DATA(lt_dfkkko_l).
      IF sy-subrc NE 0.
        RETURN.
      ENDIF.
    ELSE.
      RETURN.
    ENDIF.

    TYPES: ls_dfkko_l LIKE LINE OF lt_dfkkko_l.

    DATA(lt_fkkcl_extended_all) = CORRESPONDING tt_fkkcl_extended_pr( lt_fkkcl_all  ).


    LOOP AT lt_fkkcl_extended_all ASSIGNING FIELD-SYMBOL(<fs_fkkcl_extended_all>).

      DATA(ls_dfkkko) = VALUE ls_dfkko_l( lt_dfkkko_l[ opbel = <fs_fkkcl_extended_all>-opbel ] OPTIONAL ).

      <fs_fkkcl_extended_all>-yyendorsementref = ls_dfkkko-yyendorsementref.
      <fs_fkkcl_extended_all>-yyinstallment_num = ls_dfkkko-yyinstallment_num.
      <fs_fkkcl_extended_all>-yypremium_id = ls_dfkkko-yypremium_id.
      <fs_fkkcl_extended_all>-yypremium_type = ls_dfkkko-yypremium_type.

    ENDLOOP.


*    " Filter with HVORG
*    DATA(lt_fkkcl_po_en_t) = VALUE tt_fkkcl( FOR ls_fkkcl_all IN lt_fkkcl_all WHERE ( hvorg IN ra_hvorg ) ( CORRESPONDING #(  ls_fkkcl_all ) ) ).


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Group Entries Based on YYBITREF YYINTREF YYENDORSEMENTREF YYPREMIUM_ID YYINSTALLMENT_NUM
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    DATA: members                      LIKE lt_fkkcl_extended_all,
          ls_fkkclline                 TYPE ty_fkkcl_extended_pr,
          lt_fkkcl_extended            TYPE tt_fkkcl_extended_pr,
          lt_docs_in_group_with_amount TYPE STANDARD TABLE OF ty_docs_in_group_with_amount.

    SORT lt_fkkcl_extended_all BY yybitref yyintref yyendorsementref yypremium_id yyinstallment_num opbel opupk opupw opupz.

    LOOP AT lt_fkkcl_extended_all ASSIGNING <fs_fkkcl_extended_all>
     GROUP BY (  yybitref = <fs_fkkcl_extended_all>-yybitref
                                              yyintref = <fs_fkkcl_extended_all>-yyintref
                                              yyendorsementref = <fs_fkkcl_extended_all>-yyendorsementref
                                              yypremium_id = <fs_fkkcl_extended_all>-yypremium_id
                                              yyinstallment_num = <fs_fkkcl_extended_all>-yyinstallment_num  )
                                               ASSIGNING FIELD-SYMBOL(<group>).

      CLEAR: members, ls_fkkclline.

      LOOP AT GROUP <group> ASSIGNING FIELD-SYMBOL(<fs_fkkcl_extended_all_g>).
        members = VALUE #( BASE members ( <fs_fkkcl_extended_all_g> ) ).
      ENDLOOP.

      lv_count = lines( members ).
      "Temporary Code
      IF lv_count > 1000 AND sy-sysid EQ 'NSQ'.
        " Log It temporarily
        TYPES: BEGIN OF ty_clearinglog,
                 extref        TYPE char50,
                 clearingtypes TYPE char30,
                 companycode   TYPE char30,
                 division      TYPE char5,
                 bp            TYPE char50,
                 postingstart  TYPE dats,
                 postingend    TYPE dats,
                 opbel         TYPE opbel_kk,
                 opupk         TYPE opupk_kk,
                 string        TYPE char1024,
               END OF ty_clearinglog.
        DATA(ls_clearinglog) = VALUE ty_clearinglog( extref = VALUE #( is_selectionparameters-externalreferencenumbers[ 1 ] OPTIONAL )
           clearingtypes = 'PR'
           companycode = is_selectionparameters-companycode
           division = is_selectionparameters-division
           bp = is_selectionparameters-businesspartners[ 1 ]
          string = /ui2/cl_json=>serialize( data = is_selectionparameters pretty_name = /ui2/cl_json=>pretty_mode-camel_case )
         ).
        DATA: lt_clearinglog TYPE STANDARD TABLE OF ty_clearinglog.
        APPEND ls_clearinglog TO lt_clearinglog.
        DATA: ztemp_clear_logi TYPE string VALUE 'ztemp_clear_logi'.
        INSERT (ztemp_clear_logi) FROM TABLE lt_clearinglog ACCEPTING DUPLICATE KEYS.
      ENDIF.

      LOOP AT members ASSIGNING FIELD-SYMBOL(<fs_members>) WHERE blart NE 'CP'.
        APPEND VALUE #( yybitref = <fs_members>-yybitref
                        yyintref = <fs_members>-yyintref
                        yyendorsementref = <fs_members>-yyendorsementref
                        yypremium_id = <fs_members>-yypremium_id
                        yyinstallment_num = <fs_members>-yyinstallment_num
                        members = members  ) TO lt_docs_in_group_with_amount.
        ls_fkkclline = CORRESPONDING #( <fs_members> ).
        IF lv_count > 1000.
          ls_fkkclline-opupz = 000.
          ls_fkkclline-opupk = 0000.
          ls_fkkclline-opupw = 000.
        ENDIF.
        EXIT.
      ENDLOOP.

      APPEND ls_fkkclline TO lt_fkkcl_extended.

    ENDLOOP.

    SORT lt_fkkcl_extended BY yybitref yyintref
        yyendorsementref yypremium_id yyinstallment_num.

    DELETE ADJACENT DUPLICATES FROM lt_fkkcl_extended COMPARING yybitref yyintref
    yyendorsementref yypremium_id yyinstallment_num.

    DELETE lt_fkkcl_extended WHERE blart = 'CP'.

    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Construct Premium Receivables Items OP
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    LOOP AT lt_fkkcl_extended ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

      APPEND INITIAL LINE TO et_clearingop ASSIGNING FIELD-SYMBOL(<fs_clearingop>).

      <fs_clearingop>-tr_type = zcl_clearingapp_services=>get_premium_type( is_fkkcl = <fs_fkkcl>  ).

      " Default Mapping Fields
      <fs_clearingop>-ext_ref = <fs_fkkcl>-yyextref.
      <fs_clearingop>-int_ref = <fs_fkkcl>-yyintref.
      <fs_clearingop>-bit_ref = <fs_fkkcl>-yybitref.
      <fs_clearingop>-hvorg = <fs_fkkcl>-hvorg.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-item =  <fs_fkkcl>-opupk.
      <fs_clearingop>-rep_item = <fs_fkkcl>-opupw.
      <fs_clearingop>-subitem = <fs_fkkcl>-opupz.
      <fs_clearingop>-opbel = <fs_fkkcl>-opbel.
      <fs_clearingop>-due_date = <fs_fkkcl>-faedn.
      <fs_clearingop>-endorsement_ref = <fs_fkkcl>-yyendorsementref.
      <fs_clearingop>-premium_id = <fs_fkkcl>-yypremium_id.
      <fs_clearingop>-installment = <fs_fkkcl>-yyinstallment_num.
      <fs_clearingop>-vkont = <fs_fkkcl>-vkont.
      <fs_clearingop>-vtref = <fs_fkkcl>-vtref.
      <fs_clearingop>-spart = <fs_fkkcl>-spart.
      <fs_clearingop>-gpart = <fs_fkkcl>-gpart.
      <fs_clearingop>-blart = <fs_fkkcl>-blart.
      <fs_clearingop>-xblnr = <fs_fkkcl>-xblnr.
      <fs_clearingop>-origin = <fs_fkkcl>-herkf_kk.

      "<fs_clearingop>-policynum = <fs_fkkcl>-yypolicy_num.

      <fs_clearingop>-bp_name  = zcl_clearingapp_services=>get_bp_name(
          iv_bp_id   = <fs_fkkcl>-gpart
          ir_bp_list = ra_bp ).

      <fs_clearingop>-orig_curr = <fs_fkkcl>-waers.
      <fs_clearingop>-roe_tr = <fs_fkkcl>-yyext_roe.
      <fs_clearingop>-act_curr_rec = <fs_fkkcl>-yyext_currency.
      <fs_clearingop>-exp_pay_curr = <fs_fkkcl>-yyext_currency.
      <fs_clearingop>-fixed_roe = <fs_fkkcl>-yyfixed_er.




      """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      "  ORIG_CURR, ROE_REC_CURR, CLEARED_AMOUNT
      " BOOKED_AMOUNT, AMN, SETT_AMN_ROE_TR, EXP_PAY_AMN
      """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


      IF <fs_clearingop>-orig_curr = <fs_clearingop>-exp_pay_curr.
        <fs_clearingop>-roe_rec_curr = 1.
      ELSEIF <fs_fkkcl>-yyfixed_er IS NOT INITIAL.
        <fs_clearingop>-roe_rec_curr = <fs_fkkcl>-yyext_roe.
      ELSE.
        DATA(lv_posting_date) = COND dats( WHEN is_selectionparameters-postingdate IS NOT INITIAL THEN is_selectionparameters-postingdate ELSE sy-datum ).
        CALL FUNCTION 'READ_EXCHANGE_RATE'
          EXPORTING
            date             = lv_posting_date
            foreign_currency = <fs_clearingop>-orig_curr
            local_currency   = <fs_clearingop>-exp_pay_curr
          IMPORTING
            exchange_rate    = <fs_clearingop>-roe_rec_curr.
        IF sy-subrc NE 0.
        ENDIF.
      ENDIF.

      DATA(lt_members) = VALUE tt_fkkcl_extended_pr( lt_docs_in_group_with_amount[
                                                      yybitref = <fs_fkkcl>-yybitref
                                                      yyintref = <fs_fkkcl>-yyintref
                                                      yyendorsementref = <fs_fkkcl>-yyendorsementref
                                                      yypremium_id = <fs_fkkcl>-yypremium_id
                                                      yyinstallment_num = <fs_fkkcl>-yyinstallment_num
                                                         ]-members OPTIONAL ).


      " Get Previously Paid Amount
      SELECT SUM( betrw )
        INTO @DATA(lv_total_prev_paid_amount)
        FROM dfkkop AS a
        INNER JOIN dfkkko AS b
        ON a~opbel = b~opbel
        WHERE a~blart = 'CP'
        AND a~yyextref = @<fs_fkkcl>-yyextref
        AND a~yyintref = @<fs_fkkcl>-yyintref
        AND b~yyendorsementref = @<fs_fkkcl>-yyendorsementref
        AND b~yypremium_id = @<fs_fkkcl>-yypremium_id
        AND b~yyinstallment_num = @<fs_fkkcl>-yyinstallment_num
        AND a~yybitref = @<fs_fkkcl>-yybitref.
      IF sy-subrc EQ 0.
        " Initially it is in Settlement Currency. Now, Convert to Original Currency
        IF <fs_clearingop>-orig_curr NE <fs_clearingop>-exp_pay_curr AND abs( lv_total_prev_paid_amount ) > 0.
*          convert_to_local_currency(
*            EXPORTING
*              date                = <fs_fkkcl>-budat
*              iv_foreign_amount   = lv_total_prev_paid_amount
*              iv_foreign_currency = <fs_clearingop>-exp_pay_curr
*              iv_local_currency   = <fs_clearingop>-orig_curr
*              iv_rate             = <fs_clearingop>-roe_tr
*RECEIVING
*              rv_amount           = <fs_clearingop>-cleared_amount
*          ).
          zcl_clearingapp_services=>convert_to_foreign_currency(
            EXPORTING
              date                = <fs_fkkcl>-budat
              iv_foreign_currency = <fs_clearingop>-orig_curr
              iv_local_amount     = lv_total_prev_paid_amount
              iv_local_currency   = <fs_clearingop>-exp_pay_curr
              iv_rate             = <fs_clearingop>-roe_tr
            RECEIVING
              rv_amount           = <fs_clearingop>-cleared_amount
          ).
          <fs_clearingop>-cleared_amount = <fs_clearingop>-cleared_amount * -1  . " Making it negative looking current app. But doesnt makes sense
        ELSE.
          <fs_clearingop>-cleared_amount =  lv_total_prev_paid_amount * -1  .

          <fs_clearingop>-cleared_amount =  convert_amn_sap_to_display(
                                             iv_original_currency = <fs_clearingop>-orig_curr
                                             iv_amount_in_sap     = CONV #(   <fs_clearingop>-cleared_amount )
                                           ) .
        ENDIF.
      ENDIF.

      " Get The Total Booked Amount
      SELECT SINGLE SUM( betrw )
      FROM @lt_members AS mem
      WHERE blart NE 'CP'
      INTO @<fs_clearingop>-booked_amount.
      <fs_clearingop>-booked_amount =  convert_amn_sap_to_display(
                                           iv_original_currency = <fs_clearingop>-orig_curr
                                           iv_amount_in_sap     = CONV #(   <fs_clearingop>-booked_amount )
                                         ) .



      " Now Subtract Cleared Amount from Booked Amount to get Remaining Amount
      <fs_clearingop>-amn = <fs_clearingop>-booked_amount - <fs_clearingop>-cleared_amount.
      CLEAR : lv_total_prev_paid_amount.


      IF <fs_clearingop>-orig_curr EQ <fs_clearingop>-exp_pay_curr.
        <fs_clearingop>-sett_amn_roe_tr =  <fs_clearingop>-amn.
      ELSE.
        SELECT  * UP TO 1 ROWS
                        FROM tcurf
                        INTO TABLE @DATA(lt_tcurf)
                        WHERE kurst = 'M'
                        AND fcurr = @<fs_clearingop>-orig_curr
                        AND tcurr = @<fs_clearingop>-exp_pay_curr
                        AND gdatu > '20171231'
                        ORDER BY gdatu DESCENDING
                        .
        IF sy-subrc EQ 0 AND lt_tcurf IS NOT INITIAL.
          DATA(lv_ratio) = lt_tcurf[ 1 ]-ffact.
          <fs_clearingop>-sett_amn_roe_tr =  <fs_clearingop>-amn * <fs_clearingop>-roe_tr / lv_ratio.
        ENDIF.
      ENDIF.

      IF lv_ratio = 0.
        lv_ratio = 1.
      ENDIF.
      <fs_clearingop>-exp_pay_amn = ( <fs_clearingop>-amn * <fs_clearingop>-roe_rec_curr ) / lv_ratio.
      CLEAR lv_ratio.

      " Added My Logic to Remove same logic from FrontEnd for exp_pay_amn
      DATA: lv_exp_pay_amn LIKE <fs_clearingop>-exp_pay_amn.
      CLEAR lv_exp_pay_amn.
      IF <fs_clearingop>-roe_rec_curr NE <fs_clearingop>-roe_tr.
        lv_exp_pay_amn = COND #( WHEN <fs_clearingop>-orig_curr NE <fs_clearingop>-exp_pay_curr
                                  THEN  zcl_clearingapp_services=>convert_to_local_currency(
          EXPORTING
            date                = sy-datum
            iv_foreign_amount   = CONV #( <fs_clearingop>-amn )
            iv_foreign_currency = <fs_clearingop>-orig_curr
            iv_local_currency   = <fs_clearingop>-exp_pay_curr
            iv_rate             = <fs_clearingop>-roe_rec_curr
        )
        ELSE <fs_clearingop>-amn ).
*
      ELSE.
        lv_exp_pay_amn = <fs_clearingop>-sett_amn_roe_tr.
      ENDIF.
      " Temporary Code
      IF <fs_clearingop>-exp_pay_amn NE lv_exp_pay_amn AND sy-sysid EQ 'NSQ'.
        " Log It temporarily

        ls_clearinglog = VALUE ty_clearinglog( extref = VALUE #( is_selectionparameters-externalreferencenumbers[ 1 ] OPTIONAL )
           clearingtypes = 'PR'
           companycode = is_selectionparameters-companycode
           division = is_selectionparameters-division
           bp = is_selectionparameters-businesspartners[ 1 ]
           opbel = <fs_clearingop>-opbel
           opupk = <fs_clearingop>-item
            string = /ui2/cl_json=>serialize( data = is_selectionparameters pretty_name = /ui2/cl_json=>pretty_mode-camel_case )
         ).
        APPEND ls_clearinglog TO lt_clearinglog.
        INSERT (ztemp_clear_logi) FROM TABLE lt_clearinglog ACCEPTING DUPLICATE KEYS.
      ENDIF.


      " Fill SOA Reference
      zcl_clearingapp_services=>get_soa_data(
        EXPORTING
          ira_soa_reference = ra_soa_reference
        CHANGING
          cs_clearingop     = <fs_clearingop>
      ).

      IF <fs_clearingop>-int EQ 3.
        DATA(lv_current_index) = lines( et_clearingop ).
        DELETE et_clearingop INDEX lv_current_index.
        CONTINUE.
      ENDIF.

    ENDLOOP.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Sort Logic
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    "Temp
    SORT et_clearingop BY ext_ref installment tr_type int_ref endorsement_ref  bit_ref ASCENDING.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Get UIM Items & Fill It
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    get_open_items(
     EXPORTING
       it_dfkkop_opbel =  lt_dfkkop_opbel_uim
     IMPORTING
       et_fkkcl_all    = lt_fkkcl_int
      EXCEPTIONS
      open_item_select_error = 1
    ).
    IF sy-subrc NE 0.
      RAISE open_item_select_error .
    ENDIF.

    SORT lt_fkkcl_int BY gpart.
    LOOP AT lt_fkkcl_int INTO DATA(ls_fkkcl).
      AT NEW gpart.
        DATA(lv_gpart) = ls_fkkcl-gpart.
        DATA(lv_bp_name) = zcl_clearingapp_services=>get_bp_name(
              iv_bp_id   = ls_fkkcl-gpart
              ir_bp_list = ra_bp ).
      ENDAT.

      APPEND INITIAL LINE TO et_clearingop ASSIGNING <fs_clearingop>.

      <fs_clearingop>-gpart               = lv_gpart.
      <fs_clearingop>-bp_name  = lv_bp_name.
      <fs_clearingop>-tr_type             = 'Unallocated Insurance Monies'.
      <fs_clearingop>-amn                 = convert_amn_sap_to_display(
                                       iv_original_currency = ls_fkkcl-waers
                                       iv_amount_in_sap     = CONV #(   ls_fkkcl-betrw )
                                     ) .
      <fs_clearingop>-exp_pay_amn         = <fs_clearingop>-amn.
      <fs_clearingop>-orig_curr           = ls_fkkcl-waers.
      <fs_clearingop>-exp_pay_curr        = ls_fkkcl-waers.
      <fs_clearingop>-roe_rec_curr        = 1.
      <fs_clearingop>-opbel               = ls_fkkcl-opbel.
      <fs_clearingop>-vkont               = ls_fkkcl-vkont.
      <fs_clearingop>-item                = ls_fkkcl-opupk.
      <fs_clearingop>-xblnr = ls_fkkcl-xblnr.
      <fs_clearingop>-hvorg = ls_fkkcl-hvorg.
      <fs_clearingop>-item = ls_fkkcl-opupk.
      <fs_clearingop>-rep_item = ls_fkkcl-opupw.
      <fs_clearingop>-subitem = ls_fkkcl-opupz.

      " Fill SOA Reference
      zcl_clearingapp_services=>get_soa_data(
        EXPORTING
          ira_soa_reference = ra_soa_reference
        CHANGING
          cs_clearingop     = <fs_clearingop>
      ).

      IF <fs_clearingop>-int EQ 3.
        lv_current_index = lines( et_clearingop ).
        DELETE et_clearingop INDEX lv_current_index.
        CONTINUE.
      ENDIF.

    ENDLOOP.



    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Common Filter
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    " Delete entries where delete flag set
    DELETE et_clearingop WHERE int EQ 3.

    " Delete entries where Settlement Currency is not equal to the Selection Filter Currency
    DELETE et_clearingop WHERE exp_pay_curr NE is_selectionparameters-currency.


    "SORT et_clearingop BY bit_ref ASCENDING.

  ENDMETHOD.


  METHOD get_premium_type.




    IF is_fkkcl-yypremium_type EQ 'AP' AND ( is_fkkcl-hvorg EQ 'X160' OR
             is_fkkcl-hvorg EQ 'X170' OR is_fkkcl-hvorg EQ 'X175' ) AND is_fkkcl-blart EQ 'EN'.
      rv_premiumtype = 'AP'.
    ELSEIF is_fkkcl-yypremium_type EQ 'AP' AND ( is_fkkcl-hvorg EQ 'T100' )
     AND is_fkkcl-blart EQ 'EN'.
      rv_premiumtype = 'AP Tax Receivable'.
    ELSEIF is_fkkcl-yypremium_type EQ 'DP' AND ( is_fkkcl-hvorg EQ 'X100' OR
  is_fkkcl-hvorg EQ 'X110' OR is_fkkcl-hvorg EQ 'X115' ) AND is_fkkcl-blart EQ 'PO'.
      rv_premiumtype = 'DP'.
    ELSEIF is_fkkcl-yypremium_type EQ 'DP' AND ( is_fkkcl-hvorg EQ 'T100' )
     AND is_fkkcl-blart EQ 'PO'.
      rv_premiumtype = 'DP Tax Receivable'.
    ELSEIF is_fkkcl-yypremium_type EQ 'RP' AND ( is_fkkcl-hvorg EQ 'X160' OR
        is_fkkcl-hvorg EQ 'X170' OR is_fkkcl-hvorg EQ 'X175' ) AND is_fkkcl-blart EQ 'EN'.
      rv_premiumtype = 'RP'.
    ELSEIF is_fkkcl-yypremium_type EQ 'RP' AND ( is_fkkcl-hvorg EQ 'T100' )
     AND is_fkkcl-blart EQ 'EN'.
      rv_premiumtype = 'AP Tax Receivable'.
    ELSE.
      IF is_fkkcl-hvorg NE 'T100'.
        rv_premiumtype =
         'DP'. "'Premium Receivable'.
      ELSE.
        rv_premiumtype = 'DP Tax'. "'Tax Receivable'.
      ENDIF.

    ENDIF.



  ENDMETHOD.


  METHOD get_roe_tr.


    IF av_bankstat_um_hvorg IS NOT INITIAL.
      SELECT 'I' AS sign, 'EQ' AS option, low AS low
             FROM tvarvc
             INTO CORRESPONDING FIELDS OF TABLE @av_originalcurr_xratediff
             WHERE name EQ 'YEL_FI_XRATEDIFF_CURR'.
    ENDIF.


    "  if is_clearingop-orig_curr = is_clearingop-exp_pay_curr



  ENDMETHOD.


  METHOD get_soa_data.


    DATA:
      ls_soa_data  TYPE yel_tb_clear_soa,
      lv_neg_value TYPE abap_bool.

    CLEAR: ls_soa_data.

    IF av_bankstat_um_hvorg IS INITIAL.

      SELECT SINGLE low INTO @av_bankstat_um_hvorg
      FROM tvarvc WHERE name EQ @ac_fi_bankstat_um_hvorg.
      IF sy-subrc NE 0.
        av_bankstat_um_hvorg = 'P210'.
      ENDIF.

    ENDIF.

    SELECT *
      INTO TABLE @DATA(lt_soa_data)
      FROM yel_tb_clear_soa
      WHERE opbel   EQ @cs_clearingop-opbel
        AND opupw   EQ @cs_clearingop-rep_item
        AND opupk   EQ @cs_clearingop-item
        AND opupz   EQ @cs_clearingop-subitem
        AND int_ref EQ @cs_clearingop-int_ref.
    IF sy-subrc EQ 0 AND lt_soa_data IS NOT INITIAL  .
      SORT lt_soa_data DESCENDING BY soa_count.
      ls_soa_data = lt_soa_data[ 1 ].
    ENDIF.



    IF sy-subrc NE 0 AND ira_soa_reference[] IS NOT INITIAL.

      IF cs_clearingop-hvorg NE av_bankstat_um_hvorg.
        cs_clearingop-int = 3. " Add Skip Flag
        "p_skip = abap_true.

      ENDIF.

    ELSEIF sy-subrc EQ 0 AND ira_soa_reference[] IS NOT INITIAL AND ls_soa_data-soa_reference NOT IN ira_soa_reference.
      IF cs_clearingop-hvorg NE av_bankstat_um_hvorg.
        cs_clearingop-int = 3. " Add Skip Flag
        " p_skip = abap_true.
      ENDIF.
    ELSEIF sy-subrc EQ 0.
      MOVE-CORRESPONDING ls_soa_data TO cs_clearingop.

      IF cs_clearingop-clearable_amount LT 0.
        lv_neg_value = abap_true.
      ELSE.
        lv_neg_value = abap_false.
      ENDIF.

      SELECT *
     INTO TABLE @DATA(lt_soa_cleared)
     FROM yel_tb_clrsoadet
     WHERE opbel     EQ @ls_soa_data-opbel
       AND opupw     EQ @ls_soa_data-opupw
       AND opupk     EQ @ls_soa_data-opupk
       AND opupz     EQ @ls_soa_data-opupz
       AND int_ref   EQ @ls_soa_data-int_ref.
      IF sy-subrc EQ 0.

        LOOP AT lt_soa_cleared INTO DATA(ls_soa_cleared).
          ADD ls_soa_cleared-cleared_amount TO cs_clearingop-finance_cleared.

          IF ls_soa_cleared-soa_count EQ ls_soa_data-soa_count.
            SUBTRACT ls_soa_cleared-cleared_amount FROM cs_clearingop-clearable_amount.
          ENDIF.
        ENDLOOP.

        IF ( cs_clearingop-clearable_amount LT 0 AND lv_neg_value EQ abap_false ) OR
           ( cs_clearingop-clearable_amount GT 0 AND lv_neg_value EQ abap_true ).

          CLEAR cs_clearingop-clearable_amount.

        ENDIF.


        IF cs_clearingop-clearable_amount EQ 0.

          CLEAR: cs_clearingop-clearable,
                 cs_clearingop-soa_reference,
                 cs_clearingop-soa_line_id,
                 cs_clearingop-soa_comments.
        ENDIF.


      ENDIF.
    ENDIF.

    CONCATENATE cs_clearingop-opbel
                  cs_clearingop-rep_item
                  cs_clearingop-item
                  cs_clearingop-subitem
                  cs_clearingop-int_ref
                  INTO DATA(lv_soa_id).


    CONDENSE lv_soa_id NO-GAPS.

    cs_clearingop-soa_id = lv_soa_id.


  ENDMETHOD.


  METHOD get_total_amount_in_orig_curr.

    DATA: lv_amount TYPE betrw_kk.

    rv_amount = 0.

    LOOP AT it_fkkcl ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

      " For Clearing Document CP, Clearing always done in Settlement Currency.
      " While Showing back we need to convert that to Original/Transaction Currency.
      IF <fs_fkkcl>-waers NE <fs_fkkcl>-yyext_currency AND <fs_fkkcl>-blart EQ 'CP'.
        CLEAR: lv_amount.
        lv_amount = zcl_clearingapp_services=>convert_to_foreign_currency(
           EXPORTING
             date                = <fs_fkkcl>-budat
             iv_foreign_currency = <fs_fkkcl>-yyext_currency
             iv_local_amount     = <fs_fkkcl>-betrw
             iv_local_currency   = <fs_fkkcl>-waers
             iv_rate             = <fs_fkkcl>-yyext_roe
         ).
        rv_amount = rv_amount + lv_amount.

      ELSE.
        rv_amount = rv_amount + <fs_fkkcl>-betrw.
      ENDIF.


    ENDLOOP.



  ENDMETHOD.


  METHOD process_cdc_clearing_in_batch.

    DATA: lt_seltab TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl  TYPE STANDARD TABLE OF fkkcl,
          lt_fkkopk TYPE STANDARD TABLE OF fkkopk,
          ls_fkkopk TYPE fkkopk,
          lv_opupk  TYPE opupk_kk,
          l_doc     TYPE opbel_kk,
          ls_ret    LIKE LINE OF ct_return.

    REFRESH: lt_seltab.
    CLEAR: lv_opupk.

    " Populate lt_seltab
    LOOP AT it_batch_add_info ASSIGNING FIELD-SYMBOL(<fs_fkkcl_ai>).
      IF <fs_fkkcl_ai>-opbel IS NOT INITIAL.
        APPEND VALUE #( selnr = sy-tabix selfn = 'OPBEL' selcu = <fs_fkkcl_ai>-opbel selco = <fs_fkkcl_ai>-opbel ) TO lt_seltab.
      ENDIF.
    ENDLOOP.

    " Call FKK_OPEN_ITEM_SELECT
    CALL FUNCTION 'FKK_OPEN_ITEM_SELECT'
      EXPORTING
        i_applk             = ac_message_type_success
        i_payment_date      = sy-datum
        i_payment_curr      = is_cdc-is_fkkko-waers
      TABLES
        t_seltab            = lt_seltab
        t_fkkcl             = lt_fkkcl
      EXCEPTIONS
        concurrent_clearing = 1
        payment_orders      = 2
        OTHERS              = 3.

    IF sy-subrc <> 0.
      " Handle error
      cv_err_flg = 'X'.
      DATA(lv_subrc) = sy-subrc.
      ls_ret-message = COND #( WHEN lv_subrc = 1 THEN 'Concurrent Clearing is in Progress'
                               WHEN lv_subrc = 2 THEN 'Payment Orders is in progress while reading open items'
                               WHEN lv_subrc = 3 THEN 'Issue Occurred while reading open items'     ).
      ls_ret-message_type = ac_message_type_error.
      ls_ret-item = is_cdc-item.
      APPEND ls_ret TO ct_return.
      CLEAR : ls_ret .
      RETURN.
    ELSE.

      LOOP AT lt_fkkcl INTO DATA(ls_fkkcl).
        DATA(lv_index) = sy-tabix.
        LOOP AT it_batch_add_info TRANSPORTING NO FIELDS WHERE
                                                     opbel EQ ls_fkkcl-opbel
                                                     AND opupw EQ ls_fkkcl-opupw
                                                     AND opupk EQ ls_fkkcl-opupk
                                                     AND opupz EQ ls_fkkcl-opupz.
          EXIT.
        ENDLOOP.
        IF sy-subrc IS NOT INITIAL.
          DELETE lt_fkkcl INDEX lv_index.
        ENDIF.
      ENDLOOP.
      IF lt_fkkcl IS INITIAL.
        cv_err_flg = 'X'.
        ls_ret-message_type = ac_message_type_error.
        ls_ret-message = 'No Valid Documents found while performing CDC Clearing'.
        ls_ret-item = is_cdc-item.
        APPEND ls_ret TO ct_return.
        CLEAR : ls_ret .
        RETURN.
      ENDIF.


      CALL FUNCTION 'FKK_OPEN_ITEM_CONVERT_CURRENCY'
        EXPORTING
          i_clearing_currency = is_cdc-is_fkkko-waers " Expected Payment Currency
          i_clearing_date     = is_cdc-is_fkkko-bldat     "Posting Date
        TABLES
          t_fkkcl             = lt_fkkcl.

      CLEAR: lv_opupk, lt_fkkopk.

      LOOP AT lt_fkkcl  ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

        DATA(ls_fkkcl_addinfo) = VALUE zsfkkcl_addinfo( it_batch_add_info[  opbel = <fs_fkkcl>-opbel
                                                    opupw = <fs_fkkcl>-opupw
                                                    opupk = <fs_fkkcl>-opupk
                                                    opupz = <fs_fkkcl>-opupz ] ).


        <fs_fkkcl>-augrd = '01'.
        <fs_fkkcl>-xaktp = 'X'.
        IF <fs_fkkcl>-blart EQ 'CR'.
          <fs_fkkcl>-augbw = ls_fkkcl_addinfo-clearing_amount - ls_fkkcl_addinfo-delta_due_roe.
        ELSE.
          <fs_fkkcl>-augbw = ls_fkkcl_addinfo-clearing_amount .
        ENDIF.
        <fs_fkkcl>-augbh = <fs_fkkcl>-augbw * <fs_fkkcl>-betrh / <fs_fkkcl>-betrw.
        <fs_fkkcl>-augb2 = <fs_fkkcl>-augbw * <fs_fkkcl>-betr2 / <fs_fkkcl>-betrw.
        <fs_fkkcl>-augb3 = <fs_fkkcl>-augbw * <fs_fkkcl>-betr3 / <fs_fkkcl>-betrw.
        <fs_fkkcl>-augbo = <fs_fkkcl>-augbw * <fs_fkkcl>-oribt / <fs_fkkcl>-betrw.
        <fs_fkkcl>-naugw = <fs_fkkcl>-augbw.
        <fs_fkkcl>-naugh = <fs_fkkcl>-augbh.
        <fs_fkkcl>-naug2 = <fs_fkkcl>-augb2.
        <fs_fkkcl>-naug3 = <fs_fkkcl>-augb3.
        <fs_fkkcl>-naugo = <fs_fkkcl>-augbo.
        CLEAR ls_fkkopk.
        ls_fkkopk-mandt = sy-mandt.
        ls_fkkopk-bukrs = <fs_fkkcl>-bukrs.
        ADD 1 TO lv_opupk.
        ls_fkkopk-opupk = lv_opupk.
        UNPACK ls_fkkcl_addinfo-gl_account TO ls_fkkopk-hkont.
        ls_fkkopk-segment = <fs_fkkcl>-segment.
        ls_fkkopk-prctr = <fs_fkkcl>-prctr.
        ls_fkkopk-betrw = <fs_fkkcl>-augbw.
        ls_fkkopk-fikey = iv_recon_key.
        APPEND ls_fkkopk TO lt_fkkopk.

      ENDLOOP.

      " Create document and clear
      CALL FUNCTION 'FKK_CREATE_DOC_AND_CLEAR'
        EXPORTING
          i_fkkko       = is_cdc-is_fkkko
          i_fkkopl_cf   = 'X'
          i_update_task = 'X'
        IMPORTING
          e_opbel       = l_doc
        TABLES
          t_fkkopk      = lt_fkkopk
          t_fkkcl       = lt_fkkcl.

      IF l_doc IS INITIAL.
        cv_err_flg = 'X'.
        ls_ret-message_type = ac_message_type_error.
        ls_ret-message = 'Document Creation Error while CDC clearing'.
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ELSE.
        ls_ret-message_type = ac_message_type_success.
        ls_ret-message = | Document item { is_cdc-item } simulated| .
        APPEND VALUE #( item = is_cdc-item is_fkkko = is_cdc-is_fkkko
                        it_fkkopk = lt_fkkopk it_fkkcl = lt_fkkcl ) TO et_cdc_fm_params.

        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ENDIF.

      ls_ret-item = is_cdc-item.
      APPEND ls_ret TO ct_return.
    ENDIF.

  ENDMETHOD.


  METHOD save_soa_data.


    DATA: lt_soa_data_new TYPE TABLE OF yel_tb_clear_soa,
          lt_soa_data_mod TYPE TABLE OF yel_tb_clear_soa,
          lt_soa_new      TYPE zcl_clearingapplicati_dpc_ext=>tt_soa_new,

          ls_soa_data_old TYPE yel_tb_clear_soa,
          ls_soa_data     TYPE yel_tb_clear_soa,

          lv_lines        TYPE i,
          lv_message      TYPE string,
          lv_answer       TYPE c.

    CLEAR: lt_soa_data_new[],
           lt_soa_data_mod[].

    soa_save_check_wrapper(
      EXPORTING
        it_clearingop = it_clearingop
      IMPORTING
        et_soa_new     = lt_soa_new
      CHANGING
        ct_soa_data_new = lt_soa_data_new
        ct_soa_data_mod = lt_soa_data_mod ).



    et_clearingop = it_clearingop.


    IF lt_soa_data_new[] IS INITIAL AND
         lt_soa_data_mod[] IS INITIAL.
    ELSE.

      "Data will be inserted or modified accordingly
      IF lt_soa_data_new[] IS NOT INITIAL.
        INSERT yel_tb_clear_soa FROM TABLE lt_soa_data_new.
        IF sy-subrc EQ 0.
          COMMIT WORK AND WAIT.

          "Update SOA count field for new SOA references
          LOOP AT lt_soa_new INTO DATA(ls_new_soa).
            LOOP AT et_clearingop ASSIGNING FIELD-SYMBOL(<fs_clearingop>) WHERE soaid EQ ls_new_soa-soa_id.
              <fs_clearingop>-soa_count = ls_new_soa-soa_count.
            ENDLOOP.
          ENDLOOP.

        ENDIF.
      ENDIF.
      IF lt_soa_data_mod[] IS NOT INITIAL.
        UPDATE yel_tb_clear_soa FROM TABLE lt_soa_data_mod.
        IF sy-subrc EQ 0.
          COMMIT WORK AND WAIT.
        ENDIF.
      ENDIF.
    ENDIF.




  ENDMETHOD.


  METHOD soa_save_check_wrapper.

    DATA ls_soa_data_old TYPE yel_tb_clear_soa.
    DATA ls_soa_data TYPE yel_tb_clear_soa.

    LOOP AT it_clearingop  ASSIGNING FIELD-SYMBOL(<fs_clearingop>) WHERE clearable        IS NOT INITIAL
                                          OR soa_reference    IS NOT INITIAL
                                          OR clearable_amount IS NOT INITIAL.


      "opbel rep_item item subitem int_ref clearable soa_reference soa_line_id clearable_amount soa_comments
      "orig_curr


      "Select current SOA Reference for the entry

      CLEAR: ls_soa_data_old,
             ls_soa_data.
      SELECT *
        INTO TABLE @DATA(lt_soa_data)
        FROM yel_tb_clear_soa
        WHERE opbel   EQ @<fs_clearingop>-opbel
          AND opupw   EQ @<fs_clearingop>-opupw
          AND opupk   EQ @<fs_clearingop>-opupk
          AND opupz   EQ @<fs_clearingop>-opupz
          AND int_ref EQ @<fs_clearingop>-int_ref.
      IF sy-subrc EQ 0.
        SORT lt_soa_data DESCENDING BY soa_count.
        READ TABLE lt_soa_data INTO ls_soa_data_old INDEX 1.
      ENDIF.

      IF ls_soa_data_old IS NOT INITIAL.
        "BEG_MOD MROCA NSDK903515: don't do anything if fields were cleared because of clearable amount = 0
        IF <fs_clearingop>-clearable IS INITIAL AND
           <fs_clearingop>-soa_reference IS INITIAL.

          CONTINUE.

        ELSEIF ls_soa_data_old-soa_reference EQ <fs_clearingop>-soa_reference AND          "update current SOA reference          "END_MOD MROCA NSDK903515
         ( ls_soa_data_old-clearable        NE <fs_clearingop>-clearable OR
           ls_soa_data_old-soa_line_id      NE <fs_clearingop>-soa_line_id OR
           ls_soa_data_old-clearable_amount NE <fs_clearingop>-clearable_amount OR
           ls_soa_data_old-soa_comments     NE <fs_clearingop>-soa_comments ).

          MOVE-CORRESPONDING ls_soa_data_old TO ls_soa_data.
          MOVE-CORRESPONDING <fs_clearingop> TO ls_soa_data.
          ls_soa_data-aenam = sy-uname.
          ls_soa_data-aedat = sy-datum.
          ls_soa_data-aezet = sy-uzeit.
          APPEND ls_soa_data TO ct_soa_data_mod.

        ELSEIF ls_soa_data_old-soa_reference NE <fs_clearingop>-soa_reference AND ls_soa_data_old-cleared EQ abap_false.    "override current SOA reference that was not cleared

          MOVE-CORRESPONDING ls_soa_data_old TO ls_soa_data.
          MOVE-CORRESPONDING <fs_clearingop> TO ls_soa_data.
          ls_soa_data-ernam = sy-uname.
          ls_soa_data-erdat = sy-datum.
          ls_soa_data-erzet = sy-uzeit.
          CLEAR: ls_soa_data-aenam,
                 ls_soa_data-aedat,
                 ls_soa_data-aezet.

          APPEND ls_soa_data TO ct_soa_data_mod.

        ELSEIF ls_soa_data_old-soa_reference NE <fs_clearingop>-soa_reference.       "insert new SOA reference

          MOVE-CORRESPONDING <fs_clearingop> TO ls_soa_data.
          ls_soa_data-opupw     = <fs_clearingop>-opupw.
          ls_soa_data-opupk     = <fs_clearingop>-opupk.
          ls_soa_data-opupz     = <fs_clearingop>-opupz.
          ls_soa_data-int_ref   = <fs_clearingop>-int_ref.
          ls_soa_data-soa_count = ls_soa_data_old-soa_count + 1.
          ls_soa_data-waers     = <fs_clearingop>-origcurr.
          ls_soa_data-ernam     = sy-uname.
          ls_soa_data-erdat     = sy-datum.
          ls_soa_data-erzet     = sy-uzeit.
          APPEND ls_soa_data TO ct_soa_data_new.

          APPEND INITIAL LINE TO et_soa_new ASSIGNING FIELD-SYMBOL(<fs_soa_new>).
          <fs_soa_new>-soa_id        = <fs_clearingop>-soaid.
          <fs_soa_new>-soa_reference = <fs_clearingop>-soa_reference.
          <fs_soa_new>-soa_count     = ls_soa_data-soa_count.
          ev_soa_new_ids = |{ ev_soa_new_ids }~{ <fs_soa_new>-soa_id }|.


        ENDIF.

      ELSE.     "insert new SOA reference
        MOVE-CORRESPONDING <fs_clearingop> TO ls_soa_data.
        ls_soa_data-opupw   = <fs_clearingop>-opupw.
        ls_soa_data-opupk   = <fs_clearingop>-opupk.
        ls_soa_data-opupz   = <fs_clearingop>-opupz.
        ls_soa_data-int_ref = <fs_clearingop>-int_ref.
        ls_soa_data-waers   = <fs_clearingop>-origcurr.
        ls_soa_data-ernam   = sy-uname.
        ls_soa_data-erdat   = sy-datum.
        ls_soa_data-erzet   = sy-uzeit.
        APPEND ls_soa_data TO ct_soa_data_new.
      ENDIF.
    ENDLOOP.


    "we check any rows where SOA data must be deleted
    LOOP AT it_clearingop ASSIGNING <fs_clearingop>  WHERE clearable     IS INITIAL
                                           AND soa_reference IS INITIAL
                                           AND soa_line_id   IS INITIAL
                                           AND issoafieldsmodified IS NOT INITIAL.

      "We check if fields where modified to initial

      SELECT SINGLE *
        INTO @ls_soa_data_old
        FROM yel_tb_clear_soa
        WHERE opbel   EQ @<fs_clearingop>-opbel
          AND opupw   EQ @<fs_clearingop>-opupw
          AND opupk   EQ @<fs_clearingop>-opupk
          AND opupz   EQ @<fs_clearingop>-opupz
          AND int_ref EQ @<fs_clearingop>-int_ref.
      IF sy-subrc EQ 0.
        CLEAR: ls_soa_data_old-clearable,
               ls_soa_data_old-soa_reference,
               ls_soa_data_old-soa_line_id,
               ls_soa_data_old-clearable_amount,
               ls_soa_data_old-soa_comments.

        ls_soa_data_old-aenam = sy-uname.
        ls_soa_data_old-aedat = sy-datum.
        ls_soa_data_old-aezet = sy-uzeit.
        APPEND ls_soa_data_old TO ct_soa_data_mod.
      ENDIF.

    ENDLOOP.

  ENDMETHOD.


  METHOD update_cp_soa_tables.
    DATA:   lt_clrsoadet_aux TYPE STANDARD TABLE OF yel_tb_clrsoadet.

    " For Claim Receivables, SOA table is not maintained
    IF purpose IS NOT INITIAL AND purpose NE 'CR'.
      " Update SOA Related Tables
      LOOP AT it_add_info ASSIGNING FIELD-SYMBOL(<fs_add_info>) WHERE ( trtype NE   'Payment'
                AND trtype NE 'Bank Charge' AND trtype NE 'OVER PAYMENT' ).
        UPDATE yel_tb_clear_soa SET cleared = abap_true WHERE opbel     EQ <fs_add_info>-opbel
                                                          AND opupw     EQ <fs_add_info>-opupw
                AND opupk     EQ <fs_add_info>-opupk
                AND opupz     EQ <fs_add_info>-opupz
                AND int_ref   EQ <fs_add_info>-yyintref
                                                          AND soa_count EQ <fs_add_info>-soa_count.   "MOD MROCA NSDK903255
        IF sy-subrc EQ 0.
          IF NOT line_exists( lt_clrsoadet_aux[ opbel = <fs_add_info>-opbel
                                                opupw = <fs_add_info>-opupw
                                                opupk = <fs_add_info>-opupk
                                                opupz = <fs_add_info>-opupz
                                                int_ref = <fs_add_info>-yyintref
                                                soa_count = <fs_add_info>-soa_count ] ). "MROCA NSDK903446


            DATA: lv_line        TYPE yel_tb_clrsoadet-line,
                  ls_soa_cleared TYPE yel_tb_clrsoadet.


            CLEAR lv_line.

            SELECT MAX( line )
              INTO lv_line
              FROM yel_tb_clrsoadet
              WHERE opbel     EQ <fs_add_info>-opbel
                AND opupw     EQ <fs_add_info>-opupw
                AND opupk     EQ <fs_add_info>-opupk
                AND opupz     EQ <fs_add_info>-opupz
                AND int_ref   EQ <fs_add_info>-yyintref
                AND soa_count EQ <fs_add_info>-soa_count.

            ADD 1 TO lv_line.
            ls_soa_cleared-opbel          = <fs_add_info>-opbel.
            ls_soa_cleared-opupw          = <fs_add_info>-opupw.
            ls_soa_cleared-opupk          = <fs_add_info>-opupk.
            ls_soa_cleared-opupz          = <fs_add_info>-opupz.
            ls_soa_cleared-int_ref        = <fs_add_info>-yyintref.
            ls_soa_cleared-soa_count      = <fs_add_info>-soa_count.
            ls_soa_cleared-line           = lv_line.
            ls_soa_cleared-cleared_date   = sy-datum.
            ls_soa_cleared-cleared_amount = <fs_add_info>-allocamn.
            ls_soa_cleared-waers          = <fs_add_info>-original_currency.

            INSERT yel_tb_clrsoadet FROM ls_soa_cleared.
            COMMIT WORK AND WAIT.
            APPEND ls_soa_cleared TO lt_clrsoadet_aux.
          ENDIF.
        ENDIF.
      ENDLOOP.
    ENDIF.

  ENDMETHOD.


  METHOD update_payref_tables.
    DATA: lv_sequence    TYPE i,
          lt_um_clearing TYPE TABLE OF yel_tb_umclearin,
          lt_payrefclear TYPE TABLE OF yel_tb_payrefclr,

          ls_um_clearing TYPE yel_tb_umclearin,
          ls_payrefclear TYPE yel_tb_payrefclr.



    LOOP AT it_add_info ASSIGNING FIELD-SYMBOL(<fs_add_info>).
      ADD 1 TO lv_sequence.

      CLEAR: ls_um_clearing,
             ls_payrefclear.

      "BEG_MOD MROCA NSDK903569: get corresponding bank account to fill
      "the new key field BANK_ACC in Y tables
      SELECT SINGLE bank_acc
        FROM yel_tb_payrefdet
        INTO @DATA(lv_bank_acc)
        WHERE doc_no EQ @<fs_add_info>-opbel.
      "END_MOD MROCA NSDK903569

      IF <fs_add_info>-paymentref IS NOT INITIAL.
        ls_payrefclear-opbel       = iv_opbel.
        ls_payrefclear-bank_acc    = lv_bank_acc.       "MOD MROCA NSDK903569
        ls_payrefclear-payment_ref = <fs_add_info>-paymentref.
        COLLECT ls_payrefclear INTO lt_payrefclear.
      ENDIF.

      ls_um_clearing-opbel           = iv_opbel.
      ls_um_clearing-bank_acc        = lv_bank_acc.     "MOD MROCA NSDK903569
      ls_um_clearing-sequence        = lv_sequence.
      ls_um_clearing-ext_ref         = <fs_add_info>-yyextref.
      ls_um_clearing-int_ref         = <fs_add_info>-yyintref.
      ls_um_clearing-alloc_amount    = <fs_add_info>-clearing_amount.
      ls_um_clearing-waers           = <fs_add_info>-expected_pay_currency.
      ls_um_clearing-gpart           = <fs_add_info>-businesspartnerno.
      ls_um_clearing-tr_type         = <fs_add_info>-trtype.
      ls_um_clearing-endorsement_ref = <fs_add_info>-yyendorsementref.
      ls_um_clearing-payment_ref     = <fs_add_info>-paymentref.
      ls_um_clearing-ernam           = <fs_add_info>-ernam.
      ls_um_clearing-erdat           = <fs_add_info>-erdat.
      ls_um_clearing-erzet           = <fs_add_info>-erzet.
      APPEND ls_um_clearing TO lt_um_clearing.
    ENDLOOP.

    MODIFY yel_tb_umclearin FROM TABLE lt_um_clearing.
    MODIFY yel_tb_payrefclr FROM TABLE lt_payrefclear.
    COMMIT WORK AND WAIT.

  ENDMETHOD.



  METHOD set_claim_receivables_data.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Logic for Fields -> AMN, SETT_AMN_ROE_TR, ROE_TR, ROE_REC_CURR, EXP_PAY_AMN
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""




    " same copy from existing
    DATA : lv_amn2_betrw1 TYPE betrw_kk,
           lv_amn2_betrw2 TYPE betrw_kk,
           lv_amount      TYPE betrw_kk,
           lo_type        TYPE REF TO cl_abap_tabledescr,
           lo_struct      TYPE REF TO cl_abap_structdescr.

    " Fetch Values on First Call
    IF at_amn1 IS INITIAL.

      " get Amount 1
      SELECT opbel, yybitref, SUM( betrh ) AS betrh, SUM( betrw ) AS betrw
          FROM @it_fkkcl_extended_all AS l
          GROUP BY opbel, yybitref
          INTO TABLE @DATA(lt_amn1).
      SORT lt_amn1 BY opbel yybitref.
      lo_type ?= cl_abap_typedescr=>describe_by_data( lt_amn1 ).
      lo_struct ?= lo_type->get_table_line_type( ).
      CREATE DATA at_amn1 TYPE HANDLE lo_type.
      ASSIGN at_amn1->* TO FIELD-SYMBOL(<fs_table>).
      <fs_table> = lt_amn1.
      UNASSIGN <fs_table>.

      " Get Amount 2
      SELECT dfkkop~yyextref, yybitref, dfkkop~yyelsclaimnum, dfkkop~opbel, opupw, opupk, opupz,
       betrw, dfkkop~budat, yyext_roe, hvorg
         FROM dfkkop
         INNER JOIN dfkkko
         ON dfkkop~opbel EQ dfkkko~opbel
          FOR ALL ENTRIES IN @it_fkkcl_extended_all
        WHERE augst EQ ''
          AND dfkkop~yyextref EQ @it_fkkcl_extended_all-yyextref
          AND yybitref EQ @it_fkkcl_extended_all-yybitref
          AND dfkkop~yyelsclaimnum EQ @it_fkkcl_extended_all-yyelsclaimnum
          AND yytr_id EQ @it_fkkcl_extended_all-yytr_id
          INTO TABLE @DATA(lt_amn2).
      lo_type ?= cl_abap_typedescr=>describe_by_data( lt_amn2 ).
      lo_struct ?= lo_type->get_table_line_type( ).
      CREATE DATA at_amn2 TYPE HANDLE lo_type.
      ASSIGN at_amn2->* TO <fs_table>.
      <fs_table> = lt_amn2.
      UNASSIGN <fs_table>.

    ELSE.
      ASSIGN at_amn1->* TO FIELD-SYMBOL(<fs_amn1_t>).
      lt_amn1 = <fs_amn1_t>.
      ASSIGN at_amn2->* TO FIELD-SYMBOL(<fs_amn2_t>).
      lt_amn2 = <fs_amn2_t>.

    ENDIF.



    READ TABLE lt_amn1 ASSIGNING FIELD-SYMBOL(<fs_amn1>) WITH KEY opbel = is_fkkcl-opbel
                                                      yybitref = is_fkkcl-yybitref BINARY SEARCH.

    IF sy-subrc IS INITIAL.
      CLEAR: lv_amn2_betrw1, lv_amn2_betrw2.
      LOOP AT lt_amn2 INTO DATA(ls_amn2) WHERE yyextref EQ is_fkkcl-yyextref
                                     AND yybitref EQ is_fkkcl-yybitref
                                     AND yyelsclaimnum EQ is_fkkcl-yyelsclaimnum
                                     AND opbel NE is_fkkcl-opbel.

        ADD ls_amn2-betrw TO lv_amn2_betrw2.

        IF ls_amn2-hvorg IN ira_hvorg.

          IF cs_clearingop-orig_curr EQ cs_clearingop-exp_pay_curr.
            ADD ls_amn2-betrw TO lv_amn2_betrw1.
          ELSE.

            CLEAR lv_amount.
            zcl_clearingapp_services=>convert_to_foreign_currency(
             EXPORTING
               date                = ls_amn2-budat
               iv_foreign_currency = cs_clearingop-orig_curr
               iv_local_amount     = ls_amn2-betrw
               iv_local_currency   = cs_clearingop-exp_pay_curr
               iv_rate             = ls_amn2-yyext_roe
             RECEIVING
               rv_amount           = lv_amount
           ).

            ADD lv_amount TO lv_amn2_betrw1.

          ENDIF.

        ENDIF.

      ENDLOOP.

      cs_clearingop-amn = <fs_amn1>-betrw + lv_amn2_betrw1.

      IF cs_clearingop-orig_curr EQ cs_clearingop-exp_pay_curr.
        cs_clearingop-sett_amn_roe_tr = cs_clearingop-amn.
      ELSE.
        cs_clearingop-sett_amn_roe_tr = <fs_amn1>-betrh  + lv_amn2_betrw2.
      ENDIF.

      cs_clearingop-roe_tr = is_fkkcl-kursf.
      cs_clearingop-roe_rec_curr = is_fkkcl-kursf.
      cs_clearingop-exp_pay_amn = cs_clearingop-sett_amn_roe_tr.


      "If DFKKOP record is unique by OPBEL & BITREF then set REP_ITEM & SUB_ITEM, else this fields stay empty
*                IF ls_amn1-count EQ 1.
*                  ls_alv_main-rep_item = ls_dfkkop-opupw.
*                  ls_alv_main-subitem = ls_dfkkop-opupz.
*                ENDIF.

    ENDIF.

  ENDMETHOD.


  METHOD get_open_items.

    DATA lv_start_index TYPE sy-tabix.
    DATA lv_end_index TYPE sy-tabix.
    DATA lv_count TYPE sy-tabix.
    DATA lv_total_records TYPE i.
    DATA: lt_seltab    TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl_int TYPE STANDARD TABLE OF fkkcl.

    lv_total_records = lines( it_dfkkop_opbel ).

    CALL FUNCTION 'DEQUEUE_ALL'.

    " Split and get Open Items
    DO.
      lv_start_index = sy-index * 5000 - 4999.
      lv_end_index = sy-index * 5000.
      IF lv_end_index > lv_total_records.
        lv_end_index = lv_total_records.
      ENDIF.

      CLEAR lt_seltab.
      REFRESH lt_fkkcl_int.
      lv_count = 0.
      LOOP AT it_dfkkop_opbel INTO DATA(ls_dfkkop_opbel) FROM lv_start_index TO lv_end_index.
        lv_count = lv_count + 1.
        APPEND VALUE #( selnr = lv_count selfn = 'OPBEL' selcu = ls_dfkkop_opbel-opbel ) TO lt_seltab.
      ENDLOOP.

      CALL FUNCTION 'FKK_OPEN_ITEM_SELECT'
        EXPORTING
          i_applk             = ac_message_type_success
          i_no_enqueue        = iv_no_enqueue
          i_payment_date      = sy-datum
          i_auth_actvt        = '03'
        TABLES
          t_seltab            = lt_seltab
          t_fkkcl             = lt_fkkcl_int
          t_where             = it_where
        EXCEPTIONS
          concurrent_clearing = 1
          payment_orders      = 2
          OTHERS              = 3.
      IF sy-subrc <> 0.
        RAISE open_item_select_error.
        " Handle error
        EXIT. " or appropriate error handling
      ENDIF.

      " Append the intermediate results to the final table
      APPEND LINES OF lt_fkkcl_int TO et_fkkcl_all.

      " Check if all records are processed
      IF lv_end_index = lv_total_records.
        EXIT.
      ENDIF.

    ENDDO.
  ENDMETHOD.

  METHOD perform_auto_clearing_for_cr.
" Here the DM documents will be cleared with CC documents
    DATA: lt_seltab    TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl     TYPE STANDARD TABLE OF fkkcl,
          lt_fkkcl_all TYPE STANDARD TABLE OF fkkcl,
          lt_fkkopk    TYPE STANDARD TABLE OF fkkopk,
          ls_fkkopk    TYPE fkkopk,
          lv_opupk     TYPE opupk_kk,
          l_doc        TYPE opbel_kk,
          lt_where     TYPE STANDARD TABLE OF rsdswhere.


    DATA(lv_tabix) = VALUE sy-tabix(  ).

    " First add DM documents
    APPEND VALUE #( selnr = 1 selfn = 'OPBEL' selcu = is_add_info-opbel selco = is_add_info-opbel ) TO lt_seltab.


    " ADD CC Documents
    APPEND VALUE #( selnr = 2 selfn = 'OPBEL' selcu = is_cc_doc-opbel selco = is_cc_doc-opbel ) TO lt_seltab.

    APPEND VALUE #( line = |( yybitref EQ '{ is_cc_doc-yybitref }'  ) |
 ) TO lt_where.

    " Call FKK_OPEN_ITEM_SELECT
    CALL FUNCTION 'FKK_OPEN_ITEM_SELECT'
      EXPORTING
        i_applk             = ac_message_type_success
        i_payment_date      = sy-datum
        i_payment_curr      = 'USD'
      TABLES
        t_seltab            = lt_seltab
        t_fkkcl             = lt_fkkcl_all
        t_where             = lt_where
      EXCEPTIONS
        concurrent_clearing = 1
        payment_orders      = 2
        OTHERS              = 3.
    IF sy-subrc NE 0 OR
     lines( lt_fkkcl_all ) < 1.
      " Raise error
      es_return = VALUE #( item = 800 message_type = ac_message_type_error message = |Relavant CC and DM Documents are not found to perform Auto-Clearing or Concurrent Clearing is happening.| ).
      ev_err_flg = abap_true.
      RETURN.
    ENDIF.

    " Keep only the current CC and DM documents
    SORT lt_fkkcl_all BY opbel opupw opupk opupz  ASCENDING.

    APPEND VALUE #( lt_fkkcl_all[ opbel = is_cc_doc-opbel
                                    opupw = is_cc_doc-opupw
                                    opupz = is_cc_doc-opupz
                                    opupk = is_cc_doc-opupk  ]  ) TO lt_fkkcl.
    APPEND VALUE #( lt_fkkcl_all[ opbel = is_add_info-opbel
                                    opupw = is_add_info-opupw
                                    opupz = is_add_info-opupz
                                    opupk = is_add_info-opupk  ]  ) TO lt_fkkcl.



    IF lt_fkkcl IS INITIAL OR lines( lt_fkkcl ) < 2.
      " Raise error
      es_return = VALUE #( item = 800 message_type = ac_message_type_error message = |Relavant CC and DM Documents are not found to perform Auto-Clearing| ).
      ev_err_flg = abap_true.
      RETURN.
    ENDIF.

    CALL FUNCTION 'FKK_OPEN_ITEM_CONVERT_CURRENCY'
      EXPORTING
        i_clearing_currency = is_add_info-expected_pay_currency  " Expected Payment Currency
        i_clearing_date     = is_add_info-postingdate    "Posting Date
      TABLES
        t_fkkcl             = lt_fkkcl.

    CLEAR: lv_opupk, lt_fkkopk.
    DATA:   recon_key TYPE fikey_kk
    .
    " Initially Create FIKey
    CALL FUNCTION 'ZF_BAPI_CTRACRECKEY'
      EXPORTING
        i_key      = 'CO'
        commit     = 'X'
      IMPORTING
        o_reconkey = recon_key.

    SORT lt_fkkcl BY blart DESCENDING. " Sorting it descending makes the DM comes first which store the
    " clearing details in ls_fkkcl_addinfo which will be used to fill for CC docs
    LOOP AT lt_fkkcl  ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).

      <fs_fkkcl>-augrd = '08'.
      <fs_fkkcl>-xaktp = 'X'.
      IF <fs_fkkcl>-blart EQ 'DM'.
        <fs_fkkcl>-augbw = is_add_info-clearing_amount .
      ELSE.
        <fs_fkkcl>-augbw = is_add_info-clearing_amount * -1.
      ENDIF.
      <fs_fkkcl>-augbh = <fs_fkkcl>-augbw * <fs_fkkcl>-betrh / <fs_fkkcl>-betrw.
      <fs_fkkcl>-augb2 = <fs_fkkcl>-augbw * <fs_fkkcl>-betr2 / <fs_fkkcl>-betrw.
      <fs_fkkcl>-augb3 = <fs_fkkcl>-augbw * <fs_fkkcl>-betr3 / <fs_fkkcl>-betrw.
      <fs_fkkcl>-augbo = <fs_fkkcl>-augbw * <fs_fkkcl>-oribt / <fs_fkkcl>-betrw.
      <fs_fkkcl>-naugw = <fs_fkkcl>-augbw.
      <fs_fkkcl>-naugh = <fs_fkkcl>-augbh.
      <fs_fkkcl>-naug2 = <fs_fkkcl>-augb2.
      <fs_fkkcl>-naug3 = <fs_fkkcl>-augb3.
      <fs_fkkcl>-naugo = <fs_fkkcl>-augbo.
      CLEAR ls_fkkopk.
      ls_fkkopk-mandt = sy-mandt.
      ls_fkkopk-bukrs = <fs_fkkcl>-bukrs.
      ADD 1 TO lv_opupk.
      ls_fkkopk-opupk = lv_opupk.
      UNPACK is_add_info-gl_account TO ls_fkkopk-hkont.
      ls_fkkopk-segment = <fs_fkkcl>-segment.
      ls_fkkopk-prctr = <fs_fkkcl>-prctr.
      ls_fkkopk-betrw = <fs_fkkcl>-augbw.
      ls_fkkopk-fikey = recon_key.
      APPEND ls_fkkopk TO lt_fkkopk.

    ENDLOOP.

*
    " Create document and clear
    DATA: ls_fkkko TYPE fkkko.
    ls_fkkko-fikey = recon_key .
    ls_fkkko-applk = ac_message_type_success.
    ls_fkkko-blart = 'YY'.
    ls_fkkko-herkf = '01'.
    ls_fkkko-ernam = is_add_info-ernam.
    ls_fkkko-cpudt = is_add_info-erdat.
    ls_fkkko-cputm = is_add_info-erzet.
    ls_fkkko-waers = is_add_info-expected_pay_currency.
    ls_fkkko-bldat = is_add_info-erdat.
    ls_fkkko-budat = is_add_info-postingdate.
    CALL FUNCTION 'FKK_CREATE_DOC_AND_CLEAR'
      EXPORTING
        i_fkkko       = ls_fkkko
        i_fkkopl_cf   = 'X'
        i_update_task = 'X'
      IMPORTING
        e_opbel       = l_doc
      TABLES
        t_fkkopk      = lt_fkkopk
        t_fkkcl       = lt_fkkcl.
    IF iv_testrun IS NOT INITIAL.
      IF l_doc IS INITIAL.
        ev_err_flg = 'X'.
        es_return-message_type = ac_message_type_error.
        es_return-message = |Automatic Clearing Failed for { is_cc_doc-opbel } and { is_add_info-opbel }|.
        es_return-item = iv_item_no.
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ELSE.
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ENDIF.
      RETURN.
    ELSE.
      " In Prod Run
      IF l_doc IS INITIAL.
        ev_err_flg = 'X'.
        es_return-message_type = ac_message_type_error.
        es_return-message = |Automatic Clearing Failed for { is_cc_doc-opbel } and { is_add_info-opbel }|.
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ELSE.
        es_return-document_number = l_doc.
        es_return-message_type = ac_message_type_success.
        es_return-message = |Automatic Clearing With Document { l_doc } is Successful|.
        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'.
      ENDIF.
      es_return-item = iv_item_no.
    ENDIF.

  ENDMETHOD.

  METHOD perform_documents_reversal.

    DATA: lv_recon_key TYPE fikey_kk,
          lv_doc_no    TYPE bapidfkkko-doc_no,
          ls_return    TYPE bapiret2,
          ls_ret       LIKE LINE OF et_return.

    " Get the document types for the documents to be reversed.
    SELECT opbel, blart, budat
      FROM dfkkko
      INTO TABLE @DATA(lt_docs_with_doctype)
      WHERE opbel IN @it_docs.

    LOOP AT lt_docs_with_doctype     ASSIGNING FIELD-SYMBOL(<fs_doc>).
      " Create FI Key
      CALL FUNCTION 'ZF_BAPI_CTRACRECKEY'
        EXPORTING
          i_key      = 'RV'
          commit     = 'X'
        IMPORTING
          o_reconkey = lv_recon_key.
      CALL FUNCTION 'BAPI_CTRACDOCUMENT_REVERSE'
        EXPORTING
          documentnumber     = <fs_doc>-opbel
          POST_DATE          = <fs_doc>-budat
          doc_type           = 'YR'
          clear_reas         = '05'
*         RETURN_REASON      = ' '
          fikey              = lv_recon_key
          "doc_source_key     = '02'
          "reverse_date       = <fs_doc>-budat
*         ALL_REPETITIONS    = ' '
*         TESTRUN            = ' '
*         RECKEYINFO         =
*         REVERSEMETHODE     = ' '
*         CHECKARCHIVE       = ' '
*         CALLER_ID          =
*         CHECKVOIDINGREASON =
*         TRANSFERPOST       =
        IMPORTING
          rev_documentnumber = lv_doc_no
          return             = ls_return.
      IF lv_doc_no IS NOT INITIAL.
        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'.
      ELSE.
        ls_ret-item = 800.
        ls_ret-message_type = ac_message_type_error.
        ls_ret-message = |Document  { <fs_doc>-opbel } cannot be reversed|.
        APPEND ls_ret TO et_return.
      ENDIF.
    ENDLOOP.

  ENDMETHOD.

  METHOD perform_claimfund_clearing.

    DATA: ra_stamp_mem_id    TYPE RANGE OF dfkkop-yystamp_member_id,
          lv_recon_key       TYPE  fikey_kk,
          ls_fkkko           TYPE fkkko,
          lv_doc             TYPE opbel_kk,
          ls_return          TYPE bapiret2,
          lv_amount          TYPE betrw_kk,
          lt_fkkcl_cc_ip     TYPE tt_fkkcl_cc_ip,
          lo_connection      TYPE REF TO cl_sql_connection,

          lt_claimfund_fkkcl TYPE ty_lt_fkkcl_all.


    CONSTANTS: lc_document_type_dm TYPE blart VALUE 'DM',
               lc_clearing_reason  TYPE augrd_kk VALUE '08'.

*
*    " Check if all the items are set with collection type as F
*    SELECT SINGLE COUNT( * ) AS row FROM @ct_input AS in
*    WHERE coll_type NE 'F'
*    INTO @DATA(lv_check_colltype) .
*    IF lv_check_colltype > 0.
*      APPEND VALUE #(  type = ac_message_type_error message = 'Not All FICA docs are updated with Claim Fund Collection Type'  ) TO ct_return.
*      RETURN.
*    ENDIF.

    ra_stamp_mem_id = VALUE #( FOR <fs_stamp_mem_id> IN ct_input
                              sign = ac_sign_i option = ac_option_eq ( low = <fs_stamp_mem_id>-stamp_member_id ) ).

    IF ra_stamp_mem_id IS INITIAL.
      APPEND VALUE #(  type = ac_message_type_error message = 'Stamp Member ID is missing'  ) TO ct_return.
      RETURN.
    ENDIF.


    " Get reference data from first input entry
    DATA(ls_ref_input) = ct_input[ 1 ].

    " Fetch relevant claim documents
    SELECT a~opbel, a~yyuway , b~spart, b~prctr, b~yybitref, b~yystamp_member_id, b~yymember, b~yyfronter, b~opupk, a~yyextref, a~yyelsclaimnum
    , yyucr, yytr_id, gpart, b~betrw, b~yyatype, b~pymet, b~HERKF_KK
    FROM dfkkko AS a
    INNER JOIN dfkkop AS b ON a~opbel = b~opbel
      INTO  TABLE @DATA(lt_claim_dm_docs)
      WHERE a~blart = @lc_document_type_dm
      AND a~yyextref = @ls_ref_input-extref
      AND a~yyelsclaimnum = @ls_ref_input-claim_id
      AND a~yyucr = @ls_ref_input-ucr
      AND a~yytr_id = @ls_ref_input-tr_id
      AND a~stbel = @space
      AND a~storb = @space
      AND b~augst NE '9'
      AND b~yystamp_member_id IN @ra_stamp_mem_id
      AND b~bukrs = @ls_ref_input-company_code
      AND b~spart = @ls_ref_input-lob
      AND b~gpart = @ls_ref_input-payer.

    DATA(lt_claimfund) = VALUE tt_claimfund(  ).

    DATA: ls_claim_dm LIKE LINE OF lt_claim_dm_docs.

    " Before  proceeding, check if all fica docs are updated with required collection type
    LOOP AT ct_input ASSIGNING FIELD-SYMBOL(<fs_input>).
      TRY.
          ls_claim_dm = VALUE #( lt_claim_dm_docs[ yyextref = <fs_input>-extref
                                          yyelsclaimnum = <fs_input>-claim_id
                                          yyucr = <fs_input>-ucr
                                          yytr_id = <fs_input>-tr_id
                                          yymember = <fs_input>-partner_id
                                          yystamp_member_id = <fs_input>-stamp_member_id
                                          gpart = <fs_input>-payer  ]  ).
          IF ls_claim_dm-pymet NE 'F'.
            APPEND VALUE #(  type = ac_message_type_error message = 'Not All FICA docs are updated with Claim Fund Collection Type'  ) TO ct_return.
            RETURN.
          ENDIF.
        CATCH cx_sy_itab_line_not_found.
      ENDTRY.

    ENDLOOP.



    " Iterate for each member from Input and initiate the process
    LOOP AT ct_input ASSIGNING <fs_input>.
      DATA(lv_tabix) = sy-tabix.

      " Initially Dequeue all
      CALL FUNCTION 'DEQUEUE_ALL'.

      TRY.
          " Get the Doc detail for current Entry
          ls_claim_dm = VALUE #( lt_claim_dm_docs[ yyextref = <fs_input>-extref
                                     yyelsclaimnum = <fs_input>-claim_id
                                     yyucr = <fs_input>-ucr
                                     yytr_id = <fs_input>-tr_id
                                     yymember = <fs_input>-partner_id
                                     yystamp_member_id = <fs_input>-stamp_member_id
                                     gpart = <fs_input>-payer  ] ).
        CATCH cx_sy_itab_line_not_found.
          " Check if the DM document is there but cleared
          SELECT SINGLE *  FROM dfkkko AS a
            INNER JOIN dfkkop AS b ON a~opbel = b~opbel
            INTO @DATA(lv_is_dm_cleared)
                     WHERE a~blart = @lc_document_type_dm
              AND a~yyextref = @<fs_input>-extref
              AND a~yyelsclaimnum = @<fs_input>-claim_id
              "AND a~yyucr = @ls_ref_input-ucr uncomment it >>>>>>>>>>>>>>>>>>>>>>>>
              AND a~yytr_id = @<fs_input>-tr_id
              AND b~yystamp_member_id EQ @<fs_input>-stamp_member_id
              AND b~bukrs = @<fs_input>-company_code
              AND b~spart = @<fs_input>-lob
              AND b~gpart = @<fs_input>-payer.
          IF lv_is_dm_cleared IS NOT INITIAL.
            APPEND VALUE #( row = lv_tabix  type = ac_message_type_information message = |DM dcoument is already cleared|   )
                 TO ct_return.
            <fs_input>-status = ac_char_failed.
          ELSE.
            APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |FICA Document not found for this member { <fs_input>-partner_id }.|   )
                    TO ct_return.
            <fs_input>-status = ac_char_failed.
          ENDIF.
          CONTINUE.
      ENDTRY.

      " Fetch claim fund documents (to be implemented)
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " To be implemented
      " Fetched For Payer, Profit Center, UWY( use Like at START Removing 1st Letter), BUKRS, LOB, >> ??? - member
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

      " First Check if it is a QS Chinese Member
      SELECT SINGLE member
        FROM yel_tb_clmqsmemb
        INTO @DATA(ls_qsmember)
        WHERE
        member EQ @<fs_input>-partner_id AND
        agreement_id  EQ @<fs_input>-agreement_id AND
        stamp_member_id EQ @<fs_input>-stamp_member_id.
      DATA(lv_where) = |gpart = '{ <fs_input>-payer }' and prctr = '{ ls_claim_dm-prctr }' and yyuway like '%{ substring( val = ls_claim_dm-yyuway off = 1 ) }' | &&
                       | and spart = '{ ls_claim_dm-spart }' and bukrs = '{ <fs_input>-company_code }' and| &&
                       | ( ( blart IN ( 'FP', 'RD', 'SD', 'DM' ) ) )   |.
      .

      IF ls_claim_dm-yyatype EQ 'QS' AND ls_qsmember IS  INITIAL. " For QS
        lv_where = |{ lv_where } and ( ( ( yymember = '{ ls_claim_dm-yymember }' and yyfronter = '{ ls_claim_dm-yyfronter }' )  or ( yymember = '{ ls_claim_dm-yyfronter }' ) )  and ( iscqsentry is null or blart eq 'FP' ) )|.
      ELSE. " For Frontier and China QS


        IF ls_qsmember IS NOT INITIAL. " For CQS
          lv_where = | { lv_where } and ( ( ( yymember = '{ ls_claim_dm-yymember }' and yyfronter = '{ ls_claim_dm-yyfronter }' ) and  iscqsentry is not null   ) | &&
                    | or (  blart eq 'FP' and yymember = '{ ls_claim_dm-yymember }' )  ) |.

        ELSEIF ls_claim_dm-yyatype EQ 'UAA' . " For Frontier

          lv_where = | { lv_where } and ( ( yymember = '{ ls_claim_dm-yymember }' or yyfronter = '{ ls_claim_dm-yymember }'  ) and ( iscqsentry is null or blart eq 'FP' ) ) |.
        ENDIF.
        "lv_where = |{ lv_where } and ( yymember = '{ ls_claim_dm-yymember }' ) and ( iscqsentry is not null or blart eq 'FP' )|.
      ENDIF.




      SELECT * FROM zi_cashclaim
      WHERE (lv_where)
      INTO TABLE @DATA(lt_cf_docs).

      DATA(lt_claimfund_docs) = VALUE tt_opbel(  ).
      lt_claimfund_docs = CORRESPONDING #( lt_cf_docs DISCARDING DUPLICATES  ).

      IF lt_claimfund_docs IS INITIAL.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |No Claim Fund Docs Available|   )
           TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.
      CLEAR: lt_claimfund_fkkcl.

      SORT lt_claimfund_docs BY opbel.
      DELETE ADJACENT DUPLICATES FROM lt_claimfund_docs COMPARING opbel.
      get_open_items(
        EXPORTING
        iv_no_enqueue = abap_false
        it_dfkkop_opbel = lt_claimfund_docs
        IMPORTING
          et_fkkcl_all    = lt_claimfund_fkkcl
        EXCEPTIONS
          open_item_select_error = 1
        ).
      IF sy-subrc NE 0.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Open Item Select Error: Concurrent Clearing Happening!|   )
                TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ELSE.
        " Check if the line is already cleared
        SORT lt_claimfund_fkkcl BY blart yybitref.
        IF NOT line_exists( lt_claimfund_fkkcl[ blart = 'DM' yybitref = ls_claim_dm-yybitref   ] ).
          APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Open Item Not Found! Claim Receivable with bitref -  { ls_claim_dm-yybitref }, | &&
                                         | yymember =  { ls_claim_dm-yymember }  and yyfronter =  { ls_claim_dm-yyfronter }  may be already cleared. |   )
                  TO ct_return.
          <fs_input>-status = ac_char_failed.
          CONTINUE.
        ENDIF.

      ENDIF.


      IF lt_claimfund_fkkcl IS INITIAL.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |No FICA Documents found from Open Item |   )
           TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.


      " Apply filters to Remove Unwanted Entries
      DELETE lt_claimfund_fkkcl WHERE ( blart EQ 'SD' OR blart EQ 'RD' ) AND pymet NE 'F'.
      DELETE lt_claimfund_fkkcl WHERE ( blart EQ 'DM' ) AND pymet NE 'F' AND yybitref NE  ls_claim_dm-yybitref.

      " Custom Filters applied by me
      DELETE lt_claimfund_fkkcl WHERE ( blart EQ 'SD' OR blart EQ 'RD' ) AND pymet NE 'F'.


      " Apply Filter based on type:>>>

      " For QS Members
      IF ls_claim_dm-yyatype EQ 'QS' AND ls_qsmember IS  INITIAL .

        " Here we only keep where lt_fkkcl_main.yyfronter is empty and lt_fkkcl_main.yymember = fronter of input qs member.
        " Remove Fund of other Fronters
        DELETE lt_claimfund_fkkcl WHERE
            ( blart = 'FP' OR blart = 'DM' OR blart = 'RD' OR blart = 'SD' )
           AND ( yyfronter EQ 'NA'  OR   yyfronter = '' )
           AND yymember NE ls_claim_dm-yyfronter.

        " Remove Fund of other Members
        DELETE lt_claimfund_fkkcl WHERE
            ( blart = 'FP' OR blart = 'DM' OR blart = 'RD' OR blart = 'SD' )
           AND yyfronter EQ  ls_claim_dm-yyfronter
           AND yymember NE ls_claim_dm-yymember.


        " Keep only the DM item related to the current entry
        DELETE lt_claimfund_fkkcl WHERE blart EQ 'DM' AND yybitref NE ls_claim_dm-yybitref.

      ELSE.
        " Direct Member or Chinese QS Member acting as Direct Member

        " Items which belongs to other direct members
        DELETE lt_claimfund_fkkcl WHERE
             ( blart = 'FP' OR blart = 'DM' OR blart = 'RD' OR blart = 'SD' )
             AND ( yyfronter = 'NA' OR   yyfronter = '' )
             AND yymember NE <fs_input>-partner_id.

        " Current Input member is not a fronting member in PAYABLES and not fronting same YYMEMBER
        DELETE lt_claimfund_fkkcl WHERE
             ( blart = 'FP' OR blart = 'DM' OR blart = 'RD' OR blart = 'SD' )
        AND (  yyfronter  NE 'NA'  AND   yyfronter NE '' )
        AND yymember NE <fs_input>-partner_id.

        " Keep only the DM item related to the current entry
        DELETE lt_claimfund_fkkcl WHERE blart EQ 'DM' AND yybitref NE ls_claim_dm-yybitref.

      ENDIF.

      DATA(lv_error_flag) = VALUE boole_d(  ).

      " Perform Validations
      validate_claim_fund_clearamn(
        EXPORTING
          it_fkkcl           = lt_claimfund_fkkcl
          iv_posting_date    = <fs_input>-posting_date
          iv_settlement_curr = <fs_input>-settlement_curr
          iv_yybitref        =  ls_claim_dm-yybitref
        IMPORTING
          ev_error_flag      = lv_error_flag
      ).

      IF lv_error_flag IS NOT INITIAL.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Fund Payable is Not GT Amount to be Cleared for Member { <fs_input>-partner_id }|   )
        TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.


      " Keep only the DM item related to the current entry
      DELETE lt_claimfund_fkkcl WHERE blart EQ 'DM' AND yybitref NE ls_claim_dm-yybitref.
      IF NOT line_exists( lt_claimfund_fkkcl[ blart = 'DM' yybitref = ls_claim_dm-yybitref ] ).
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Current DM document is not found|   )
         TO ct_return.
        cv_error_flag = abap_true.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.


      " Convert Currency
      CALL FUNCTION 'FKK_OPEN_ITEM_CONVERT_CURRENCY'
        EXPORTING
          i_clearing_currency = <fs_input>-settlement_curr
          i_clearing_date     = <fs_input>-posting_date
        TABLES
          t_fkkcl             = lt_claimfund_fkkcl.

      init_claim_clearing_process(
      EXPORTING
        it_fkkcl = lt_claimfund_fkkcl
        iv_tabix           = lv_tabix
        iv_dm_yybitref     = ls_claim_dm-yybitref
        iv_dm_opbel        = ls_claim_dm-opbel
        iv_dm_betrw        = ls_claim_dm-betrw
      CHANGING
        cv_error_flag = cv_error_flag
        ct_return     = ct_return
        cs_input      = <fs_input> ).
    ENDLOOP.


  ENDMETHOD.
  METHOD validate_claim_fund_clearamn.
    " This method validates whether fund payable is GT the amount cleared.

    DATA: lv_amn_to_be_cleared TYPE betrh_kk,
          lv_amn_in_claimfund  TYPE betrh_kk.

    DATA(lt_fkkcl) = VALUE fkkcl_t( FOR <fs_fkkcl> IN it_fkkcl
                                      WHERE ( ( ( blart EQ 'DM' OR blart EQ 'SD' OR blart EQ 'RD' )
                                                      AND pymet EQ 'F' ) OR blart EQ 'FP'  )
                                    ( CORRESPONDING #( <fs_fkkcl> ) )  ).


    CALL FUNCTION 'FKK_OPEN_ITEM_CONVERT_CURRENCY'
      EXPORTING
        i_clearing_currency = iv_settlement_curr
        i_clearing_date     = iv_posting_date
      TABLES
        t_fkkcl             = lt_fkkcl.


    LOOP AT lt_fkkcl INTO DATA(ls_fkkcl).

      IF ls_fkkcl-blart EQ 'DM' AND ls_fkkcl-pymet EQ 'F' AND ls_fkkcl-yybitref EQ iv_yybitref.
        ADD ls_fkkcl-betrw TO lv_amn_to_be_cleared.
      ELSEIF ( ( ls_fkkcl-blart EQ 'DM' OR ls_fkkcl-blart EQ 'SD' OR ls_fkkcl-blart EQ 'RD' ) AND ls_fkkcl-pymet EQ 'F'
      AND ls_fkkcl-yybitref NE iv_yybitref ) OR ls_fkkcl-blart EQ 'FP'.
        ADD ls_fkkcl-betrw TO lv_amn_in_claimfund.
      ENDIF.

    ENDLOOP.

    IF lv_amn_in_claimfund GT 0 OR abs( lv_amn_in_claimfund ) LT lv_amn_to_be_cleared .
      ev_error_flag = 'X'.
    ENDIF.


  ENDMETHOD.


  METHOD validate_claim_offset_clearamn.
    " This method validates whether fund payable is GT the amount cleared.
    " Initially We convert the currency to settlement currency, the sort it in the order of RD, SD and then DR documents.
    " Then we keep only lines till we have sufficient amount for clearing.
    " Based on which we will clear.

    DATA: lv_amn_to_be_cleared  TYPE betrh_kk,
          lv_amn_in_claimoffset TYPE betrh_kk.

    DATA(lt_fkkcl) = VALUE fkkcl_t( FOR <fs_fkkcl> IN ct_fkkcl
                                      WHERE ( ( ( blart EQ 'DM' OR blart EQ 'SD' OR blart EQ 'RD' )
                                                      AND pymet EQ 'O' ) OR blart EQ 'DR'  )
                                    ( CORRESPONDING #( <fs_fkkcl> ) )  ).

    CALL FUNCTION 'FKK_OPEN_ITEM_CONVERT_CURRENCY'
      EXPORTING
        i_clearing_currency = iv_settlement_curr
        i_clearing_date     = iv_posting_date
      TABLES
        t_fkkcl             = lt_fkkcl.

*    SORT lt_fkkcl BY blart.
*
*    DATA(ls_dm_fkkcl) = lt_fkkcl[ blart = 'DM'  yybitref = iv_yybitref ].
*    DELETE lt_fkkcl WHERE blart EQ 'DM'.
*
*    DATA(lt_fkkcl_temp) = lt_fkkcl.
*    DELETE lt_fkkcl_temp WHERE blart NE 'RD'.
*
*    DATA(lt_fkkcl_temp_1) = lt_fkkcl.
*    DELETE lt_fkkcl_temp_1 WHERE blart NE 'SD'.
*    APPEND LINES OF lt_fkkcl_temp_1 TO lt_fkkcl_temp.
*
*    lt_fkkcl_temp_1 = lt_fkkcl.
*    DELETE lt_fkkcl_temp_1 WHERE blart NE 'DR'.
*    APPEND LINES OF lt_fkkcl_temp_1 TO lt_fkkcl_temp.
*
*    lt_fkkcl = lt_fkkcl_temp.
*
*
*    DATA(lv_total) = 0.
*    DATA(lv_index) = 1.
*
*    LOOP AT lt_fkkcl INTO DATA(ls_fkkcl).
*
*      lv_total = lv_total + abs( ls_fkkcl-betrw ).
*      IF  lv_total >= ls_dm_fkkcl-betrw.
*        DELETE lt_fkkcl FROM sy-tabix + 1.
*        EXIT.
*
*      ENDIF.
*    ENDLOOP.
*
*    APPEND ls_dm_fkkcl TO lt_fkkcl.

    LOOP AT lt_fkkcl INTO DATA(ls_fkkcl).

      IF ls_fkkcl-blart EQ 'DM' AND ls_fkkcl-pymet EQ 'O' AND ls_fkkcl-yybitref EQ iv_yybitref.
        ADD ls_fkkcl-betrw TO lv_amn_to_be_cleared.
      ELSEIF ( ( ls_fkkcl-blart EQ 'DM' OR ls_fkkcl-blart EQ 'SD' OR ls_fkkcl-blart EQ 'RD' ) AND ls_fkkcl-pymet EQ 'O'
      AND ls_fkkcl-yybitref NE iv_yybitref ) OR ls_fkkcl-blart EQ 'DR'.
        ADD ls_fkkcl-betrw TO lv_amn_in_claimoffset.
      ENDIF.

    ENDLOOP.

    ct_fkkcl = lt_fkkcl.

    IF lv_amn_in_claimoffset GT 0 OR abs( lv_amn_in_claimoffset ) LT lv_amn_to_be_cleared .
      ev_error_flag = 'X'.
    ENDIF.


  ENDMETHOD.


  METHOD perform_bulk_clearing_in_fm.

    DATA: lv_created_document TYPE opbel_kk.

    LOOP AT it_fkkcl_cc_ip ASSIGNING FIELD-SYMBOL(<fs_fkkcl_cc_ip>).

      " Create document and clear
      CALL FUNCTION 'FKK_CREATE_DOC_AND_CLEAR'
        EXPORTING
          i_fkkko       = <fs_fkkcl_cc_ip>-fkkko
          i_fkkopl_cf   = 'X'
          i_update_task = 'X'
        IMPORTING
          e_opbel       = lv_created_document
        TABLES
          t_fkkcl       = <fs_fkkcl_cc_ip>-fkkcl.

      IF lv_created_document IS INITIAL.
        cv_error_flag = 'X'.
        APPEND VALUE #( type = ac_message_type_error message = 'Document Creation Error while CDC clearing' ) TO ct_return.
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
        RETURN.
      ELSE.
        APPEND VALUE #( type = ac_message_type_success message = |Document { lv_created_document } simulated and waiting for commit| ) TO ct_return.
        RETURN.
      ENDIF.
    ENDLOOP.

  ENDMETHOD.

  METHOD perform_premiumoffset_clearing.

    DATA: ra_stamp_mem_id    TYPE RANGE OF dfkkop-yystamp_member_id.

    CONSTANTS: lc_document_type_dm TYPE blart VALUE 'DM',
               lc_clearing_reason  TYPE augrd_kk VALUE '08'.


    " Check if all the items are set with collection type as O
    SELECT SINGLE COUNT( * ) AS row FROM @ct_input AS in
    WHERE coll_type NE 'O'
    INTO @DATA(lv_check_colltype) .
    IF lv_check_colltype > 0.
      APPEND VALUE #(  type = ac_message_type_error message = 'Not All FICA docs are updated with Claim Offset Collection Type'  ) TO ct_return.
      RETURN.
    ENDIF.


    ra_stamp_mem_id = VALUE #( FOR <fs_stamp_mem_id> IN ct_input
                             sign = ac_sign_i option = ac_option_eq ( low = <fs_stamp_mem_id>-stamp_member_id ) ).

    IF ra_stamp_mem_id IS INITIAL.
      APPEND VALUE #(  type = ac_message_type_error message = 'Stamp Member ID is missing'  ) TO ct_return.
      RETURN.
    ENDIF.


    " Get reference data from first input entry
    DATA(ls_ref_input) = ct_input[ 1 ].


    " Fetch relevant claim documents
    SELECT a~opbel,b~bukrs, b~spart, b~opupk, b~opupw, b~opupz, b~betrw, b~waers, b~yybitref, a~yyuway, b~prctr, b~gpart, CAST( b~yymember AS CHAR(  10 ) ) AS yymember,
                                      b~yystamp_member_id, b~yyagreement_id, b~yyatype,
                                      b~yyfronter, b~yyfronting_agreement_id, spart AS lob, ' ' AS qs_tag, b~yyextref, b~yyelsclaimnum, a~yytr_id, a~yyucr, b~pymet
    FROM dfkkko AS a
    INNER JOIN dfkkop AS b ON a~opbel = b~opbel
      INTO  TABLE @DATA(lt_claim_dm_docs)
      WHERE a~blart = @lc_document_type_dm
      AND a~yyextref = @ls_ref_input-extref
      AND a~yyelsclaimnum = @ls_ref_input-claim_id
      AND a~yyucr = @ls_ref_input-ucr "uncomment it >>>>>>>>>>>>>>>>>>>>>>>>
      AND a~yytr_id = @ls_ref_input-tr_id
      AND a~stbel = @space
      AND a~storb = @space
      AND b~augst NE '9'
      AND b~yystamp_member_id IN @ra_stamp_mem_id
      AND b~bukrs = @ls_ref_input-company_code
      AND b~spart = @ls_ref_input-lob
      AND b~gpart = @ls_ref_input-payer.

    DATA(lt_claimoffset) = VALUE tt_claimfund(  ).

    DATA: ls_claim_dm LIKE LINE OF lt_claim_dm_docs.

    IF lt_claim_dm_docs IS INITIAL.
      APPEND VALUE #(  type = ac_message_type_error message = 'No FICA Documents Found'  ) TO ct_return.
      RETURN.
    ENDIF.


    " Before  proceeding, check if all fica docs are updated with required collection type
    LOOP AT ct_input ASSIGNING FIELD-SYMBOL(<fs_input>).
      TRY.
          ls_claim_dm = VALUE #( lt_claim_dm_docs[ yyextref = <fs_input>-extref
                                          yyelsclaimnum = <fs_input>-claim_id
                                          yyucr = <fs_input>-ucr
                                          yytr_id = <fs_input>-tr_id
                                          yymember = <fs_input>-partner_id
                                          yystamp_member_id = <fs_input>-stamp_member_id
                                          gpart = <fs_input>-payer  ]  ).
          IF ls_claim_dm-pymet NE 'O'.
            APPEND VALUE #(  type = ac_message_type_error message = 'Not All FICA docs are updated with Claim Fund Collection Type'  ) TO ct_return.
            RETURN.
          ENDIF.
        CATCH cx_sy_itab_line_not_found.
      ENDTRY.

    ENDLOOP.



    " Update CQS Tag
    IF lt_claim_dm_docs IS NOT INITIAL.
      " Get Special QS agreements
      SELECT member , agreement_id, stamp_member_id
          FROM yel_tb_clmqsmemb
          INTO TABLE @DATA(lt_special_qs_agreements)
          FOR ALL ENTRIES IN @lt_claim_dm_docs
          WHERE
          member EQ @lt_claim_dm_docs-yymember AND
          agreement_id EQ  @lt_claim_dm_docs-yyagreement_id AND
          stamp_member_id EQ  @lt_claim_dm_docs-yystamp_member_id
          .
      SORT lt_special_qs_agreements BY member agreement_id stamp_member_id.

      " Now Update the QS Tag in main table
      LOOP AT lt_claim_dm_docs ASSIGNING FIELD-SYMBOL(<fs_claim_dm_group>).
        IF line_exists( lt_special_qs_agreements[ member = <fs_claim_dm_group>-yymember
                                                 agreement_id = <fs_claim_dm_group>-yyagreement_id
                                                  stamp_member_id = <fs_claim_dm_group>-yystamp_member_id
                                                 ] ) .
          <fs_claim_dm_group>-qs_tag = abap_true.
        ENDIF.
      ENDLOOP.
    ENDIF.


    " Get the frontier or CQS entry
    SELECT DISTINCT gpart, yymember, yyuway, lob FROM @lt_claim_dm_docs AS lgs
               WHERE yyatype NE 'QS' OR ( yyatype = 'QS' AND qs_tag EQ 'X' )
               ORDER BY gpart, yymember, yyuway, lob
               INTO TABLE @DATA(lt_fronter_cqs_offset_rules).
    IF lt_fronter_cqs_offset_rules IS INITIAL OR lines( lt_fronter_cqs_offset_rules ) > 1.
      IF NOT line_exists( lt_claim_dm_docs[ qs_tag = abap_true ] ).
        APPEND VALUE #(  type = ac_message_type_error message = |Fronter/CQS is not found.|   )
                       TO ct_return.
        cv_error_flag = abap_true.
        RETURN.
      ELSE.
        " Fronter Scenario, wherein fronter is cleared but executed for uncleared QS. So get the fronter details.
        SELECT SINGLE b~yymember, b~gpart, a~yyuway, b~spart FROM
         dfkkop AS b
         INNER JOIN dfkkko AS a
         ON a~opbel = b~opbel
         WHERE  a~blart = @lc_document_type_dm
        AND a~yyextref = @ls_ref_input-extref
        AND a~yyelsclaimnum = @ls_ref_input-claim_id
        "AND a~yyucr = @ls_ref_input-ucr uncomment it >>>>>>>>>>>>>>>>>>>>>>>>
        AND a~yytr_id = @ls_ref_input-tr_id
        AND b~yystamp_member_id IN @ra_stamp_mem_id
        AND b~bukrs = @ls_ref_input-company_code
        AND b~spart = @ls_ref_input-lob
        AND b~gpart = @ls_ref_input-payer
        AND b~yyatype = 'UAA'
        INTO @DATA(ls_fronter).
        IF sy-subrc NE 0 OR ls_fronter IS INITIAL.
          " In Some Scenario Document for Frontier is not created wherein OWN_VL = 0, then use data from any member FICA Document
          DATA(ls_fronter_data_copy) = lt_claim_dm_docs[ 1 ].
          lt_fronter_cqs_offset_rules = VALUE #( ( yymember = ls_fronter_data_copy-yyfronter gpart = ls_fronter_data_copy-gpart
                                                   yyuway = ls_fronter_data_copy-yyuway lob = ls_fronter_data_copy-spart  ) ).
*          APPEND VALUE #(  type = ac_message_type_error message = |Fronter/CQS is not found.|   )
*                         TO ct_return.
*          cv_error_flag = abap_true.
*          RETURN.
        ELSE.
          APPEND CORRESPONDING #( ls_fronter MAPPING lob = spart ) TO lt_fronter_cqs_offset_rules.
        ENDIF.
      ENDIF.
    ENDIF.



    " Check if there is any configuration maintained for this combo
    SELECT *
        FROM yel_clmoffsetcfg AS a
        INTO TABLE @DATA(lt_config)
        FOR ALL ENTRIES IN @lt_fronter_cqs_offset_rules
        WHERE a~member = @lt_fronter_cqs_offset_rules-yymember
          AND a~payer = @lt_fronter_cqs_offset_rules-gpart
          AND a~clm_uway = @lt_fronter_cqs_offset_rules-yyuway
          AND a~lob = @lt_fronter_cqs_offset_rules-lob.

    SORT lt_config BY member payer clm_uway lob.

    DATA(ls_fronter_cqs_offset_rules) = lt_fronter_cqs_offset_rules[ 1 ].

    " Check if configuration is available
    DATA(ls_config) = VALUE yel_clmoffsetcfg( lt_config[ member = ls_fronter_cqs_offset_rules-yymember
                                                         payer = ls_fronter_cqs_offset_rules-gpart
                                                         clm_uway = ls_fronter_cqs_offset_rules-yyuway
                                                         lob = ls_fronter_cqs_offset_rules-lob
                                                         ] OPTIONAL ).

    DATA(lv_where_claimoffset_default) = VALUE string(  ).
    IF ls_config IS NOT INITIAL.
      construct_offset_config_where(
        EXPORTING
          is_config      = ls_config
          iv_postingdate = COND #( WHEN ls_ref_input-posting_date IS INITIAL THEN sy-datum ELSE ls_ref_input-posting_date )
        CHANGING
          cv_where       = lv_where_claimoffset_default
      ).
    ELSE.
      " No Configuration Available. Apply Default Period filter as Quarter
      get_startenddate_for_quarter(
         EXPORTING
           iv_postingdate = COND #( WHEN ls_ref_input-posting_date IS INITIAL THEN sy-datum ELSE ls_ref_input-posting_date )
         CHANGING
           cv_where       = lv_where_claimoffset_default
       ).
    ENDIF.

    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Iterating At Each Members & Frontier
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    LOOP AT ct_input ASSIGNING <fs_input>.

      DATA(lv_tabix) = sy-tabix.

      " Initially Set the Posting date
      <fs_input>-posting_date = COND #( WHEN <fs_input>-posting_date IS INITIAL THEN sy-datum ELSE <fs_input>-posting_date ).

      TRY.
          " Get the Doc detail for current Entry
          ls_claim_dm = VALUE #( lt_claim_dm_docs[ yyextref = <fs_input>-extref
                                     yyelsclaimnum = <fs_input>-claim_id
                                     yyucr = <fs_input>-ucr
                                     yytr_id = <fs_input>-tr_id
                                     yymember = <fs_input>-partner_id
                                     yystamp_member_id = <fs_input>-stamp_member_id
                                     gpart = <fs_input>-payer  ] ).
        CATCH cx_sy_itab_line_not_found.
          " Check if the DM document is there but cleared
          SELECT SINGLE *  FROM dfkkko AS a
            INNER JOIN dfkkop AS b ON a~opbel = b~opbel
            INTO @DATA(lv_is_dm_cleared)
                     WHERE a~blart = @lc_document_type_dm
              AND a~yyextref = @<fs_input>-extref
              AND a~yyelsclaimnum = @<fs_input>-claim_id
              AND a~yyucr = @ls_ref_input-ucr "uncomment it >>>>>>>>>>>>>>>>>>>>>>>>
              AND a~yytr_id = @<fs_input>-tr_id
              AND b~yystamp_member_id EQ @<fs_input>-stamp_member_id
              AND b~bukrs = @<fs_input>-company_code
              AND b~spart = @<fs_input>-lob
              AND b~gpart = @<fs_input>-payer.
          IF lv_is_dm_cleared IS NOT INITIAL.
            APPEND VALUE #( row = lv_tabix  type = ac_message_type_information message = |DM dcoument is already cleared|   )
                 TO ct_return.
            <fs_input>-status = ac_char_failed.
          ELSE.
            APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |FICA Document not found for this member { <fs_input>-partner_id }.|   )
                    TO ct_return.
            <fs_input>-status = ac_char_failed.
          ENDIF.
          CONTINUE.
      ENDTRY.

      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " At Frontier/CQS with Members : Iterate and Apply the filter to the Claim Offset View Based on the Configuration
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


      " Initially add default filter
      IF lv_where_claimoffset_default IS NOT INITIAL.
        DATA(lv_where_claimoffset) = | { lv_where_claimoffset_default } and |.
      ENDIF.
      lv_where_claimoffset = | { lv_where_claimoffset } gpart = '{ ls_claim_dm-gpart }' and spart = '{ ls_claim_dm-spart }' and bukrs = '{ ls_claim_dm-bukrs }' | &&
                | ( ( blart IN ( 'DR', 'RD', 'SD', 'DM' ) and waers = '{ <fs_input>-settlement_curr }' ) )   |.
      IF ls_claim_dm-qs_tag EQ abap_true
      OR ls_claim_dm-yyatype NE 'QS'.

        IF ls_claim_dm-qs_tag EQ abap_true.
          lv_where_claimoffset = | { lv_where_claimoffset } and ( yymember = '{ ls_claim_dm-yymember }' and yyfronter = '{ ls_claim_dm-yyfronter }' ) and iscqsentry is not null |.
        ELSEIF ls_claim_dm-yyatype EQ 'UAA' .
          lv_where_claimoffset = | { lv_where_claimoffset } and ( yymember = '{ ls_claim_dm-yymember }' or yyfronter = '{ ls_claim_dm-yymember }'  ) and iscqsentry is null |.
        ENDIF.
      ELSE.
        lv_where_claimoffset = | { lv_where_claimoffset } and ( ( yymember = '{ ls_claim_dm-yymember }' and yyfronter = '{ ls_claim_dm-yyfronter }' )  or ( yymember = '{ ls_claim_dm-yyfronter }' ) ) and iscqsentry is null |.
      ENDIF.


      " Fetch data from the claim offset view
      DATA(lt_claimoffsetclearables) =   fetch_data_claim_offset_view(
           EXPORTING
             iv_where_condition   = lv_where_claimoffset
             iv_settlement_curr   = <fs_input>-settlement_curr
             iv_posting_date      = <fs_input>-posting_date
             iv_amn_to_be_cleared = ls_claim_dm-betrw
             iv_yybitref          = ls_claim_dm-yybitref

         ).

      IF lt_claimoffsetclearables IS INITIAL.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |No Claim Offset Payables Found From View.|   )
            TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.
      SORT lt_claimoffsetclearables BY blart.
      IF NOT line_exists( lt_claimoffsetclearables[ blart = 'DM' yybitref = ls_claim_dm-yybitref   ] ).
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Open Item Not Found! Claim Receivable with Payer = { ls_claim_dm-gpart } and  bitref -  { ls_claim_dm-yybitref }, | &&
                                       | yymember =  { ls_claim_dm-yymember }  and yyfronter =  { ls_claim_dm-yyfronter }  may be already cleared. |   )
                TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.

      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " Get Open Items
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

      DATA(lt_po_docs) = VALUE tt_opbel(  ).
      DATA(lt_po_fkkcl) = VALUE ty_lt_fkkcl_all(  ).
      lt_po_docs = CORRESPONDING #( lt_claimoffsetclearables ).
      APPEND VALUE #( opbel = ls_claim_dm-opbel ) TO lt_po_docs.
      SORT lt_po_docs BY opbel.
      DELETE ADJACENT DUPLICATES FROM lt_po_docs COMPARING opbel.
      CLEAR: lt_po_fkkcl.


      get_open_items_w_opupk_filter(
        EXPORTING
        iv_no_enqueue = abap_false
        it_opbel_with_items = CORRESPONDING #( lt_claimoffsetclearables )
        it_dfkkop_opbel = lt_po_docs
        IMPORTING
          et_fkkcl_all    = lt_po_fkkcl
            EXCEPTIONS
          open_item_select_error = 1
        ).
      IF sy-subrc NE 0.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Open Item Select Error: Concurrent Clearing Happening!|   )
                     TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ELSE.
        " Check if the current clearing DM Doc is already cleared
        SORT lt_po_fkkcl BY blart yybitref.
        IF NOT line_exists( lt_po_fkkcl[ blart = 'DM' yybitref = ls_claim_dm-yybitref   ] ).
          APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message = |Open Item Not Found! Claim Receivable with Payer = { ls_claim_dm-gpart } and  bitref -  { ls_claim_dm-yybitref }, | &&
                                         | yymember =  { ls_claim_dm-yymember }  and yyfronter =  { ls_claim_dm-yyfronter }  may be already cleared. |   )
                  TO ct_return.
          <fs_input>-status = ac_char_failed.
          CONTINUE.
        ENDIF.
      ENDIF.


      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " Remove Unwanted Entries
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

      " Remove DM Documents which are not relevant
      DELETE lt_po_fkkcl WHERE blart = 'DM' AND yybitref NE ls_claim_dm-yybitref.


      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " Perform Validation - Check if Required Offset Premium is available to Clear
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

      validate_claim_offset_clearamn(
        EXPORTING
          iv_posting_date    = <fs_input>-posting_date
          iv_settlement_curr = <fs_input>-settlement_curr
          iv_yybitref        = ls_claim_dm-yybitref
        IMPORTING
          ev_error_flag      = DATA(lv_error_flag)
        CHANGING
                      ct_fkkcl           = lt_po_fkkcl
                    ).
      IF lv_error_flag IS NOT INITIAL.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message =

         |Offset Premium is Not GT Amount to be Cleared for Payer = { ls_claim_dm-gpart } | &&
                                          | yymember =  { ls_claim_dm-yymember }  and yyfronter =  { ls_claim_dm-yyfronter }. |   )
                   TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.
      lv_error_flag = abap_false.

      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      " Perform Clearing
      """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
      init_claim_clearing_process(
        EXPORTING
          it_fkkcl = lt_po_fkkcl
          iv_tabix           = lv_tabix
          iv_dm_yybitref     = ls_claim_dm-yybitref
          iv_dm_opbel        = ls_claim_dm-opbel
          iv_dm_betrw        = ls_claim_dm-betrw
        CHANGING
          cv_error_flag      = lv_error_flag
          ct_return          = ct_return
          cs_input           = <fs_input>
      ).

      IF lv_error_flag EQ abap_true.
        APPEND VALUE #( row = lv_tabix  type = ac_message_type_error message =

          | Clearing Process - Failed for Payer = { ls_claim_dm-gpart } | &&
                                           | yymember =  { ls_claim_dm-yymember }  and yyfronter =  { ls_claim_dm-yyfronter }  may be already cleared. |   )
                    TO ct_return.
        <fs_input>-status = ac_char_failed.
        CONTINUE.
      ENDIF.

    ENDLOOP.


  ENDMETHOD.


  METHOD construct_offset_config_where.


    " YYUWAY PA22  -> %22
    IF is_config-uway EQ 1.
    if cv_Where is not initial.
      cv_where = | { cv_where } and |.
      endif.
      cv_where = | { cv_where } yyuway like  '%{ substring( val = is_config-clm_uway off = 2 )   }' |.

    ENDIF.


    " POOL   0 -> %A%
    IF is_config-pool EQ 1.
        if cv_Where is not initial.
      cv_where = | { cv_where } and |.
      endif.
      cv_where = | { cv_where } yyuway like  '%{ substring( val = is_config-clm_uway  off = 1 len = 1 )   }%' |.
    ENDIF.


    " Posting Period Filter
    " Monthly
    IF is_config-period EQ 0.

      DATA(lv_startdate) = CONV budat( iv_postingdate(6) && '01' ).
      DATA(lv_enddate) =  lv_startdate.
      DATA(lv_next_month) = CONV budat( lv_startdate + 31 ).
      DATA(lv_next_month_char) = CONV char8( lv_next_month ).
      DATA(lv_next_month_first) = lv_next_month_char(6) && '01'.
      " Convert back to date type
      lv_enddate = CONV budat( lv_next_month_first ) - 1.
    if cv_Where is not initial.
      cv_where = | { cv_where } and |.
      endif.
      cv_where = | { cv_where }  budat between '{ lv_startdate }' and '{ lv_enddate }' |.

    ELSEIF is_config-period EQ 1.
      get_startenddate_for_quarter(
        EXPORTING
          iv_postingdate = iv_postingdate
        CHANGING
          cv_where       = cv_where
      ).
    ENDIF.




  ENDMETHOD.



  METHOD get_startenddate_for_quarter.

    DATA lv_startdate TYPE budat.
    DATA lv_enddate TYPE budat.

    DATA: lv_month TYPE i,
          lv_year  TYPE i.

    lv_month = iv_postingdate+4(2).
    lv_year  = iv_postingdate(4).

    CASE lv_month.
      WHEN 1 OR 2 OR 3.
        lv_startdate = |{ lv_year }0101|.
        lv_enddate   = |{ lv_year }0401|.
      WHEN 4 OR 5 OR 6.
        lv_startdate = |{ lv_year }0401|.
        lv_enddate   = |{ lv_year }0701|.
      WHEN 7 OR 8 OR 9.
        lv_startdate = |{ lv_year }0701|.
        lv_enddate   = |{ lv_year }1001|.
      WHEN OTHERS.
        lv_startdate = |{ lv_year }1001|.
        lv_enddate   = |{ lv_year + 1 }0101|.
    ENDCASE.
    lv_enddate = CONV budat( lv_enddate - 1 ).
    IF cv_where IS NOT INITIAL.
      cv_where = | { cv_where } and |.
    ENDIF.
    cv_where = | { cv_where } budat between '{ lv_startdate }' and '{ lv_enddate }' |.

  ENDMETHOD.


  METHOD get_open_items_w_opupk_filter.

    DATA lv_start_index TYPE sy-tabix.
    DATA lv_end_index TYPE sy-tabix.
    DATA lv_count TYPE sy-tabix.
    DATA lv_total_records TYPE i.
    DATA: lt_seltab    TYPE STANDARD TABLE OF iseltab,
          lt_fkkcl_int TYPE STANDARD TABLE OF fkkcl,
          lt_where     TYPE STANDARD TABLE OF rsdswhere.

    lv_total_records = lines( it_dfkkop_opbel ).

    CALL FUNCTION 'DEQUEUE_ALL'.

    " Split and get Open Items
    DO.
      lv_start_index = sy-index * 200 - 199.
      lv_end_index = sy-index * 200.
      IF lv_end_index > lv_total_records.
        lv_end_index = lv_total_records.
      ENDIF.

      CLEAR lt_seltab.
      REFRESH: lt_fkkcl_int, lt_where.
      lv_count = 0.
      LOOP AT it_dfkkop_opbel INTO DATA(ls_dfkkop_opbel) FROM lv_start_index TO lv_end_index.
        lv_count = lv_count + 1.
        APPEND VALUE #( selnr = lv_count selfn = 'OPBEL' selcu = ls_dfkkop_opbel-opbel ) TO lt_seltab.

        lt_where = VALUE #( BASE  lt_where   FOR <fs_dfkkop> IN it_opbel_with_items
                            WHERE ( opbel = ls_dfkkop_opbel-opbel ) ( line = | ( opbel EQ '{ <fs_dfkkop>-opbel }' and opupk EQ '{ <fs_dfkkop>-opupk }' ) OR | ) ).

      ENDLOOP.

      DATA(ls_where) =  lt_where[ lines( lt_where ) ].
      ls_where-line  = substring( val = ls_where-line
                       len = strlen( ls_where-line  ) - 3 ).


      DELETE lt_where INDEX lines( lt_where ) .
      APPEND ls_where TO lt_where.


      CALL FUNCTION 'FKK_OPEN_ITEM_SELECT'
        EXPORTING
          i_applk             = ac_message_type_success
          i_no_enqueue        = iv_no_enqueue
          i_payment_date      = sy-datum
          i_auth_actvt        = '03'
        TABLES
          t_seltab            = lt_seltab
          t_fkkcl             = lt_fkkcl_int
          t_where             = lt_where
        EXCEPTIONS
          concurrent_clearing = 1
          payment_orders      = 2
          OTHERS              = 3.
      IF sy-subrc <> 0.
        RAISE open_item_select_error.
        " Handle error
        EXIT. " or appropriate error handling
      ENDIF.

      " Append the intermediate results to the final table
      APPEND LINES OF lt_fkkcl_int TO et_fkkcl_all.

      " Check if all records are processed
      IF lv_end_index = lv_total_records.
        EXIT.
      ENDIF.

    ENDDO.
  ENDMETHOD.

  METHOD fetch_data_claim_offset_view.

    " First get all valid offset entries available : Follow Sort Order of Document type SD > RD > DR, Oldest Posting Date and Higher Amount
    SELECT * FROM zi_claimoffset
        WHERE (iv_where_condition)
         ORDER BY sort_order, budat ASCENDING , betrw DESCENDING
        INTO TABLE @DATA(lt_claimoffset).

    DATA(lt_claimoffset_dm) = lt_claimoffset.
    DELETE lt_claimoffset_dm WHERE NOT ( blart EQ 'DM' AND yybitref EQ iv_yybitref ).
    DELETE lt_claimoffset WHERE blart EQ 'DM'.



    DATA(lv_total_offset) = VALUE betrw_kk( ).

    LOOP AT lt_claimoffset ASSIGNING FIELD-SYMBOL(<fs_claim_offset>).
      DATA(lv_tabix) = sy-tabix.

      DATA(lv_converted_amount) = convert_to_foreign_currency(
                                  date                = iv_posting_date
                                  iv_foreign_currency = iv_settlement_curr
                                  iv_local_amount     = <fs_claim_offset>-betrw
                                  iv_local_currency   = <fs_claim_offset>-waers
                              ).

      lv_total_offset = lv_total_offset + lv_converted_amount.

      rt_dfkkop = VALUE #( BASE rt_dfkkop ( CORRESPONDING #( <fs_claim_offset> ) )  ).

      IF abs(  lv_converted_amount ) > iv_amn_to_be_cleared.
        EXIT.
      ENDIF.

    ENDLOOP.

    " Append the DM Documents
    rt_dfkkop = VALUE #( BASE rt_dfkkop FOR <fs_line>
                                 IN lt_claimoffset_dm ( CORRESPONDING #( <fs_line> ) ) ).



  ENDMETHOD.




  METHOD init_claim_clearing_process.

    DATA lv_recon_key TYPE fikey_kk.
    DATA ls_fkkko TYPE fkkko.
    DATA lv_doc TYPE opbel_kk.
    DATA ls_return TYPE bapiret2.
    DATA lv_amount TYPE betrw_kk.

    " Update the Clearing Amount and Flags Necessary to Perform Clearing
    CLEAR: lv_amount.
    DATA(lt_fkkcl_sorted) = it_fkkcl.
    DELETE lt_fkkcl_sorted WHERE yybitref NE iv_dm_yybitref.
    lt_fkkcl_sorted = VALUE #(  BASE lt_fkkcl_sorted FOR <fs_claimfund_fkkcl> IN it_fkkcl WHERE (  yybitref NE iv_dm_yybitref  )
                  ( CORRESPONDING #( <fs_claimfund_fkkcl> ) )  ).
    LOOP AT lt_fkkcl_sorted ASSIGNING FIELD-SYMBOL(<fs_fkkcl>).
      IF <fs_fkkcl>-opbel EQ iv_dm_opbel AND <fs_fkkcl>-yybitref EQ iv_dm_yybitref.
        <fs_fkkcl>-xaktp = abap_true.
        <fs_fkkcl>-augrd = '08'.
        <fs_fkkcl>-augbw = <fs_fkkcl>-betrw.
        lv_amount = <fs_fkkcl>-betrw.
      ELSEIF <fs_fkkcl>-betrw GT 0.
        CLEAR: <fs_fkkcl>-xaktp,
               <fs_fkkcl>-augbw.
      ELSEIF abs( <fs_fkkcl>-betrw ) GE lv_amount.
        <fs_fkkcl>-xaktp = abap_true.
        <fs_fkkcl>-augrd = '08'.
        <fs_fkkcl>-augbw = lv_amount * -1 .
        lv_amount = 0.
      ELSEIF abs( <fs_fkkcl>-betrw ) LT lv_amount.
        <fs_fkkcl>-xaktp = abap_true.
        <fs_fkkcl>-augrd = '08'.
        <fs_fkkcl>-augbw = <fs_fkkcl>-betrw.
        lv_amount = lv_amount - ( <fs_fkkcl>-betrw * -1 ).
      ENDIF.
    ENDLOOP.


    " Create Reconciliation Key
    CALL FUNCTION 'ZF_BAPI_CTRACRECKEY'
      EXPORTING
        i_key      = 'CC' "lv_fikey
        commit     = 'X'
      IMPORTING
        o_reconkey = lv_recon_key.


    " Fill Header
    CLEAR ls_fkkko.
    ls_fkkko = VALUE #(
      applk = ac_message_type_success
      blart = 'YY'
      herkf = '03'
      waers = cs_input-settlement_curr
      bldat = cs_input-posting_date
      budat = cs_input-posting_date
      wwert = cs_input-posting_date
      fikey = lv_recon_key
    ).

    " Create document and clear
    CALL FUNCTION 'FKK_CREATE_DOC_AND_CLEAR'
      EXPORTING
        i_fkkko       = ls_fkkko
        i_fkkopl_cf   = 'X'
        i_update_task = ''
      IMPORTING
        e_opbel       = lv_doc
      TABLES
        t_fkkcl       = lt_fkkcl_sorted.
    IF lv_doc IS INITIAL.
      cv_error_flag = 'X'.
      APPEND VALUE #( row = iv_tabix type = ac_message_type_error message = 'Document Creation Error while Clearing' ) TO ct_return.
      cs_input-status = ac_char_failed.
      " Roll-back and proceed to clear for other members in the list
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      RETURN.
    ELSE.
      CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
        EXPORTING
          wait   = 'X'
        IMPORTING
          return = ls_return.
      IF sy-subrc NE 0.
        APPEND ls_return TO ct_return.
        APPEND VALUE #( row = iv_tabix type = ac_message_type_error message = 'Clearing Process - Failed' ) TO ct_return.
      ELSE.
        APPEND VALUE #(  row = iv_tabix type = ac_message_type_success message = |Document { lv_doc } Created| ) TO ct_return.
        cs_input-status = ac_char_success.
        cs_input-document_created = lv_doc.
      ENDIF.
    ENDIF.

  ENDMETHOD.

  METHOD conv_any_to_jsonstring.
" Converts an ABAP structure to a JSON string
"
" This method takes an ABAP structure of any type and converts it to a JSON string
" representation using the /ui2/cl_json class. It handles the serialization
" process and any potential exceptions that may occur during the conversion.

    TRY.
        rv_string = /ui2/cl_json=>serialize(
          EXPORTING
            data             = im_data
            pretty_name      = /ui2/cl_json=>pretty_mode-camel_case
        ).
      CATCH cx_root INTO DATA(lx_error).

    ENDTRY.
  ENDMETHOD.

  METHOD convert_amn_sap_to_display.
    CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
      EXPORTING
        currency        = iv_original_currency
        amount_internal = iv_amount_in_sap
      IMPORTING
        amount_display  = rv_amount
      EXCEPTIONS
        internal_error  = 1
        OTHERS          = 2.
    IF sy-subrc <> 0.
    ENDIF.
  ENDMETHOD.

  METHOD get_reconciliation_key.
  " Generate new reconciliation key for payment clearing
    DATA: lv_today    TYPE n LENGTH 6,
          lv_skey     TYPE string,
          lv_curr_seq TYPE n LENGTH 4,
          lv_new_key  TYPE fikey_kk,
          lv_objclass TYPE resob_kk,
          ls_return   TYPE bapiret2.

    " Get date in DDMMYY format
    lv_today = |{ sy-datum+6(2) }{ sy-datum+4(2) }{ sy-datum+2(2) }|.
    lv_skey  = |{ iv_key }{ lv_today }%|.

    " Check for existing entries
    SELECT CAST( fikey AS CHAR( 12 ) ) AS fikey,
           xclos
      FROM dfkksumc
      UP TO 1 ROWS
      INTO TABLE @DATA(lt_dfkksumc)
      WHERE fikey LIKE @lv_skey
      ORDER BY cpudt DESCENDING.

    READ TABLE lt_dfkksumc INTO DATA(ls_dfkksumc) INDEX 1.
    IF sy-subrc = 0.
      IF ls_dfkksumc-xclos = 'X'.
        " Get and increment sequence for closed key
        lv_curr_seq = substring( val = ls_dfkksumc-fikey
                                off = strlen( ls_dfkksumc-fikey ) - 4 ).
        lv_curr_seq = lv_curr_seq + 1.

        lv_new_key  = iv_key && lv_today && lv_curr_seq.
        lv_objclass = iv_key.

        CALL FUNCTION 'BAPI_CTRACRECKEY_CREATE'
          EXPORTING
            newreconciliationkey = lv_new_key
          IMPORTING
            return               = ls_return
            reconciliationkey    = rv_reconkey.

        IF iv_commit = 'X'.
          CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
            EXPORTING
              wait = 'X'.
        ENDIF.
        RETURN.
      ELSE.
        rv_reconkey = ls_dfkksumc-fikey.
        RETURN.
      ENDIF.
    ELSE.
      " Create first key
      lv_new_key  = iv_key && lv_today && '0001'.
      lv_objclass = iv_key.

      CALL FUNCTION 'BAPI_CTRACRECKEY_CREATE'
        EXPORTING
          newreconciliationkey = lv_new_key
        IMPORTING
          return               = ls_return
          reconciliationkey    = rv_reconkey.

      IF iv_commit = 'X'.
        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
          EXPORTING
            wait = 'X'.
      ENDIF.
      RETURN.
    ENDIF.

  ENDMETHOD.

ENDCLASS.