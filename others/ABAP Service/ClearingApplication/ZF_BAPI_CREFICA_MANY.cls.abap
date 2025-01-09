FUNCTION ZF_BAPI_CREFICA_MANY
  IMPORTING
    VALUE(IT_FICA_CREATE) TYPE ZTFICAMANY OPTIONAL
    VALUE(IT_CDC) TYPE ZTCDCMANY OPTIONAL
    VALUE(PURPOSE) TYPE CHAR02 OPTIONAL
  EXPORTING
    VALUE(E_STATUS) TYPE CHAR10
    VALUE(ET_RETURN) TYPE ZTTFICAMANYRET.



  " Two modes are possible here. One is just FICA Document creation and another is FICA Create and Clearing happens.
  " Here Importing Param PURPOSE supports 4 options -> PR, PP, CR, CP. If nothing, then simply create FICA Docs.
  " For Premium Booking and Claim Receivables Generation -> Purpose will not be supplied.


  " For Clearing Process, the following scenarios are possible
  " 1. When Clearing With UIM, then IT_CDC will be filled with the UIM Documents
  " 2. When Clearing With Bank Charge, then IT_FICA_CREATE will be filled with
  "    the details to create a FICA of doc type YM.
  " 3. For Claim Receivables, Auto Clearing Is done with Specific logic. Herein, created CC will be cleared with DM documents.



  " Response will be in the format of zttficamanyret
  " 1. 100 to 499 item number is for Docs created with BAPI
  " 2. 500 item number is for Docs created with FKK_FICA_CREATE
  " 3. 800 item number is for Docs created for Automatic Clearing

  " there will be multiple records of ( single ) fica document create calls.
  " each time, it will try to create a new FICA document=> enables the interface to create -
  " FICA documents belonging to multipke recon key( may not be needed though )
  " Each row then be looped to flattn extension struct
  " each row be looped to call fica doc create bapi.
  " response is collected and sent back .

  "declaration
  DATA : ls_datarow      TYPE zstficamany,
         it_extension    TYPE bapiparex_tab,
         l_doc           TYPE opbel_kk,
         l_ret           TYPE  bapiret2,
         l_err_flg       TYPE abap_bool,
         lt_ret          TYPE zttficamanyret,
         ls_ret          TYPE zstficamanyret,
*        l_reconkeyinfo type BAPIRECKEYINFO ,
         recon_key       TYPE fikey_kk,
         ls_cdc          TYPE zscdcmany,
         lt_cdc          TYPE ztcdcmany,
         lt_seltab       TYPE STANDARD TABLE OF iseltab,
         lv_count        TYPE sy-tabix,
         ra_created_docs TYPE RANGE OF opbel_kk.

  DATA   testmode TYPE bapictracaux-testrun VALUE 'X'.

  TYPES : BEGIN OF ly_rfcdata ,
            item         TYPE numc3,
            it_extension TYPE bapiparex_tab,
            datarow      TYPE zstficamany,
          END OF ly_rfcdata.

  DATA : lt_rfcdata TYPE TABLE OF ly_rfcdata,
         ls_rfcdata TYPE ly_rfcdata,
         guid       TYPE uuid.


  IF it_fica_create IS INITIAL AND it_cdc IS INITIAL.
    " Send Error as Status if IP is empty
    e_status = 'Error'.
    RETURN.
  ENDIF.


  LOOP AT it_fica_create INTO ls_datarow.

    guid = cl_system_uuid=>if_system_uuid_rfc4122_static~create_uuid_c36_by_version( version = 4 ).
    EXPORT guid TO MEMORY ID 'FICADOCGUID'.
    CALL FUNCTION 'ZF_BAPI_CTRACRECKEY'
      EXPORTING
        i_key      = ls_datarow-recon_key_prefix
        commit     = 'X'
      IMPORTING
        o_reconkey = recon_key.

    CALL FUNCTION 'ZF_CTRAC_EXT_SERIALIZE'
      EXPORTING
        is_dfkkko    = ls_datarow-is_dfkkko
        it_dfkkop    = ls_datarow-it_dfkkop
        it_dfkkopk   = ls_datarow-it_dfkkopk
      IMPORTING
        et_extension = it_extension.

    ls_datarow-fica_header-fikey = recon_key .

    IF purpose EQ 'PP' OR purpose EQ 'CP'.
      zcl_clearingapp_services=>conv_fica_ldgr_amn_to_sap_bapi(
        EXPORTING
          iv_currency    = ls_datarow-fica_header-currency
        CHANGING
          ct_fica_ledger = ls_datarow-fica_ledger
        ).

    ENDIF.

    IF purpose EQ 'CP'.
      zcl_clearingapp_services=>conv_fica_pp_amn_to_sap_bapi(
        EXPORTING
          iv_currency    = ls_datarow-fica_header-currency
        CHANGING
          ct_fica_pp = ls_datarow-fica_partner_pos
        ).
    ENDIF.



    CALL FUNCTION 'BAPI_CTRACDOCUMENT_CREATE'
      EXPORTING
        testrun                       = testmode "run in test mode first and collect the output.
        documentheader                = ls_datarow-fica_header
