CLASS zcl_clearingapplicati_dpc_ext DEFINITION
  PUBLIC
  INHERITING FROM zcl_clearingapplicati_dpc
  CREATE PUBLIC .

  PUBLIC SECTION.

    TYPES:
      BEGIN OF ty_selection_filters,

        companycode              TYPE char4,
        businesspartners         TYPE STANDARD TABLE OF char10 WITH EMPTY KEY,
        externalreferencenumbers TYPE STANDARD TABLE OF char35 WITH EMPTY KEY,
        soareferencenumbers      TYPE STANDARD TABLE OF char100 WITH EMPTY KEY,
        umrnumbers               TYPE STANDARD TABLE OF /sdf/char60 WITH EMPTY KEY,
        elsecobankaccountnumber  TYPE char18,
        insuredname              TYPE c LENGTH 160,
        payment                  TYPE dfkkop-betrw,
        bankcharge               TYPE dfkkop-betrw,
        currency                 TYPE  dfkkop-waers,
        postingdate              TYPE dats,
        division                 TYPE char2,
      END OF ty_selection_filters .
    TYPES:
      BEGIN OF ty_prepay_selection_filters,

        companycode              TYPE char4,
        businesspartners         TYPE STANDARD TABLE OF char10 WITH EMPTY KEY,
        externalreferencenumbers TYPE STANDARD TABLE OF char35 WITH EMPTY KEY,
        soareferencenumbers      TYPE STANDARD TABLE OF char100 WITH EMPTY KEY,
        umrnumbers               TYPE STANDARD TABLE OF /sdf/char60 WITH EMPTY KEY,
        elsecobankaccountnumber  TYPE char18,
        insuredname              TYPE c LENGTH 160,
        payment                  TYPE dfkkop-betrw,
        bankcharge               TYPE dfkkop-betrw,
        currency                 TYPE  dfkkop-waers,
        postingdate              TYPE dats,
        division                 TYPE char2,
        uwyears                  TYPE STANDARD TABLE OF char4 WITH EMPTY KEY,
        fronter                  TYPE but000-partner,
        members                  TYPE STANDARD TABLE OF char10 WITH EMPTY KEY,
        payablepostingstartdate  TYPE  dats,
        payablepostingenddate    TYPE  dats,
      END OF ty_prepay_selection_filters .
    TYPES:
      BEGIN OF ty_bp,
        bp_id TYPE char10,
      END OF ty_bp .
    TYPES:
      BEGIN OF ty_claimrec_selection_filters,
        companycode              TYPE char4,
        businesspartners         TYPE STANDARD TABLE OF char10 WITH EMPTY KEY,
        externalreferencenumbers TYPE STANDARD TABLE OF char35 WITH EMPTY KEY,
        ucrnumbers               TYPE STANDARD TABLE OF dfkkko-yyucr WITH EMPTY KEY,
        elsecobankaccountnumber  TYPE char18,
        payment                  TYPE dfkkop-betrw,
        currency                 TYPE  dfkkop-waers,
        postingdate              TYPE dats,
        division                 TYPE char2,
        claimids                 TYPE STANDARD TABLE OF dfkkop-yyelsclaimnum WITH EMPTY KEY,
        transrefs                TYPE STANDARD TABLE OF dfkkko-yytr_id WITH EMPTY KEY,
      END OF ty_claimrec_selection_filters .
    TYPES:
      tra_extref TYPE RANGE OF yel_tb_deal_head-ext_ref .
    TYPES:
      tra_umr    TYPE RANGE OF char100 .
    TYPES:
      tt_bp      TYPE STANDARD TABLE OF ty_bp WITH KEY bp_id .
    TYPES:
      BEGIN OF ty_deepop.
        INCLUDE TYPE zcl_clearingapplicati_mpc=>ts_deepop.
        TYPES:       soaupdate TYPE TABLE OF zcl_clearingapplicati_mpc=>ts_clearingop WITH NON-UNIQUE DEFAULT KEY.
    TYPES: soaupdatecheckresponse TYPE zcl_clearingapplicati_mpc=>ts_soaupdateprecheckresponse .
    TYPES:       clearingop TYPE TABLE OF zcl_clearingapplicati_mpc=>ts_clearingop WITH NON-UNIQUE DEFAULT KEY.
    TYPES: clearsoatable TYPE TABLE OF zcl_clearingapplicati_mpc=>ts_clearsoatable WITH NON-UNIQUE DEFAULT KEY.
    TYPES: updatesoatable TYPE TABLE OF zcl_clearingapplicati_mpc=>ts_updatesoatable WITH NON-UNIQUE DEFAULT KEY.
    TYPES: response TYPE zcl_clearingapplicati_mpc=>ts_response.
    TYPES: convlocalcurrency TYPE TABLE OF zcl_clearingapplicati_mpc=>ts_convforeigncurrency01 WITH NON-UNIQUE DEFAULT KEY.
    TYPES: END OF ty_deepop .
    TYPES:
      BEGIN OF ts_soa_new,
        soa_id        TYPE c LENGTH 300,
        soa_reference TYPE yel_dt_soa_ref,
        soa_count     TYPE yel_dt_soa_count,
      END OF ts_soa_new .
    TYPES:
      tt_soa_new TYPE STANDARD TABLE OF ts_soa_new WITH DEFAULT KEY .
    TYPES:
      BEGIN OF ty_soa_update_precheck_res,
        isnewsoaavailable  TYPE boole_d,
        isnodatatobesaved  TYPE boole_d,
        issoarefemptyerror TYPE boole_d,
        isalloktosave      TYPE boole_d,
        soanew             TYPE tt_soa_new,
      END OF ty_soa_update_precheck_res .

    METHODS /iwbep/if_mgw_appl_srv_runtime~create_deep_entity
        REDEFINITION .
    METHODS /iwbep/if_mgw_appl_srv_runtime~execute_action
        REDEFINITION .
  PROTECTED SECTION.

  PRIVATE SECTION.
ENDCLASS.



CLASS zcl_clearingapplicati_dpc_ext IMPLEMENTATION.


  METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.




    DATA: ls_deepop TYPE ty_deepop.

    IF iv_entity_set_name = 'DeepOPSet'.
      CALL METHOD io_data_provider->read_entry_data IMPORTING es_data = ls_deepop .
      IF ls_deepop-action = 'SOAUpdateCheck'.
        BREAK-POINT.
        BREAK ajeethkumarr.
        DATA(ls_soa_update_precheck_res) = VALUE zcl_clearingapplicati_mpc=>ts_soaupdateprecheckresponse( ).
        zcl_clearingapp_services=>check_soa_data_before_save(
          EXPORTING
            it_clearingop             = ls_deepop-updatesoatable
          IMPORTING
            ev_is_new_soa_available   = ls_soa_update_precheck_res-isnewsoaavailable
            ev_is_no_data_to_be_saved = ls_soa_update_precheck_res-isnodatatobesaved
            ev_is_soa_ref_empty_error = ls_soa_update_precheck_res-issoarefemptyerror
            ev_all_ok_to_save         = ls_soa_update_precheck_res-isalloktosave
            ev_soa_new_ids                = ls_soa_update_precheck_res-soanew
        ).

        DATA(ls_deepopres) = VALUE ty_deepop(  ).