*       RECKEYINFO                    = l_reconkeyinfo
        completedocument              = ''
        net_receivables               = ''
        aggregate_for_tax_calculation = ''
        numberrange_group             = '000'
        check_amt_tolerance           = ''
        calculate_tax_from_gl         = ''
        complete_co_data              = ''
      IMPORTING
        documentnumber                = l_doc
        return                        = l_ret
      TABLES
        partnerpositions              = ls_datarow-fica_partner_pos
        genledgerpositions            = ls_datarow-fica_ledger
        extensionin                   = it_extension.

    UPDATE ytficadoclog SET message = l_ret-message
      extrenalref = ls_datarow-is_dfkkko-yyextref
      WHERE guid = guid .
    COMMIT WORK AND WAIT .

    MOVE-CORRESPONDING l_ret TO ls_ret.
    ls_ret-message_type = l_ret-type.
    ls_ret-document_number = l_doc .
    ls_ret-item = ls_datarow-item.
    IF l_ret IS NOT INITIAL AND l_ret-type EQ 'E'.
      "there is an error. break the loop and leave.
      l_err_flg = 'X'.
      ls_ret-message_type = 'E'.
      ls_ret-message = l_ret-message.
*      append LS_RET to ET_RETURN.
*      EXIT. "try others and populate the messages
    ELSE.
      ls_ret-message_type = 'S'.
      ls_ret-message = | Document item { ls_datarow-item } simulated| .
      ls_rfcdata-item = ls_datarow-item.
      ls_rfcdata-it_extension = it_extension .
      ls_rfcdata-datarow = ls_datarow .
      APPEND ls_rfcdata TO lt_rfcdata .

    ENDIF.
    APPEND ls_ret TO et_return.

    CLEAR : l_ret , ls_datarow.
  ENDLOOP.

  " ENDIF.

  " Create Documents and Clear for UIM
  IF l_err_flg IS NOT INITIAL.
    e_status = 'Error'.
    RETURN .
  ENDIF.

  " CP: Execute Clearing Process for UIM / Payables in testmode
  IF purpose IS NOT INITIAL.
    zcl_clearingapp_services=>create_doc_and_clear_testmode(
      EXPORTING
        iv_purpose = purpose
        it_cdc     = it_cdc
      IMPORTING
        et_cdc_fm_params     = DATA(lt_cdc_fm_params)
      CHANGING
        cv_status  = e_status
        ct_return  = et_return
        cv_err_flg = l_err_flg
      ).
  ENDIF.

  IF l_err_flg IS INITIAL.
    testmode = ''. "now create the actual ones.
    CLEAR : et_return , et_return[] , e_status.
    e_status = 'Success'.
    LOOP AT lt_rfcdata INTO ls_rfcdata.

      guid = cl_system_uuid=>if_system_uuid_rfc4122_static~create_uuid_c36_by_version( version = 4 ).
      EXPORT guid TO MEMORY ID 'FICADOCGUID'.

      CALL FUNCTION 'BAPI_CTRACDOCUMENT_CREATE'
        EXPORTING
          testrun                       = testmode "run in test mode first and collect the output.
          documentheader                = ls_rfcdata-datarow-fica_header