*         ls_soa_update_precheck_res-issoarefemptyerror = abap_true.
*         ls_soa_update_precheck_res-isnodatatobesaved = abap_false.
*        ls_soa_update_precheck_res-isnewsoaavailable = abap_true.
*        ls_soa_update_precheck_res-soanew =
*            '12121**122~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd~323~1231sd'.

        ls_deepop-soaupdatecheckresponse = CORRESPONDING #( ls_soa_update_precheck_res ).

        copy_data_to_ref(
            EXPORTING
                is_data = ls_deepop
            CHANGING
                cr_data = er_deep_entity
                          ).

      ELSEIF ls_deepop-action = 'SOAUpdate'.
        BREAK ajeethkumarr.

        ls_deepopres = VALUE ty_deepop(  ).

        zcl_clearingapp_services=>save_soa_data(
          EXPORTING
            it_clearingop = ls_deepop-updatesoatable
         IMPORTING
         et_clearingop = DATA(lt_clearingop)
        ).

        ls_deepop-updatesoatable = lt_clearingop.

        copy_data_to_ref(
                    EXPORTING
                        is_data = ls_deepop
                    CHANGING
                        cr_data = er_deep_entity
                                  ).

      ELSEIF ls_deepop-action = 'ClearSOATable'.
        BREAK ajeethkumarr.

        ls_deepopres = VALUE ty_deepop(  ).



        zcl_clearingapp_services=>clear_soa_table( it_clearsoatable = ls_deepop-clearsoatable ).
        CLEAR ls_deepop.

        copy_data_to_ref(
                    EXPORTING
                        is_data = ls_deepop
                    CHANGING
                        cr_data = er_deep_entity
                                  ).

      ELSEIF ls_deepop-action = 'ConvLocalCurrency'.
        ls_deepopres = VALUE ty_deepop(  ).

        LOOP AT ls_deepop-convlocalcurrency ASSIGNING FIELD-SYMBOL(<fs_conv>).

          <fs_conv>-localamount =  zcl_clearingapp_services=>convert_to_local_currency(
           EXPORTING
             date = sy-datum
             iv_foreign_amount   = CONV #( <fs_conv>-foreignamount )
             iv_foreign_currency = <fs_conv>-foreigncurrency
             iv_local_currency   = <fs_conv>-localcurrency
             iv_rate             = CONV #( <fs_conv>-rate )
         ).


        ENDLOOP.
        ls_deepopres-convlocalcurrency = ls_deepop-convlocalcurrency.
        copy_data_to_ref(
                    EXPORTING
                        is_data = ls_deepopres
                    CHANGING
                        cr_data = er_deep_entity
                                  ).
      ENDIF.

    ENDIF.




  ENDMETHOD.


  METHOD /iwbep/if_mgw_appl_srv_runtime~execute_action.

    DATA: ls_parameter   TYPE /iwbep/s_mgw_name_value_pair,
          lv_flag        TYPE char1,
          lv_json_body   TYPE string,
          lmsg_data      TYPE REF TO data,
          lo_pos_struct  TYPE REF TO cl_abap_structdescr,
          lo_json_parser TYPE REF TO /ui2/cl_json,
          lv_amount      TYPE betrw_kk,
          lt_extref      TYPE STANDARD TABLE OF yel_tb_deal_head-ext_ref WITH DEFAULT KEY,
          lt_umr         TYPE STANDARD TABLE OF yel_tb_clmr_head-umr WITH DEFAULT KEY.

    TYPES: BEGIN OF ty_business_partners,
             businesspartners TYPE char10,
           END OF ty_business_partners,
           tt_business_partners TYPE TABLE OF ty_business_partners WITH EMPTY KEY,
           BEGIN OF ty_external_reference_numbers,
             ext_ref_no TYPE char35,
           END OF ty_external_reference_numbers,
           tt_external_reference_numbers TYPE TABLE OF ty_external_reference_numbers WITH DEFAULT KEY,
           BEGIN OF ty_soa_reference_numbers,
             soa_ref_no TYPE char100,
           END OF ty_soa_reference_numbers,
           tt_soa_reference_numbers TYPE TABLE OF ty_soa_reference_numbers WITH DEFAULT KEY,
           BEGIN OF ty_umr_numbers,
             umr_no TYPE c LENGTH 60,
           END OF ty_umr_numbers,
           tt_umr_numbers TYPE TABLE OF ty_umr_numbers WITH DEFAULT KEY.






    FIELD-SYMBOLS:
      <l_msg_data>   TYPE any,
      <l_postab_ref> TYPE any,
      <lt_postab>    TYPE ANY TABLE,
      <l_pos>        TYPE any,
      <l_fvalue>     TYPE any.


    IF iv_action_name = 'getPremiumReceivables'.
      BREAK ajeethkumarr.
      BREAK sreejiths.
      BREAK serviceuser.

      IF it_parameter IS NOT INITIAL.

        DATA(lv_data) = VALUE string( it_parameter[ name = 'SelectionFilters' ]-value OPTIONAL ).

        CREATE OBJECT lo_json_parser.
        DATA(ls_selection_filters) = VALUE ty_selection_filters(  ).
        lo_json_parser->deserialize(
          EXPORTING
            json = lv_data
          CHANGING
            data = ls_selection_filters
        ).

        IF ls_selection_filters IS INITIAL.
          RETURN.
        ENDIF.

        zcl_clearingapp_services=>get_premiumreceivables(
          EXPORTING
            is_selectionparameters = ls_selection_filters
          IMPORTING
            et_clearingop          = DATA(lt_clearingop)
        ).

        LOOP AT lt_clearingop ASSIGNING FIELD-SYMBOL(<fs_clearingop>).
          <fs_clearingop>-int = sy-tabix.
        ENDLOOP.


        copy_data_to_ref( EXPORTING is_data = lt_clearingop

                CHANGING cr_data = er_data ).

        RETURN.

      ENDIF.

    ELSEIF iv_action_name = 'getPremiumPayables'.
      BREAK ajeethkumarr.
      BREAK sreejiths.
      BREAK serviceuser.

      IF it_parameter IS NOT INITIAL.

        lv_data = VALUE string( it_parameter[ name = 'SelectionFilters' ]-value OPTIONAL ).

        CREATE OBJECT lo_json_parser.
        DATA(ls_prepay_selection_filters) = VALUE ty_prepay_selection_filters(  ).
        lo_json_parser->deserialize(
          EXPORTING
            json = lv_data
          CHANGING
            data = ls_prepay_selection_filters
        ).

        zcl_clearingapp_services=>get_premiumpayables(
          EXPORTING
            is_selectionparameters = ls_prepay_selection_filters
          IMPORTING
            et_clearingop          = lt_clearingop
        ).

        LOOP AT lt_clearingop ASSIGNING <fs_clearingop>.
          <fs_clearingop>-int = sy-tabix.
        ENDLOOP.


        copy_data_to_ref( EXPORTING is_data = lt_clearingop

                CHANGING cr_data = er_data ).

        RETURN.

      ENDIF.
    ELSEIF iv_action_name = 'convForeignCurrency'.

      IF it_parameter IS NOT INITIAL.

        DATA(foreign_amount) = VALUE betrw_kk( it_parameter[ name = 'ForeignAmount' ]-value OPTIONAL ).

        DATA(foreign_currency) = VALUE blwae_kk( it_parameter[ name = 'ForeignCurrency' ]-value OPTIONAL ).

        DATA(local_currency) = VALUE blwae_kk( it_parameter[ name = 'LocalCurrency' ]-value OPTIONAL ).

        DATA(rate) = VALUE kursf_kk( it_parameter[ name = 'Rate' ]-value OPTIONAL ).
        DATA(date) = VALUE dats( it_parameter[ name = 'Date' ]-value OPTIONAL ).

        zcl_clearingapp_services=>convert_to_local_currency(
          EXPORTING
            date                = date
            iv_foreign_amount   = foreign_amount
            iv_foreign_currency = foreign_currency
            iv_local_currency   = local_currency
            iv_rate             = rate
          RECEIVING
            rv_amount           = lv_amount
        ).

        copy_data_to_ref( EXPORTING is_data =  VALUE zcl_clearingapplicati_mpc=>ts_convforeigncurrency01( rate = rate
        foreigncurrency = foreign_currency foreignamount = foreign_amount localcurrency = local_currency localamount = lv_amount   )

               CHANGING cr_data = er_data ).

        RETURN.


      ENDIF.

    ELSEIF iv_action_name = 'getPayerPayee'.

      " Test AK
wait UP TO 180 seconds.
     copy_data_to_ref( EXPORTING is_data =  value  tt_bp( ( bp_id = '1100000100' ) )
       CHANGING cr_data = er_data ).
       return.

      DATA(lv_extref_string) = VALUE string( it_parameter[ name = 'ExtRef' ]-value OPTIONAL ).

      DATA(lv_umr_string) = VALUE string( it_parameter[  name = 'UMR' ]-value OPTIONAL ).


      CREATE OBJECT lo_json_parser.

      DATA(lra_umr) = VALUE tra_umr(  ).
      DATA(lra_extref) = VALUE tra_extref(  ).

      lo_json_parser->deserialize(
        EXPORTING
          json = lv_extref_string
        CHANGING
          data = lt_extref
      ).


      lo_json_parser->deserialize(
        EXPORTING"
          json = lv_umr_string
        CHANGING
          data = lt_umr
      ).

      DATA(rt_payerpayee) = zcl_clearingapp_services=>get_payerpayee(
          ira_extref       = VALUE #( FOR ls_extref IN lt_extref sign = zcl_clearingapp_services=>ac_sign_i
                               option = zcl_clearingapp_services=>ac_option_eq ( low = ls_extref ) )
          ira_umr          = VALUE #( FOR ls_umr IN lt_umr sign = zcl_clearingapp_services=>ac_sign_i
                               option = zcl_clearingapp_services=>ac_option_eq ( low = ls_umr ) )
          ispayerrequested = VALUE #( it_parameter[  name = 'IsPayerRequested' ]-value OPTIONAL )
      ).