*         RECKEYINFO                    = l_reconkeyinfo
          completedocument              = ''
          net_receivables               = ''
          aggregate_for_tax_calculation = ''
          numberrange_group             = '000'
          check_amt_tolerance           = ''
          calculate_tax_from_gl         = ''
          complete_co_data              = ''
        IMPORTING
          documentnumber                = l_doc
          return                        = l_ret
        TABLES
          partnerpositions              = ls_rfcdata-datarow-fica_partner_pos
          genledgerpositions            = ls_rfcdata-datarow-fica_ledger
          extensionin                   = ls_rfcdata-it_extension.



      UPDATE ytficadoclog SET
        extrenalref = ls_rfcdata-datarow-is_dfkkko-yyextref
        WHERE guid = guid .
      COMMIT WORK AND WAIT .

      MOVE-CORRESPONDING l_ret TO ls_ret.
      ls_ret-message_type = l_ret-type.
      ls_ret-document_number = l_doc .
      ls_ret-item = ls_rfcdata-item.
      IF purpose EQ 'CR'.
        APPEND VALUE #( sign = 'I' option = 'EQ' low = l_doc ) TO ra_created_docs.
      ENDIF.
      IF l_ret IS NOT INITIAL AND l_ret-type EQ 'E'.
        "there is an error. break the loop and leave.
        l_err_flg = 'X'.
        e_status = 'Error'.
        ls_ret-message = | Document creation Failed| .
        ls_ret-message_type = 'E'.
        APPEND ls_ret TO et_return.
        RETURN.
      ELSE.
        ls_ret-message = | Document { l_doc } created| .
        ls_ret-message_type = 'S'.
        e_status = 'Success'.
      ENDIF.
      "ls_ret-type = 'FICACREATE'.
      APPEND ls_ret TO et_return.
      CLEAR : l_ret , l_doc .
    ENDLOOP.

    " CP: For Claim Receivables, We don't need to update SOA Tables
    IF e_status EQ 'Success' AND purpose IS NOT INITIAL AND purpose NE 'CR'.
      LOOP AT it_fica_create ASSIGNING FIELD-SYMBOL(<fs_fica_create>).
        zcl_clearingapp_services=>update_cp_soa_tables( purpose = purpose it_add_info = <fs_fica_create>-it_add_info ).
      ENDLOOP.
    ENDIF.

    " For Claim Receivables, We need to perform automatic clearing
    DATA: lt_cc_docs  TYPE STANDARD TABLE OF zcl_clearingapp_services=>ty_opbel WITH KEY opbel,
          lt_add_info TYPE ztfkkcl_addinfo.

    IF purpose EQ 'CR'.

      " For Each DM documents Selected in Clearing, One CC Document with respective Items will be created.
      SELECT dfkkko~opbel, opupk, opupz, opupw, yybitref FROM dfkkko
          INNER JOIN dfkkop
           ON dfkkko~opbel EQ dfkkop~opbel
          WHERE dfkkko~opbel IN @ra_created_docs
          AND dfkkko~blart EQ 'CC'
          INTO TABLE @DATA(lt_cc_docs_details).
      IF sy-subrc EQ 0 AND lines( lt_cc_docs_details ) > 0.
        lt_cc_docs = CORRESPONDING #( lt_cc_docs_details MAPPING opbel = opbel ).


        lt_add_info = VALUE #( FOR <fs_line> IN it_fica_create
                                FOR <fs_add_info> IN <fs_line>-it_add_info ( CORRESPONDING #( <fs_add_info> ) ) ).
        lt_add_info = VALUE #( BASE lt_add_info FOR <fs_line1> IN it_cdc
                                FOR <fs_add_info> IN <fs_line1>-it_add_info ( CORRESPONDING #( <fs_add_info> ) ) ).

        SORT lt_add_info BY opbel opupz opupk opupw.
        DELETE ADJACENT DUPLICATES FROM lt_add_info.
        DELETE lt_add_info WHERE blart NE 'DM'.

        " Initially Set Status as Success
        e_status = 'Success'.

        " Perform TestRun
        DATA  is_return              LIKE LINE OF et_return.
        DATA(lv_item_no) = 800 .  " Keep the Range 800 for Auto Clearing
        LOOP AT lt_cc_docs_details ASSIGNING FIELD-SYMBOL(<fs_cc_docs_details>).
          lv_item_no = lv_item_no + 1.

          " Find the respective DM document using YYBITREF
          DATA(ls_add_info) = VALUE zsfkkcl_addinfo( lt_add_info[ yybitref = <fs_cc_docs_details>-yybitref ] OPTIONAL ).
          zcl_clearingapp_services=>perform_auto_clearing_for_cr(
            EXPORTING
              iv_testrun  = abap_true
              iv_item_no = lv_item_no
              is_cc_doc   = <fs_cc_docs_details>
              is_add_info =  ls_add_info
            IMPORTING
              es_return   = is_return
              ev_err_flg  = l_err_flg
          ).
          IF l_err_flg IS NOT INITIAL.
            " Error Occurred. So revert all created documents.
            ">>>> Will Be Implemented Later <<<<"

            APPEND is_return TO et_return.
            e_status = 'Error'.
            RETURN.
          ENDIF.

        ENDLOOP.

        " Perform Production Run
        lv_item_no = 800 .  " Keep the Range 800 for Auto Clearing
        LOOP AT lt_cc_docs_details ASSIGNING <fs_cc_docs_details>.

          lv_item_no = lv_item_no + 1.

          " Find the respective DM document using YYBITREF
          ls_add_info = VALUE zsfkkcl_addinfo( lt_add_info[ yybitref = <fs_cc_docs_details>-yybitref ] OPTIONAL ).

          zcl_clearingapp_services=>perform_auto_clearing_for_cr(
            EXPORTING
              iv_testrun  = abap_false
              iv_item_no = lv_item_no
              is_cc_doc   = <fs_cc_docs_details>
              is_add_info =  ls_add_info
            IMPORTING
              es_return   = is_return
              ev_err_flg  = l_err_flg
          ).
          APPEND is_return TO et_return.
          IF l_err_flg IS NOT INITIAL.
            " Error Occurred. So revert all created documents
            ">>>> Will Be Implemented Later <<<<"
            e_status = 'Error'.


            RETURN.
          ENDIF.
        ENDLOOP.
      ENDIF.
    ENDIF.


    " CP: Create and Clear FICA Docs for UIM
    IF purpose IS NOT INITIAL.
      zcl_clearingapp_services=>create_doc_and_clear(
        EXPORTING
          it_cdc_fm_params     = lt_cdc_fm_params
          it_fica_create = it_fica_create
          it_cdc = it_cdc
          purpose = purpose
        CHANGING
          cv_status  = e_status
          ct_return  = et_return
          cv_err_flg = l_err_flg
        ).

      CALL FUNCTION 'DEQUEUE_ALL'.
    ENDIF.
  ELSE.
    CALL FUNCTION 'DEQUEUE_ALL'.
    e_status = 'Error'.
    RETURN .
  ENDIF.

ENDFUNCTION.