*      zcl_clearingapp_services=>get_payerpayee(
*        EXPORTING
*          ira_extref       = lra_extref
*          ira_umr          = lra_umr
*          ispayerrequested = VALUE #( it_parameter[  name = 'IsPayerRequested' ]-value OPTIONAL )
*        RECEIVING
*          rt_payerpayee    = DATA(rt_payerpayee)
*      ).

      copy_data_to_ref( EXPORTING is_data =  rt_payerpayee
       CHANGING cr_data = er_data ).

    ELSEIF iv_action_name = 'checkPostingPeriod'.


      DATA(lv_ispostingperiodopen) = abap_false.

      DATA(lv_postingdate) = VALUE dats( it_parameter[ name = 'PostingDate' ]-value OPTIONAL ).
      DATA(lv_companycode) = VALUE t001-bukrs( it_parameter[ name = 'CompanyCode' ]-value OPTIONAL ).

      IF lv_postingdate IS NOT INITIAL AND lv_companycode IS NOT INITIAL.
        CALL FUNCTION 'PERIOD_CHECK'
          EXPORTING
            i_bukrs          = lv_companycode
            i_gjahr          = lv_postingdate+0(4)
            i_koart          = 'V'
            i_konto          = lv_postingdate+4(2)
            i_monat          = lv_postingdate+4(2)
          EXCEPTIONS
            error_period     = 1
            error_period_acc = 2
            OTHERS           = 3.
        IF sy-subrc EQ 0.
          lv_ispostingperiodopen = abap_true.
        ENDIF.
      ENDIF.

      DATA(ls_return) = VALUE zcl_clearingapplicati_mpc=>ts_actionconfirm( response = lv_ispostingperiodopen   ).



      copy_data_to_ref( EXPORTING is_data =  ls_return
      CHANGING cr_data = er_data ).

    ELSEIF iv_action_name = 'getClaimReceivables'.
      DATA(lv_data_cr) = VALUE string( it_parameter[ name = 'SelectionFilters' ]-value OPTIONAL ).

      CREATE OBJECT lo_json_parser.
      DATA(ls_selection_filters_cr) = VALUE ty_claimrec_selection_filters(  ).
      lo_json_parser->deserialize(
        EXPORTING
          json = lv_data_cr
        CHANGING
          data = ls_selection_filters_cr
      ).

      "SELECT * FROM ztemp_clear INTO  TABLE @DATA(lt_temp).

      "lt_clearingop = CORRESPONDING #( lt_temp MAPPING int = id ).


      zcl_clearingapp_services=>get_claimreceivables(
        EXPORTING
          is_selectionparameters = ls_selection_filters_cr
        IMPORTING
          et_clearingop          = DATA(lt_crclearingop)
      ).

      LOOP AT lt_crclearingop ASSIGNING FIELD-SYMBOL(<fs_crclearingop>).
        <fs_crclearingop>-int = sy-tabix.
      ENDLOOP.


      copy_data_to_ref( EXPORTING is_data = lt_crclearingop

              CHANGING cr_data = er_data ).
    ELSEIF iv_action_name = 'getClaimPayables'.
      BREAK ajeethkumarr.
      BREAK sreejiths.
      BREAK serviceuser.

      IF it_parameter IS NOT INITIAL.

        lv_data = VALUE string( it_parameter[ name = 'SelectionFilters' ]-value OPTIONAL ).

        CREATE OBJECT lo_json_parser.
        ls_selection_filters = VALUE ty_selection_filters(  ).
        lo_json_parser->deserialize(
          EXPORTING
            json = lv_data
          CHANGING
            data = ls_selection_filters
        ).

        IF ls_selection_filters IS INITIAL.
          RETURN.
        ENDIF.

        zcl_clearingapp_services=>get_claimpayables(
          EXPORTING
            is_selectionparameters = ls_selection_filters
          IMPORTING
            et_clearingop          = lt_clearingop
        ).

        LOOP AT lt_clearingop ASSIGNING <fs_clearingop>.
          <fs_clearingop>-int = sy-tabix.
        ENDLOOP.


        copy_data_to_ref( EXPORTING is_data = lt_clearingop

                CHANGING cr_data = er_data ).

        RETURN.

      ENDIF.


    ELSEIF iv_action_name = 'convLocalCurrency'.

      IF it_parameter IS NOT INITIAL.

        foreign_amount = VALUE betrw_kk( it_parameter[ name = 'ForeignAmount' ]-value OPTIONAL ).

        foreign_currency = VALUE blwae_kk( it_parameter[ name = 'ForeignCurrency' ]-value OPTIONAL ).

        local_currency = VALUE blwae_kk( it_parameter[ name = 'LocalCurrency' ]-value OPTIONAL ).

        rate = VALUE kursf_kk( it_parameter[ name = 'Rate' ]-value OPTIONAL ).
        date = VALUE dats( it_parameter[ name = 'Date' ]-value OPTIONAL ).

        zcl_clearingapp_services=>convert_to_local_currency(
          EXPORTING
            date                = date
            iv_foreign_amount   = foreign_amount
            iv_foreign_currency = foreign_currency
            iv_local_currency   = local_currency
            iv_rate             = rate
          RECEIVING
            rv_amount           = lv_amount
        ).

        copy_data_to_ref( EXPORTING is_data =  VALUE zcl_clearingapplicati_mpc=>ts_convforeigncurrency01( rate = rate
        foreigncurrency = foreign_currency foreignamount = foreign_amount localcurrency = local_currency localamount = lv_amount   )

               CHANGING cr_data = er_data ).

        RETURN.


      ENDIF.


    ENDIF.



  ENDMETHOD.

ENDCLASS.