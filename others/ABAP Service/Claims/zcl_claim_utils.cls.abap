CLASS zcl_claim_utils DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .


  PUBLIC SECTION.


    TYPES: BEGIN OF ty_response,
             opbel        TYPE opbel_kk,
             message_type TYPE bapi_mtype,
             message      TYPE string,
           END OF ty_response,
           tt_response TYPE STANDARD TABLE OF ty_response.

    TYPES: BEGIN OF ty_claim_doc,
             opbel TYPE dfkkko-opbel,
             budat TYPE dfkkop-budat,
             augbl TYPE dfkkop-augbl,
             augdt TYPE dfkkop-augdt,
             bukrs TYPE dfkkop-bukrs,
           END OF ty_claim_doc,
           BEGIN OF ty_posting_period,
             budat TYPE budat_kk,
           END OF ty_posting_period.

    TYPES: tt_claim_docs       TYPE TABLE OF ty_claim_doc WITH DEFAULT KEY,
           tt_posting_periods  TYPE STANDARD TABLE OF ty_posting_period WITH DEFAULT KEY,
           tt_zclm_reversaldoc TYPE STANDARD TABLE OF zclm_reversaldoc WITH DEFAULT KEY,
           BEGIN OF ty_doc_with_date,
             opbel TYPE opbel_kk,
             budat TYPE  budat_kk,
           END OF ty_doc_with_date,

           tt_doc_with_date TYPE STANDARD TABLE OF ty_doc_with_date WITH KEY opbel,

           BEGIN OF ty_contract_account_bp_bukrs,
             gpart TYPE gpart_kk,
             bukrs TYPE bukrs,
             vkont TYPE vkont_kk,
           END OF ty_contract_account_bp_bukrs.
    TYPES:  BEGIN OF ty_fica_create_w_extension.
              INCLUDE TYPE zstficamany.
              TYPES:   it_extension TYPE  bapiparex_tab,
            END OF ty_fica_create_w_extension,

            tt_fica_create_w_extension TYPE STANDARD TABLE OF ty_fica_create_w_extension WITH DEFAULT KEY.

    CONSTANTS: ac_fica_logger_purpose_cu TYPE zfica_logs-purpose VALUE 'C_UNAPPROV',
               ac_fica_logger_purpose_croeupd TYPE zfica_logs-purpose VALUE 'C_ROEUPDAT',
               BEGIN OF ac_check_validation_type,
                 payables_cleared  TYPE char1 VALUE 'P',
                 cash_call         TYPE char1 VALUE 'C',
                 currency_equality TYPE char1 VALUE 'E',
                 posting_period    TYPE char1 VALUE 'T',
               END OF ac_check_validation_type.

    CLASS-DATA: at_docs_tobe_reversed_onroeupd TYPE STANDARD TABLE OF zclm_reversaldoc WITH DEFAULT KEY,
                as_contract_account_bp_bukrs   TYPE ty_contract_account_bp_bukrs,
                at_gl_accounts                 TYPE STANDARD TABLE OF tfk033d WITH DEFAULT KEY.
    CONSTANTS:
      ac_fikey_dm TYPE fikey_kk VALUE 'CL',  "DM -> CL
      ac_fikey_sc TYPE fikey_kk VALUE 'SA',  "SC -> SA
      ac_fikey_rc TYPE fikey_kk VALUE 'SU',  "RC -> SU
      ac_fikey_cr TYPE fikey_kk VALUE 'CR',  "CR -> CR
      ac_fikey_sm TYPE fikey_kk VALUE 'SN',  "SM -> SN
      ac_fikey_rm TYPE fikey_kk VALUE 'SE',  "RM -> SE
      ac_fikey_rd TYPE fikey_kk VALUE 'SE',  "RD -> SE
      ac_fikey_sd TYPE fikey_kk VALUE 'SM',  "SD -> SM
      ac_fikey_cc TYPE fikey_kk VALUE 'CI',  "CC -> CI
      ac_fikey_cl TYPE fikey_kk VALUE 'CI'.  "CL -> CI



    CLASS-METHODS get_claim_offset
      IMPORTING
        iv_fronter              TYPE yyfronter
        iv_member               TYPE yymember
        is_cqs                  TYPE boole_d
        iv_posting_date         TYPE dats
        iv_bukrs                TYPE bukrs
        iv_spart                TYPE spart
        iv_yyuway               TYPE dfkkko-yyuway
        iv_gpart                TYPE dfkkop-gpart
        iv_settlement_currency  TYPE waers_kk
      EXPORTING
        ev_available_offset_amn TYPE betrh_kk
      EXCEPTIONS
        frontercqs_not_found
      .

    CLASS-METHODS get_claim_fund
      IMPORTING
        iv_fronter             TYPE yyfronter
        iv_member              TYPE yymember
        is_cqs                 TYPE boole_d
        iv_posting_date        TYPE dats
        iv_bukrs               TYPE bukrs
        iv_spart               TYPE spart
        iv_yyuway              TYPE dfkkko-yyuway
        iv_gpart               TYPE dfkkop-gpart
        iv_settlement_currency TYPE waers_kk
      EXPORTING
        ev_available_fund_amn  TYPE betrh_kk
      EXCEPTIONS
        frontercqs_not_found
        members_not_passed
      .


    CLASS-METHODS unapprove_claim_transaction
      IMPORTING
        iv_ucr         TYPE dfkkko-yyucr
        iv_elsclaimnum TYPE dfkkop-yyelsclaimnum
        iv_tr_id       TYPE dfkkko-yytr_id
      EXPORTING
        et_return      TYPE tt_response
      EXCEPTIONS
        claim_payables_cleared
        posting_period_not_open
        reversal_bapi_error.



    CLASS-METHODS reversal_on_roe_update_check
      IMPORTING
        iv_uuid           TYPE uuid
        iv_ucr            TYPE dfkkko-yyucr
        iv_elsclaimnum    TYPE dfkkop-yyelsclaimnum
        iv_tr_id          TYPE dfkkko-yytr_id

      EXPORTING
        et_return         TYPE tt_response
        ev_is_checkpassed TYPE boole_d
      .

    CLASS-METHODS reverse_on_roe_update
      IMPORTING
        iv_uuid           TYPE uuid

      EXPORTING
        et_return         TYPE tt_response
        ev_is_checkpassed TYPE boole_d
      EXCEPTIONS
        no_reversal_docs_found
      .

    CLASS-METHODS fica_payload_recreator
      IMPORTING
        it_docs_to_recreate TYPE  tt_zclm_reversaldoc
        iv_new_roe          TYPE dfkkop-kursf
      CHANGING
        ct_fica_create      TYPE ztficamany
      EXCEPTIONS
        contract_account_not_found
        gl_account_not_found.

    CLASS-METHODS get_contract_account
      IMPORTING
                iv_gpart                   TYPE gpart_kk
                iv_bukrs                   TYPE bukrs
      RETURNING VALUE(rv_contract_account) TYPE dfkkop-vkont
      .
    CLASS-METHODS simulate_fica_creation
      IMPORTING
        it_fica_create             TYPE ztficamany
      EXPORTING
        et_fica_create_w_extension TYPE tt_fica_create_w_extension
        et_return                  TYPE zttficamanyret
        ev_is_success              TYPE boole_d.

    CLASS-METHODS create_fica_documents
      IMPORTING
        it_fica_create_w_extension TYPE tt_fica_create_w_extension
      EXPORTING
        et_return                  TYPE zttficamanyret
        ev_is_success              TYPE boole_d.

    CLASS-METHODS: process_roe_update_step
      IMPORTING
        iv_step            TYPE i
        iv_uuid            TYPE uuid
        iv_ucr             TYPE dfkkko-yyucr
        iv_elsclaimnum     TYPE dfkkop-yyelsclaimnum
        iv_tr_id           TYPE dfkkko-yytr_id
        iv_new_roe         TYPE dfkkop-yyext_roe
        it_fica_create     TYPE ztficamany OPTIONAL
        it_claimfund_input TYPE zttclaimfundclear OPTIONAL
      EXPORTING
        ev_next_step       TYPE i
        ev_status          TYPE char10
        et_return          TYPE bapireturn_t.

  PROTECTED SECTION.


  PRIVATE SECTION.
    CLASS-METHODS get_available_amn
      IMPORTING
        iv_posting_date                TYPE dats
        iv_settlement_currency         TYPE waers_kk
        iv_where_claimoffset           TYPE string
        iv_where_frontermember         TYPE string
      RETURNING
        VALUE(rv_available_offset_amn) TYPE betrh_kk.
    CLASS-METHODS reverse_document
      IMPORTING
                is_docs_tobe_reversed TYPE ty_doc_with_date
      EXPORTING ev_success            TYPE boole_d
                ev_return             TYPE ty_response.


    CLASS-METHODS:
      perform_validation_check
        IMPORTING
          iv_check_type      TYPE char1
          iv_elsclaimnum     TYPE dfkkop-yyelsclaimnum
          iv_tr_id           TYPE dfkkko-yytr_id
          iv_ucr             TYPE dfkkko-yyucr
          iv_bukrs           TYPE bukrs OPTIONAL
          it_posting_periods TYPE tt_posting_periods OPTIONAL
        RETURNING
          VALUE(rv_result)   TYPE abap_bool,

      get_posting_periods
        IMPORTING
          it_claim_docs          TYPE tt_claim_docs
        RETURNING
          VALUE(rt_post_periods) TYPE tt_posting_periods,

      prepare_reversal_docs
        IMPORTING
          it_claim_docs       TYPE tt_claim_docs
          iv_uuid             TYPE uuid
        RETURNING
          VALUE(rt_reversals) TYPE tt_zclm_reversaldoc.
    CLASS-METHODS: roe_upd_check_step1_reversal
      IMPORTING
        iv_uuid        TYPE uuid
        iv_ucr         TYPE dfkkko-yyucr
        iv_elsclaimnum TYPE dfkkop-yyelsclaimnum
        iv_tr_id       TYPE dfkkko-yytr_id
      EXPORTING
        ev_status      TYPE char10
        et_return      TYPE bapireturn_t,

      roe_upd_exe_step2_recreation
        IMPORTING
          iv_uuid        TYPE uuid
          iv_new_roe     TYPE dfkkop-yyext_roe
          it_fica_create TYPE ztficamany
        EXPORTING
          ev_status      TYPE char10
          et_return      TYPE bapireturn_t,

      roe_upd_execute_step3_reversal
        IMPORTING
          iv_uuid   TYPE uuid
        EXPORTING
          ev_status TYPE char10
          et_return TYPE bapireturn_t,

      roe_upd_execute_step4_clearing
        IMPORTING
          it_claimfund_input TYPE zttclaimfundclear
        EXPORTING
          ev_status          TYPE char10
          et_return          TYPE bapireturn_t.

ENDCLASS.



CLASS zcl_claim_utils IMPLEMENTATION.
  METHOD get_claim_offset.

    " Here in this amount calculation, two scenarios are possible.
    " - Normal Scenario - Fronter with QS
    " - Chinese QS


    " Based on the scenario, consider the member to get configuration
    DATA(lv_memberforconfig) = COND yymember( WHEN is_cqs IS NOT INITIAL THEN iv_member ELSE iv_fronter ).

    IF lv_memberforconfig IS INITIAL.
      RAISE frontercqs_not_found.
    ENDIF.


    " Check if there is any configuration maintained for this combo

    SELECT SINGLE *
        FROM yel_clmoffsetcfg AS a
        INTO  @DATA(ls_config)
        WHERE a~member = @lv_memberforconfig
          AND a~payer = @iv_gpart
          AND a~clm_uway = @iv_yyuway
          AND a~lob = @iv_spart.

    DATA(lv_where_claimoffset_default) = VALUE string( ).

    IF ls_config IS NOT INITIAL.
      zcl_clearingapp_services=>construct_offset_config_where(
        EXPORTING
          is_config      = ls_config
          iv_postingdate = COND #( WHEN iv_posting_date IS INITIAL THEN sy-datum ELSE iv_posting_date )
        CHANGING
          cv_where       = lv_where_claimoffset_default
      ).
    ELSE.
      " No Configuration Available. Apply Default Period filter as Quarter
      zcl_clearingapp_services=>get_startenddate_for_quarter(
         EXPORTING
           iv_postingdate = COND #(   WHEN iv_posting_date IS INITIAL THEN sy-datum ELSE iv_posting_date )
         CHANGING
           cv_where       = lv_where_claimoffset_default
       ).
    ENDIF.

    IF lv_where_claimoffset_default IS NOT INITIAL.
      DATA(lv_where_claimoffset) = | { lv_where_claimoffset_default } and |.
    ENDIF.
    lv_where_claimoffset = | { lv_where_claimoffset } gpart = '{ iv_gpart }' and spart = '{ iv_spart }' and bukrs = '{ iv_bukrs }' and | &&
                          | ( ( blart IN ( 'DR', 'RD', 'SD', 'DM' ) and waers = '{ iv_settlement_currency }' )  )   |.



    IF is_cqs IS INITIAL.
      DATA(lv_where_frontermember) = | ( (  yymember EQ '{ iv_fronter }' or yyfronter EQ '{ iv_fronter }'   ) and iscqsentry is null ) |.
    ELSE.
      lv_where_frontermember = |  ( yymember EQ '{ iv_member }' and yyfronter EQ '{ iv_fronter  }' and iscqsentry is not null )|.
    ENDIF.



    " Get Different Currencies in the offset
    SELECT DISTINCT waers AS waers_c FROM zi_claimoffset
        WHERE (lv_where_claimoffset)
        AND (lv_where_frontermember)
        INTO TABLE @DATA(lt_local_currencies).
    IF lt_local_currencies IS INITIAL.
      RETURN.
    ENDIF.


    " Check if there is any currency that is different from settlement currency
    SELECT waers_c, CAST( 0 AS DEC( 9,5 ) ) AS rate
      FROM
    @lt_local_currencies AS l
    WHERE waers_c NE @iv_settlement_currency
    INTO TABLE
    @DATA(lt_local_currencies_diff).

    IF lt_local_currencies_diff IS NOT INITIAL.

      " Get the Conversion factor for the currency based on settlement date
      LOOP AT lt_local_currencies_diff ASSIGNING FIELD-SYMBOL(<fs_curr>).
        DATA: lw_er          TYPE tcurr-ukurs,
              lw_ff          TYPE tcurr-ffact,
              lw_lf          TYPE tcurr-tfact,
              lw_vfd         TYPE datum,
              lw_erate(12)   TYPE c,
              lva            TYPE wrbtr,
              lv_amount_disp TYPE dec11_4.


        CALL FUNCTION 'READ_EXCHANGE_RATE'
          EXPORTING
            client           = sy-mandt
            date             = iv_posting_date
            foreign_currency = <fs_curr>-waers_c
            local_currency   = iv_settlement_currency
            type_of_rate     = 'M'
          IMPORTING
            exchange_rate    = lw_er
            foreign_factor   = lw_ff
            local_factor     = lw_lf.

        IF sy-subrc = 0.
          " Convert the amount by considering its decimal places and then apply the factors
          MOVE lw_er TO lv_amount_disp.
          CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
            EXPORTING
              currency        = <fs_curr>-waers_c
              amount_internal = lv_amount_disp
            IMPORTING
              amount_display  = lv_amount_disp
            EXCEPTIONS
              internal_error  = 1
              OTHERS          = 2.
          IF sy-subrc <> 0.
          ENDIF.
          MOVE lv_amount_disp TO lw_er.
          lw_erate = lw_er / ( lw_ff / lw_lf ).
          <fs_curr>-rate = CONV #( lw_erate ).
        ENDIF.
      ENDLOOP.
    ENDIF.

    APPEND VALUE #( waers_c = iv_settlement_currency  rate = '1' )
          TO lt_local_currencies_diff.

*
*    SELECT b~rate, a~opbel, a~opupw, a~opupk, a~opupz,a~herkf_kk, a~budat, a~betrw, a~waers, a~betrh, a~blart,a~yymember, a~yyfronter
*    FROM zi_claimoffset AS a
*    INNER JOIN @lt_local_currencies_diff AS b
*    ON a~waers = b~waers_c
*             WHERE (lv_where_claimoffset)
*        AND (lv_where_frontermember)
*            INTO TABLE @DATA(lt_offset_available).
*
*    SORT lt_offset_available BY opbel opupw opupk opupz.
*    DELETE ADJACENT DUPLICATES FROM lt_offset_available COMPARING opbel opupw opupk opupz.


*  SELECT  a~rate, a~opbel, a~opupw, a~opupk, a~opupz,a~herkf_kk, a~budat, a~betrw, a~waers, a~betrh, a~blart,a~yymember, a~yyfronter, ( a~rate * a~betrw ) AS converted_amn   FROM
*  @lt_offset_available AS a
*  INTO TABLE @DATA(lt_alv).
*
*  cl_salv_table=>factory(
*  IMPORTING
*    r_salv_table = DATA(lo_alv)
*  CHANGING
*    t_table      = lt_alv ).
*
*  lo_alv->get_columns( )->set_optimize( abap_true ).
*  lo_alv->get_functions( )->set_all( abap_true ).
*
*  "Display the ALV Grid
*  lo_alv->display( ).


    " Now Get the amount
    SELECT SINGLE SUM( betrw * rate )
    FROM zi_claimoffset AS a
    INNER JOIN @lt_local_currencies_diff AS b
    ON a~waers = b~waers_c
             WHERE (lv_where_claimoffset)
        AND (lv_where_frontermember)
            INTO @DATA(lv_offset_available).

    ev_available_offset_amn = lv_offset_available * -1.


  ENDMETHOD.

  METHOD get_claim_fund.


    " Construct the where condition with necessary filter
    DATA(lv_where_claimfund) = |gpart = '{ iv_gpart }' and yyuway like '%{ substring( val = iv_yyuway off = 1 ) }' | &&
                          |and spart = '{ iv_spart }' and bukrs = '{ iv_bukrs }' and | &&
                          | ( ( blart IN ( 'FP', 'RD', 'SD', 'DM' )  )  )   |.



    IF is_cqs IS INITIAL.
      DATA(lv_where_frontermember) = | ( (  yymember EQ '{ iv_fronter }' or yyfronter EQ '{ iv_fronter }'   ) and iscqsentry is null ) |.
    ELSE.
      lv_where_frontermember = | ( ( yymember EQ '{ iv_member }' and yyfronter EQ '{ iv_fronter  }' and iscqsentry is not null ) | &&
       | or ( blart eq 'FP' and yymember EQ '{ iv_member }' ) ) |.
    ENDIF.




    " Get Different Currencies in the offset
    SELECT DISTINCT waers AS waers_c FROM zi_cashclaim
        WHERE (lv_where_claimfund)
        AND (lv_where_frontermember)
        INTO TABLE @DATA(lt_local_currencies).
    IF lt_local_currencies IS INITIAL.
      RETURN.
    ENDIF.


    " Check if there is any currency that is different from settlement currency
    SELECT waers_c, CAST( 0 AS DEC( 9,5 ) ) AS rate
      FROM
    @lt_local_currencies AS l
    WHERE waers_c NE @iv_settlement_currency
    INTO TABLE
    @DATA(lt_local_currencies_diff).

    IF lt_local_currencies_diff IS NOT INITIAL.

      " Get the Conversion factor for the currency based on settlement date
      LOOP AT lt_local_currencies_diff ASSIGNING FIELD-SYMBOL(<fs_curr>).
        DATA: lw_er          TYPE tcurr-ukurs,
              lw_ff          TYPE tcurr-ffact,
              lw_lf          TYPE tcurr-tfact,
              lw_vfd         TYPE datum,
              lw_erate(12)   TYPE c,
              lva            TYPE wrbtr,
              lv_amount_disp TYPE dec11_4.


        CALL FUNCTION 'READ_EXCHANGE_RATE'
          EXPORTING
            client           = sy-mandt
            date             = iv_posting_date
            foreign_currency = <fs_curr>-waers_c
            local_currency   = iv_settlement_currency
            type_of_rate     = 'M'
          IMPORTING
            exchange_rate    = lw_er
            foreign_factor   = lw_ff
            local_factor     = lw_lf.

        IF sy-subrc = 0.
          " Convert the amount by considering its decimal places and then apply the factors
          MOVE lw_er TO lv_amount_disp.
          CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
            EXPORTING
              currency        = <fs_curr>-waers_c
              amount_internal = lv_amount_disp
            IMPORTING
              amount_display  = lv_amount_disp
            EXCEPTIONS
              internal_error  = 1
              OTHERS          = 2.
          IF sy-subrc <> 0.
          ENDIF.
          MOVE lv_amount_disp TO lw_er.
          lw_erate = lw_er / ( lw_ff / lw_lf ).
          <fs_curr>-rate = CONV #( lw_erate ).
        ENDIF.
      ENDLOOP.
    ENDIF.

    APPEND VALUE #( waers_c = iv_settlement_currency  rate = '1' )
          TO lt_local_currencies_diff.


*    SELECT b~rate, a~opbel, a~opupw, a~opupk, a~opupz,a~herkf_kk, a~budat, a~betrw, a~waers, a~betrh, a~blart,a~yymember, a~yyfronter
*    FROM zi_cashclaim AS a
*    INNER JOIN @lt_local_currencies_diff AS b
*    ON a~waers = b~waers_c
*             WHERE (lv_where_claimfund)
*        AND (lv_where_frontermember)
*            INTO TABLE @DATA(lt_offset_available).
*
*    SORT lt_offset_available BY opbel opupw opupk opupz.
*    DELETE ADJACENT DUPLICATES FROM lt_offset_available COMPARING opbel opupw opupk opupz.


*  SELECT  a~rate, a~opbel, a~opupw, a~opupk, a~opupz,a~herkf_kk, a~budat, a~betrw, a~waers, a~betrh, a~blart,a~yymember, a~yyfronter, ( a~rate * a~betrw ) AS converted_amn   FROM
*  @lt_offset_available AS a
*  INTO TABLE @DATA(lt_alv).
*
*  cl_salv_table=>factory(
*  IMPORTING
*    r_salv_table = DATA(lo_alv)
*  CHANGING
*    t_table      = lt_alv ).
*
*  lo_alv->get_columns( )->set_optimize( abap_true ).
*  lo_alv->get_functions( )->set_all( abap_true ).
*
*  "Display the ALV Grid
*  lo_alv->display( ).


    " Now Get the amount
    SELECT SINGLE SUM( betrw * rate )
    FROM zi_cashclaim AS a
    INNER JOIN @lt_local_currencies_diff AS b
    ON a~waers = b~waers_c
             WHERE (lv_where_claimfund)
        AND (lv_where_frontermember)
            INTO @DATA(lv_offset_available).

    ev_available_fund_amn = lv_offset_available * -1.


  ENDMETHOD.


  METHOD get_available_amn.



    " Get Different Currencies in the offset
    SELECT DISTINCT waers AS waers_c FROM zi_claimoffset
        WHERE (iv_where_claimoffset)
        AND (iv_where_frontermember)
        INTO TABLE @DATA(lt_local_currencies).
    IF lt_local_currencies IS INITIAL.
      "RETURN.
    ENDIF.


    " Check if there is any currency that is different from settlement currency
    SELECT waers_c, CAST( 0 AS DEC( 9,5 ) ) AS rate
      FROM
    @lt_local_currencies AS l
    WHERE waers_c NE @iv_settlement_currency
    INTO TABLE
    @DATA(lt_local_currencies_diff).

    IF lt_local_currencies_diff IS NOT INITIAL.

      " Get the Conversion factor for the currency based on settlement date
      LOOP AT lt_local_currencies_diff ASSIGNING FIELD-SYMBOL(<fs_curr>).
        DATA: lw_er          TYPE tcurr-ukurs,
              lw_ff          TYPE tcurr-ffact,
              lw_lf          TYPE tcurr-tfact,
              lw_vfd         TYPE datum,
              lw_erate(12)   TYPE c,
              lva            TYPE wrbtr,
              lv_amount_disp TYPE dec11_4.


        CALL FUNCTION 'READ_EXCHANGE_RATE'
          EXPORTING
            client           = sy-mandt
            date             = iv_posting_date
            foreign_currency = <fs_curr>-waers_c
            local_currency   = iv_settlement_currency
            type_of_rate     = 'M'
          IMPORTING
            exchange_rate    = lw_er
            foreign_factor   = lw_ff
            local_factor     = lw_lf.

        IF sy-subrc = 0.
          " Convert the amount by considering its decimal places and then apply the factors
          MOVE lw_er TO lv_amount_disp.
          CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
            EXPORTING
              currency        = <fs_curr>-waers_c
              amount_internal = lv_amount_disp
            IMPORTING
              amount_display  = lv_amount_disp
            EXCEPTIONS
              internal_error  = 1
              OTHERS          = 2.
          IF sy-subrc <> 0.
          ENDIF.
          MOVE lv_amount_disp TO lw_er.
          lw_erate = lw_er / ( lw_ff / lw_lf ).
          <fs_curr>-rate = CONV #( lw_erate ).
        ENDIF.
      ENDLOOP.
    ENDIF.

    APPEND VALUE #( waers_c = iv_settlement_currency  rate = '1' )
          TO lt_local_currencies_diff.


    SELECT b~rate, a~opbel, a~opupw, a~opupk, a~opupz,a~herkf_kk, a~budat, a~betrw, a~waers, a~betrh, a~blart,a~yymember, a~yyfronter
    FROM zi_claimoffset AS a
    INNER JOIN @lt_local_currencies_diff AS b
    ON a~waers = b~waers_c
             WHERE (iv_where_claimoffset)
        AND (iv_where_frontermember)
            INTO TABLE @DATA(lt_offset_available).

    SORT lt_offset_available BY opbel opupw opupk opupz.
    DELETE ADJACENT DUPLICATES FROM lt_offset_available COMPARING opbel opupw opupk opupz.


*  SELECT  a~rate, a~opbel, a~opupw, a~opupk, a~opupz,a~herkf_kk, a~budat, a~betrw, a~waers, a~betrh, a~blart,a~yymember, a~yyfronter, ( a~rate * a~betrw ) AS converted_amn   FROM
*  @lt_offset_available AS a
*  INTO TABLE @DATA(lt_alv).
*
*  cl_salv_table=>factory(
*  IMPORTING
*    r_salv_table = DATA(lo_alv)
*  CHANGING
*    t_table      = lt_alv ).
*
*  lo_alv->get_columns( )->set_optimize( abap_true ).
*  lo_alv->get_functions( )->set_all( abap_true ).
*
*  "Display the ALV Grid
*  lo_alv->display( ).


    " Now Get the amount
    SELECT SINGLE SUM( betrw * rate )
    FROM zi_claimoffset AS a
    INNER JOIN @lt_local_currencies_diff AS b
    ON a~waers = b~waers_c
             WHERE (iv_where_claimoffset)
        AND (iv_where_frontermember)
            INTO @DATA(lv_offset_available).

    rv_available_offset_amn = lv_offset_available * -1.

  ENDMETHOD.


  METHOD unapprove_claim_transaction.
    DATA: lv_recon_key TYPE fikey_kk,
          ls_return    TYPE bapiret2,
          lv_doc_no    TYPE opbel_kk
          .

    TYPES: BEGIN OF ty_payload,
             elsclaimnum TYPE yyelsclaimnum,
             tr_id       TYPE yytranrefnumber,
             ucr         TYPE yyucr,
           END OF ty_payload,

           tt_payload TYPE STANDARD TABLE OF ty_payload.



    " Get The FICA Documents for the claim transaction to be unapproved

    SELECT h~opbel, h~herkf, i~opupw, i~opupk, i~opupz, h~blart, i~budat, i~yybitref, i~augbl ,i~augrd, i~bukrs, i~augdt, i~augst
      INTO TABLE  @DATA(lt_claim_docs)
      FROM dfkkko AS h
      INNER JOIN dfkkop AS i ON h~opbel = i~opbel
      WHERE h~yyelsclaimnum = @iv_elsclaimnum
        AND h~yytr_id = @iv_tr_id
        AND h~yyucr = @iv_ucr
        AND h~stbel = ''
        AND h~storb = ''
        AND h~blart IN ('DM', 'CR', 'CL', 'CC', 'RC', 'RD', 'RM', 'SC', 'SD', 'SM').
    IF lt_claim_docs IS INITIAL.
      RETURN.
    ENDIF.

    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Perform Validations
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    " Check if Claim Payables are Cleared
    SELECT SINGLE *
     FROM dfkkko AS h
    INNER JOIN dfkkop AS i ON h~opbel = i~opbel
    WHERE augst = '9'
    AND h~yyelsclaimnum = @iv_elsclaimnum
      AND h~yytr_id = @iv_tr_id
      AND h~yyucr = @iv_ucr
      AND h~stbel = ''
      AND h~storb = ''
      AND h~blart IN ( 'CR', 'RD', 'SD' )
      AND augrd NE '05'
      INTO @DATA(ls_check_is_cr_cleared).
    IF ls_check_is_cr_cleared IS NOT INITIAL.

      APPEND VALUE ty_response( message_type = zcl_clearingapp_services=>ac_message_type_error message = 'Claim Payables are cleared' )
        TO et_return.
    ENDIF.


    " Check if Posting Period is closed
    SELECT DISTINCT budat
    FROM @lt_claim_docs
    AS d INTO TABLE @DATA(lt_posting_periods).

    SELECT DISTINCT augdt AS budat
    FROM @lt_claim_docs
    AS d APPENDING TABLE @lt_posting_periods.
    SORT lt_posting_periods BY budat.
    DELETE ADJACENT DUPLICATES FROM lt_posting_periods COMPARING budat.
    DELETE lt_posting_periods WHERE budat EQ '00000000'.

    DATA(lv_company_code) = lt_claim_docs[ 1 ]-bukrs.
    LOOP AT lt_posting_periods INTO DATA(ls_posting_period).
      DATA(lv_gjahr) = CONV gjahr( ls_posting_period+0(4)  ) .
      DATA(lv_konto) = CONV gjahr( ls_posting_period+4(2)  ) .
      DATA(lv_monat) = CONV gjahr( ls_posting_period+4(2)  ) .

      CALL FUNCTION 'PERIOD_CHECK'
        EXPORTING
          i_bukrs          = lv_company_code
          i_gjahr          = lv_gjahr
          i_koart          = 'V'
          i_konto          = ''
          i_monat          = lv_monat
        EXCEPTIONS
          error_period     = 1
          error_period_acc = 2
          OTHERS           = 3.
      IF sy-subrc NE 0.
        APPEND VALUE ty_response( message_type = zcl_clearingapp_services=>ac_message_type_error message = 'Posting Period Not Open' )
        TO et_return.
      ENDIF.
    ENDLOOP.


    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    " Perform Reversal
    """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    TRY.
        DATA(lv_guid) = cl_system_uuid=>if_system_uuid_rfc4122_static~create_uuid_c36_by_version( version = 4 ).
      CATCH cx_uuid_error.
    ENDTRY.

    SELECT DISTINCT augbl AS opbel, augdt AS budat
    FROM @lt_claim_docs AS d
    WHERE augbl NE ''
        INTO TABLE @DATA(lt_clearingdocs_tobe_reversed).

    SELECT DISTINCT opbel, budat
     FROM @lt_claim_docs AS d
      INTO TABLE @DATA(lt_docs_tobe_reversed).

    " First Reverse Clearing Documents
    LOOP AT lt_clearingdocs_tobe_reversed INTO DATA(ls_docs).

      reverse_document( EXPORTING
            is_docs_tobe_reversed = ls_docs
            IMPORTING
            ev_success = DATA(lv_success)
            ev_return = DATA(lv_return) ).
      APPEND lv_return TO et_return.
      IF lv_success IS INITIAL.
        RETURN.
      ENDIF.


    ENDLOOP.


    " Now Reverse the main Documents
    LOOP AT lt_docs_tobe_reversed INTO ls_docs.
      reverse_document( EXPORTING
             is_docs_tobe_reversed = ls_docs
             IMPORTING
            ev_success = lv_success
            ev_return = lv_return ).
      APPEND lv_return TO et_return.
      IF lv_success IS INITIAL.
        RETURN.
      ENDIF.

    ENDLOOP.

  ENDMETHOD.


  METHOD reverse_document.

    DATA:
      lv_doc_no    TYPE opbel_kk,
      ls_return    TYPE bapiret2,
      lv_recon_key TYPE fikey_kk.

    ev_success = abap_false.

    " Create FI Key
    CALL FUNCTION 'ZF_BAPI_CTRACRECKEY'
      EXPORTING
        i_key      = 'RV'
        commit     = abap_true
      IMPORTING
        o_reconkey = lv_recon_key.

    " Initiate Reversal
    CALL FUNCTION 'BAPI_CTRACDOCUMENT_REVERSE'
      EXPORTING
        documentnumber     = is_docs_tobe_reversed-opbel
        post_date          = is_docs_tobe_reversed-budat
        doc_type           = 'YR'
        clear_reas         = '05'
        fikey              = lv_recon_key
        doc_source_key     = '02'
      IMPORTING
        rev_documentnumber = lv_doc_no
        return             = ls_return.

    IF lv_doc_no IS NOT INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
        EXPORTING
          wait = 'X'.
      ev_success = abap_true.
      ev_return = VALUE #( opbel = is_docs_tobe_reversed-opbel message_type = zcl_clearingapp_services=>ac_message_type_success
                           message = 'Reversal Success'  ).
    ELSE.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ev_return = VALUE #( opbel = is_docs_tobe_reversed-opbel message_type = zcl_clearingapp_services=>ac_message_type_error
                     message = ls_return-message  ).
    ENDIF.

  ENDMETHOD.


  METHOD reversal_on_roe_update_check.
    CONSTANTS: lc_error_type TYPE char1 VALUE 'E'.
    DATA: lt_claim_docs TYPE tt_claim_docs.

    CLEAR: et_return, ev_is_checkpassed.

    SELECT * FROM zclm_reversaldoc
      INTO TABLE @at_docs_tobe_reversed_onroeupd
      WHERE uuid = @iv_uuid
      ORDER BY is_clearingdoc DESCENDING.

    IF sy-subrc = 0.
      ev_is_checkpassed = abap_true.
      RETURN.
    ENDIF.

    " Get the documents to be Reversed
    SELECT h~opbel,
            i~budat, i~augbl, i~augdt, i~bukrs
      INTO CORRESPONDING FIELDS OF TABLE @lt_claim_docs
      FROM dfkkko AS h
      INNER JOIN dfkkop AS i ON h~opbel = i~opbel
      WHERE h~yyelsclaimnum = @iv_elsclaimnum
        AND h~yytr_id      = @iv_tr_id
        AND h~yyucr        = @iv_ucr
        AND h~stbel        = ''
        AND h~storb        = ''
        AND h~blart IN ('DM', 'CR', 'CL', 'CC', 'RC', 'RD', 'RM', 'SC', 'SD', 'SM').

    IF lt_claim_docs IS INITIAL.
      APPEND VALUE ty_response(
        message_type = lc_error_type
        message = 'No Valid FICA Documents Found to Reverse'
      ) TO et_return.
      ev_is_checkpassed = abap_false.
      RETURN.
    ENDIF.

    " Check if claim payables are cleared
    IF perform_validation_check(
         iv_check_type   = ac_check_validation_type-payables_cleared
         iv_elsclaimnum  = iv_elsclaimnum
         iv_tr_id        = iv_tr_id
         iv_ucr          = iv_ucr
       ) = abap_true.

      APPEND VALUE ty_response(
        message_type = lc_error_type
        message = 'Claim Payables are cleared'
      ) TO et_return.
      ev_is_checkpassed = abap_false.
      RETURN.
    ENDIF.

    " Check cash call collection type
    IF perform_validation_check(
         iv_check_type   = ac_check_validation_type-cash_call
         iv_elsclaimnum  = iv_elsclaimnum
         iv_tr_id        = iv_tr_id
         iv_ucr          = iv_ucr
       ) = abap_true.

      APPEND VALUE ty_response(
        message_type = lc_error_type
        message = 'Collection Type with Cash Call cannot be updated with new ROE'
      ) TO et_return.
      ev_is_checkpassed = abap_false.
      RETURN.
    ENDIF.

    " Check transaction and settlement currency
    IF perform_validation_check(
         iv_check_type   = ac_check_validation_type-currency_equality
         iv_elsclaimnum  = iv_elsclaimnum
         iv_tr_id        = iv_tr_id
         iv_ucr          = iv_ucr
       ) = abap_true.

      APPEND VALUE ty_response(
        message_type = lc_error_type
        message = 'Transaction and Settlement Currencies are same. ROE update not allowed'
      ) TO et_return.
      ev_is_checkpassed = abap_false.
      RETURN.
    ENDIF.

    " Check posting period
    DATA(lt_posting_periods) = get_posting_periods( lt_claim_docs ).

    IF perform_validation_check(
         iv_check_type      = ac_check_validation_type-posting_period
         iv_elsclaimnum     = iv_elsclaimnum
         iv_tr_id           = iv_tr_id
         iv_ucr             = iv_ucr
         iv_bukrs           = lt_claim_docs[ 1 ]-bukrs
         it_posting_periods = lt_posting_periods
       ) = abap_false.

      APPEND VALUE ty_response(
        message_type = lc_error_type
        message = 'Posting Period Not Open'
      ) TO et_return.
      ev_is_checkpassed = abap_false.
      RETURN.
    ENDIF.

    DATA(lt_docs_to_be_reversed) = prepare_reversal_docs(
      it_claim_docs = lt_claim_docs
      iv_uuid       = iv_uuid
    ).

    INSERT zclm_reversaldoc FROM TABLE lt_docs_to_be_reversed.
    IF sy-subrc = 0.
      COMMIT WORK.
      at_docs_tobe_reversed_onroeupd = lt_docs_to_be_reversed.
      ev_is_checkpassed = abap_true.
    ENDIF.

  ENDMETHOD.

  METHOD perform_validation_check.
    CASE iv_check_type.
      WHEN ac_check_validation_type-payables_cleared.
        " Check if Claim Payables CR are Cleared
        SELECT SINGLE @abap_true
          FROM dfkkko AS h
          INNER JOIN dfkkop AS i ON h~opbel = i~opbel
          WHERE augst = '9'
            AND h~yyelsclaimnum = @iv_elsclaimnum
            AND h~yytr_id = @iv_tr_id
            AND h~yyucr = @iv_ucr
            AND h~stbel = ''
            AND h~storb = ''
            AND h~blart IN ('CR', 'RD', 'SD')
            AND augrd NE '05'
          INTO @rv_result.

      WHEN ac_check_validation_type-cash_call.
        " Check if Cash Call is set as collection type for any
        SELECT SINGLE @abap_true
          FROM dfkkko AS h
          INNER JOIN dfkkop AS i ON h~opbel = i~opbel
          WHERE h~yyelsclaimnum = @iv_elsclaimnum
            AND h~yytr_id = @iv_tr_id
            AND h~yyucr = @iv_ucr
            AND augst = '9'
            AND h~stbel = ''
            AND h~storb = ''
            AND h~blart = 'CC'
            AND augrd NE '05'
          INTO @rv_result.

      WHEN ac_check_validation_type-currency_equality.
        " Check If Transaction and Settlement Currency is same
        SELECT SINGLE @abap_true
          FROM dfkkko AS h
          INNER JOIN dfkkop AS i ON h~opbel = i~opbel
          WHERE h~yyelsclaimnum = @iv_elsclaimnum
            AND h~yytr_id = @iv_tr_id
            AND h~yyucr = @iv_ucr
            AND augst = '9'
            AND h~stbel = ''
            AND h~storb = ''
            AND h~blart IN ('DM', 'RD', 'SD')
            AND augrd NE '05'
            AND i~waers = i~yyext_currency
          INTO @rv_result.

      WHEN ac_check_validation_type-posting_period.
        " Check if Posting Period is closed
        rv_result = abap_true.
        LOOP AT it_posting_periods INTO DATA(ls_period).
          DATA(lv_year)  = CONV gjahr( ls_period+0(4) ).
          DATA(lv_month) = CONV monat( ls_period+4(2) ).

          CALL FUNCTION 'PERIOD_CHECK'
            EXPORTING
              i_bukrs          = iv_bukrs
              i_gjahr          = lv_year
              i_koart          = 'V'
              i_konto          = ''
              i_monat          = lv_month
            EXCEPTIONS
              error_period     = 1
              error_period_acc = 2
              OTHERS           = 3.

          IF sy-subrc <> 0.
            rv_result = abap_false.
            EXIT.
          ENDIF.
        ENDLOOP.
    ENDCASE.
  ENDMETHOD.

  METHOD get_posting_periods.
    SELECT DISTINCT budat
      FROM @it_claim_docs AS d
      INTO TABLE @rt_post_periods.

    SELECT DISTINCT augdt AS budat
      FROM @it_claim_docs AS d
      APPENDING TABLE @rt_post_periods.

    SORT rt_post_periods BY budat.
    DELETE ADJACENT DUPLICATES FROM rt_post_periods COMPARING budat.
    DELETE rt_post_periods WHERE budat = '00000000'.
  ENDMETHOD.

  METHOD prepare_reversal_docs.
    SELECT DISTINCT augbl AS opbel,
                   augdt AS budat,
                   'X' AS is_clearingdoc
      FROM @it_claim_docs AS d
      WHERE augbl <> ''
      INTO CORRESPONDING FIELDS OF TABLE @rt_reversals.

    SELECT DISTINCT opbel,
                   budat
      FROM @it_claim_docs AS d
      APPENDING CORRESPONDING FIELDS OF TABLE @rt_reversals.

    LOOP AT rt_reversals ASSIGNING FIELD-SYMBOL(<fs_reversal>).
      <fs_reversal>-uuid = iv_uuid.
      <fs_reversal>-crdat = sy-datum.
      <fs_reversal>-crtime = sy-uzeit.
    ENDLOOP.
  ENDMETHOD.

  METHOD fica_payload_recreator.


    DATA: ls_fica_create TYPE zstficamany.


    " Get the Documents details
    SELECT item~* FROM
    dfkkop AS item
    INNER JOIN @it_docs_to_recreate AS base
    ON item~opbel = base~opbel
    WHERE opupz = 0
    INTO TABLE @DATA(lt_items).

    SELECT header~* FROM
    dfkkko AS header
    INNER JOIN @it_docs_to_recreate AS base
    ON header~opbel = base~opbel
    INTO TABLE @DATA(lt_headers).

    DATA: rt_bukrs            TYPE RANGE OF bukrs,
          rt_spart            TYPE RANGE OF spart,
          rt_main_transaction TYPE RANGE OF hvorg_kk.

    rt_bukrs = VALUE #( FOR <fs_line> IN lt_items sign = zcl_clearingapp_services=>ac_sign_i
                                                    option =  zcl_clearingapp_services=>ac_option_eq
                                                   ( low = <fs_line>-bukrs ) ).

    rt_spart = VALUE #( FOR <fs_line> IN lt_items sign = zcl_clearingapp_services=>ac_sign_i
                                                    option =  zcl_clearingapp_services=>ac_option_eq
                                                   ( low = <fs_line>-spart ) ).


    rt_main_transaction = VALUE #( FOR <fs_line> IN lt_items sign = zcl_clearingapp_services=>ac_sign_i
                                                    option =  zcl_clearingapp_services=>ac_option_eq
                                                   ( low = <fs_line>-hvorg ) ).



    " Get GL Accounts from table
    SELECT *
*    fun01, "g_l_account
*    BUBER, "posting_area,
*    KEY01," company_code,
*    KEY02, "division,
*    KEY04, "main_transaction,
*    KEY05 "sub_transaction
      FROM tfk033d
      WHERE applk = 'S'
        AND buber IN ( 'S000', 'S001' )
        AND ktopl = 'ELSC'
        AND key01 IN @rt_bukrs
        AND key02 IN @rt_spart
        AND key03 = 'Y1'
        AND key04 IN @rt_main_transaction
   INTO TABLE @at_gl_accounts.
    IF at_gl_accounts IS INITIAL.
      RAISE gl_account_not_found.
    ENDIF.


    DATA(lv_document_count_no) = lines( ct_fica_create ).



    LOOP AT lt_headers ASSIGNING FIELD-SYMBOL(<fs_header>).

      CLEAR: ls_fica_create.

      lv_document_count_no = lv_document_count_no + 1.
      ls_fica_create-item = lv_document_count_no. "DM,SC,RC,CR,SM,RM, RD, SD, CC & CL
      ls_fica_create-recon_key_prefix = COND #( WHEN <fs_header>-blart EQ 'DM' THEN ac_fikey_dm
                                                WHEN  <fs_header>-blart EQ 'SC' THEN ac_fikey_sc
                                                WHEN  <fs_header>-blart EQ 'RC' THEN ac_fikey_rc
                                                WHEN  <fs_header>-blart EQ 'CR' THEN ac_fikey_cr
                                                WHEN  <fs_header>-blart EQ 'SM' THEN ac_fikey_sm
                                                WHEN  <fs_header>-blart EQ 'RM' THEN ac_fikey_rm
                                                WHEN  <fs_header>-blart EQ 'RD' THEN ac_fikey_rd
                                                WHEN  <fs_header>-blart EQ 'SD' THEN ac_fikey_sd
                                                WHEN  <fs_header>-blart EQ 'CC' THEN ac_fikey_cc
                                                WHEN  <fs_header>-blart EQ 'CL' THEN ac_fikey_cl
                                                 ).

      SELECT * FROM
         @lt_items  AS i
         WHERE opbel EQ @<fs_header>-opbel
         INTO TABLE @DATA(lt_current_items).

      ls_fica_create-fica_header = VALUE #( appl_area = 'S' doc_type = <fs_header>-blart  doc_source_key = '01' currency = lt_current_items[ 1 ]-waers
      doc_date = sy-datum post_date = sy-datum  ).

      " For GL Items, Add Amount in Opposite Sign
      ls_fica_create-fica_ledger = VALUE #(
      FOR <fs_line_l> IN lt_current_items INDEX INTO lv_index ( item = lv_index comp_code = <fs_line_l>-bukrs
                                                        g_l_acct = VALUE #( at_gl_accounts[ key01 = <fs_line_l>-bukrs
                                                                                   key02 = <fs_line_l>-spart
                                                                                   key04 = <fs_line_l>-hvorg
                                                                                   key05 = <fs_line_l>-tvorg ]-fun01 DEFAULT '0' )
                                                        profit_ctr = <fs_line_l>-prctr amount = -1 * <fs_line_l>-betrw )
        ).

      IF line_exists( ls_fica_create-fica_ledger[ g_l_acct = '0' ] ).
        RAISE gl_account_not_found.
      ENDIF.

*    fun01, "g_l_account
*    BUBER, "posting_area,
*    KEY01," company_code,
*    KEY02, "division,
*    KEY04, "main_transaction,
*    KEY05 "sub_transaction

      " For BP Items, add Amount with Same Sign in FICA
      ls_fica_create-fica_partner_pos = VALUE #(
      FOR <fs_line_l> IN lt_current_items INDEX INTO lv_index ( item = lv_index comp_code = <fs_line_l>-bukrs
                                                        buspartner = <fs_line_l>-gpart
                                                        division = <fs_line_l>-spart
                                                        cont_acct = <fs_line_l>-vkont
                                                        pmnt_meth = <Fs_line_l>-pymet
*                                                        get_contract_account(
*                                                                      iv_gpart = <fs_line_l>-gpart
*                                                                      iv_bukrs = <fs_line_l>-bukrs
*                                                                    )
                                                        main_trans = <fs_line_l>-hvorg "'C100' ">>>>>>>>>>Check Logic
                                                        sub_trans = <fs_line_l>-tvorg "'2010' ">>>>>>>>>>Check Logic
                                                        g_l_acct = <fs_line_l>-hkont
                                                        doc_date = sy-datum
                                                        post_date = sy-datum
                                                        net_date = sy-datum
                                                        amount =   <fs_line_l>-betrw
                                                        profit_ctr = <fs_line_l>-prctr
                                                        tran_rate = iv_new_roe
                                                        )
        ).

      IF line_exists( ls_fica_create-fica_partner_pos[ cont_acct = '0' ] ).
        RAISE contract_account_not_found.
      ENDIF.


      " Extension Items
      ls_fica_create-it_dfkkop   = VALUE #(  FOR <fs_line_l> IN lt_current_items
                                        ( CORRESPONDING #( <fs_line_l> EXCEPT doc_no yyext_roe  ) )  ).
      LOOP AT ls_fica_create-it_dfkkop ASSIGNING FIELD-SYMBOL(<fs_dfkkop>).
        <fs_dfkkop>-item = sy-tabix.
        <fs_dfkkop>-yyext_roe = iv_new_roe.
      ENDLOOP.

      " Extension Header
      ls_fica_create-is_dfkkko = CORRESPONDING #( <fs_header> EXCEPT doc_no  ).

      APPEND ls_fica_create TO ct_fica_create.


    ENDLOOP.

  ENDMETHOD.

  METHOD get_contract_account.

    " Initially check if the contract account for the same company code and BP is stored
    IF as_contract_account_bp_bukrs-bukrs EQ iv_bukrs AND as_contract_account_bp_bukrs-gpart EQ iv_gpart.
      rv_contract_account = as_contract_account_bp_bukrs-vkont.
      RETURN.
    ENDIF.


    SELECT gpart,
       vkont FROM
    fkkvkp
    INTO TABLE @DATA(lt_fkkvkp)
    WHERE gpart EQ @iv_gpart
    AND stdbk EQ @iv_bukrs.
    IF lt_fkkvkp IS NOT INITIAL.
      SELECT a~vkont,
         a~vktyp FROM
      fkkvk AS a
      INNER JOIN @lt_fkkvkp AS b
      ON a~vkont = b~vkont
      INTO TABLE @DATA(lt_contract_accounts).
      TRY.
          " Find contract type with second letter '5'
          rv_contract_account = VALUE #(
            " First try: Find entry where second letter is '5'
            lt_contract_accounts[ vktyp+1(1) = '5' ]-vkont
            " Second try: Take first entry if no '5' found
            DEFAULT lt_contract_accounts[ 1 ]-vkont
          ).
          as_contract_account_bp_bukrs = VALUE #( vkont = rv_contract_account bukrs = iv_bukrs gpart = iv_gpart ).
        CATCH cx_root.
          rv_contract_account = '0'.
      ENDTRY.
    ELSE.
      rv_contract_account = '0'.
    ENDIF.

  ENDMETHOD.


  METHOD simulate_fica_creation.

    DATA: lv_documentnumber TYPE opbel_kk,
          ls_bapireturn     TYPE bapiret2.


    LOOP AT it_fica_create INTO DATA(ls_fica_create).

      CLEAR: lv_documentnumber, ls_bapireturn.

      DATA(ls_fica_create_w_extension) = CORRESPONDING ty_fica_create_w_extension( ls_fica_create  ).

      " Get reconciliation key
      DATA(lv_recon_key_prefix) = zcl_clearingapp_services=>get_reconciliation_key(
                                    iv_key    = ls_fica_create-recon_key_prefix
                                  ).

      " Serialize document extensions
      CALL FUNCTION 'ZF_CTRAC_EXT_SERIALIZE'
        EXPORTING
          is_dfkkko    = ls_fica_create-is_dfkkko
          it_dfkkop    = ls_fica_create-it_dfkkop
          it_dfkkopk   = ls_fica_create-it_dfkkopk
        IMPORTING
          et_extension = ls_fica_create_w_extension-it_extension.

      ls_fica_create_w_extension-fica_header-fikey = lv_recon_key_prefix .

      " Create FICA document in test mode
      CALL FUNCTION 'BAPI_CTRACDOCUMENT_CREATE'
        EXPORTING
          testrun                       = abap_true
          documentheader                = ls_fica_create_w_extension-fica_header
          completedocument              = ''
          net_receivables               = ''
          aggregate_for_tax_calculation = ''
          numberrange_group             = '000'
          check_amt_tolerance           = ''
          calculate_tax_from_gl         = ''
          complete_co_data              = ''
        IMPORTING
          documentnumber                = lv_documentnumber
          return                        = ls_bapireturn
        TABLES
          partnerpositions              = ls_fica_create_w_extension-fica_partner_pos
          genledgerpositions            = ls_fica_create_w_extension-fica_ledger
          extensionin                   = ls_fica_create_w_extension-it_extension.

      " Process return message
      DATA(ls_return) = CORRESPONDING zstficamanyret(  ls_bapireturn ).
      ls_return-item =  ls_fica_create_w_extension-item.
      IF ls_bapireturn-type EQ zcl_clearingapp_services=>ac_message_type_error.
        ls_return-message_type = zcl_clearingapp_services=>ac_message_type_error.
        DATA(lv_is_failed) = abap_true.
      ELSE.
        ls_return-message_type = zcl_clearingapp_services=>ac_message_type_success.
        ls_return-message = |Simulation Success|.
      ENDIF.

      APPEND: ls_return TO et_return,
              ls_fica_create_w_extension TO et_fica_create_w_extension.
    ENDLOOP.

    IF lv_is_failed EQ abap_false.
      ev_is_success = abap_true.
    ENDIF.

  ENDMETHOD.

  METHOD create_fica_documents.
    "! Creates FICA documents in production using simulated data
    "! @parameter it_fica_create_w_extension | Prepared FICA documents from simulation
    "! @parameter et_return | Return messages with document numbers
    "! @parameter ev_is_success | True if all documents processed successfully

    DATA: lv_documentnumber TYPE opbel_kk,
          ls_bapireturn     TYPE bapiret2.

    LOOP AT it_fica_create_w_extension INTO DATA(ls_fica_create_w_extension).
      CLEAR: lv_documentnumber, ls_bapireturn.

      " Create FICA document in production mode using prepared data
      CALL FUNCTION 'BAPI_CTRACDOCUMENT_CREATE'
        EXPORTING
          testrun            = abap_false
          documentheader     = ls_fica_create_w_extension-fica_header
          numberrange_group  = '000'
        IMPORTING
          documentnumber     = lv_documentnumber
          return             = ls_bapireturn
        TABLES
          partnerpositions   = ls_fica_create_w_extension-fica_partner_pos
          genledgerpositions = ls_fica_create_w_extension-fica_ledger
          extensionin        = ls_fica_create_w_extension-it_extension.

      " Prepare return message
      DATA(ls_return) = VALUE zstficamanyret(
        document_number = lv_documentnumber
        item           = ls_fica_create_w_extension-item
        id            = ls_bapireturn-id
        number        = ls_bapireturn-number
        message       = ls_bapireturn-message ).

      " Process return based on BAPI result
      IF ls_bapireturn-type EQ zcl_clearingapp_services=>ac_message_type_error.
        ls_return-message_type = zcl_clearingapp_services=>ac_message_type_error.
        DATA(lv_is_failed) = abap_true.

        " Roll-back transaction for this document
        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      ELSE.
        ls_return-message_type = zcl_clearingapp_services=>ac_message_type_success.
        ls_return-message = |Document { lv_documentnumber } created successfully|.

        " Commit transaction for successful document
        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
          EXPORTING
            wait = abap_true.
      ENDIF.

      APPEND ls_return TO et_return.
    ENDLOOP.

    " Set overall success flag
    IF lv_is_failed EQ abap_false.
      ev_is_success = abap_true.
    ENDIF.

  ENDMETHOD.

  METHOD reverse_on_roe_update.

    " Get the documents to be reversed
    SELECT * FROM zclm_reversaldoc
        INTO TABLE @at_docs_tobe_reversed_onroeupd
        WHERE uuid = @iv_uuid
        AND is_reversed EQ @abap_false
        ORDER BY is_clearingdoc DESCENDING.
    IF sy-subrc NE 0.
      RAISE no_reversal_docs_found.
    ENDIF.


    " First Reverse Clearing Documents
    LOOP AT at_docs_tobe_reversed_onroeupd INTO DATA(ls_docs).

      reverse_document( EXPORTING
            is_docs_tobe_reversed = CORRESPONDING #( ls_docs )
            IMPORTING
            ev_success = DATA(lv_success)
            ev_return = DATA(lv_return) ).
      IF lv_success EQ abap_true.
        " Update Success flag in DB
        ls_docs-is_reversed = abap_true.
        MODIFY zclm_reversaldoc FROM ls_docs.
        IF sy-subrc EQ 0.
          COMMIT WORK.
        ENDIF.
      ENDIF.
      APPEND lv_return TO et_return.

    ENDLOOP.



  ENDMETHOD.

  METHOD process_roe_update_step.
    CLEAR: ev_status, et_return.

    CASE iv_step.
      WHEN 1.
        roe_upd_check_step1_reversal(
          EXPORTING
            iv_uuid        = iv_uuid
            iv_ucr         = iv_ucr
            iv_elsclaimnum = iv_elsclaimnum
            iv_tr_id       = iv_tr_id
          IMPORTING
            ev_status      = ev_status
            et_return      = et_return ).

      WHEN 2.
        roe_upd_exe_step2_recreation(
          EXPORTING
            iv_uuid        = iv_uuid
            iv_new_roe     = iv_new_roe
            it_fica_create = it_fica_create
          IMPORTING
            ev_status      = ev_status
            et_return      = et_return ).

      WHEN 3.
        roe_upd_execute_step3_reversal(
          EXPORTING
            iv_uuid    = iv_uuid
          IMPORTING
            ev_status  = ev_status
            et_return  = et_return ).

      WHEN 4.
        roe_upd_execute_step4_clearing(
          EXPORTING
            it_claimfund_input = it_claimfund_input
          IMPORTING
            ev_status          = ev_status
            et_return          = et_return ).
    ENDCASE.

    " Set next step if current step was successful
    IF ev_status = zcl_clearingapp_services=>ac_char_success.
      ev_next_step = iv_step + 1.
    ENDIF.

  ENDMETHOD.

  METHOD roe_upd_check_step1_reversal.
    DATA: lt_reversal_response TYPE tt_response.

    " Check if reversal is possible
    reversal_on_roe_update_check(
      EXPORTING
        iv_uuid            = iv_uuid
        iv_ucr            = iv_ucr
        iv_elsclaimnum    = iv_elsclaimnum
        iv_tr_id          = iv_tr_id
      IMPORTING
        et_return         = lt_reversal_response
        ev_is_checkpassed = DATA(lv_is_reversalcheckpassed)
    ).

    IF lv_is_reversalcheckpassed IS INITIAL.
      ev_status = zcl_clearingapp_services=>ac_char_failed.
      et_return = CORRESPONDING #( lt_reversal_response MAPPING type = message_type ).
    ELSE.
      ev_status = zcl_clearingapp_services=>ac_char_success.
    ENDIF.
  ENDMETHOD.

  METHOD roe_upd_exe_step2_recreation.
    " Get documents to recreate
    SELECT * FROM zclm_reversaldoc
      INTO TABLE @DATA(lt_docs_to_recreate)
      WHERE uuid = @iv_uuid.

    IF sy-subrc NE 0.
      ev_status = zcl_clearingapp_services=>ac_char_failed.
      APPEND VALUE #( message = |No Reversal Documents Found for UUID { iv_uuid }| )
        TO et_return.
      RETURN.
    ENDIF.

    DATA(lt_fica_create) = it_fica_create.
    IF lt_fica_create IS NOT INITIAL.
      " CL Documents are available, now fill missing details.
      " To Be Implemented

    ENDIF.

    " Create new documents
    fica_payload_recreator(
      EXPORTING
        it_docs_to_recreate = CORRESPONDING #( lt_docs_to_recreate ) "VALUE #( ( opbel = '800000073912' ) )
        iv_new_roe         = iv_new_roe
      CHANGING
        ct_fica_create     = lt_fica_create
      EXCEPTIONS
       contract_account_not_found = 1
        gl_account_not_found       = 2
        OTHERS                     = 3 ).

    IF sy-subrc <> 0.
      DATA(lv_subrc) = sy-subrc.
      ev_status = zcl_clearingapp_services=>ac_char_failed.
      APPEND VALUE #( message = SWITCH #( lv_subrc  WHEN 1 THEN |Contract Account Not Found| WHEN 2 THEN |GL Account Not Found|  )  ) TO et_return.
      RETURN.
    ENDIF.

    " First simulate
    simulate_fica_creation(
      EXPORTING
        it_fica_create             = lt_fica_create
      IMPORTING
        et_fica_create_w_extension = DATA(lt_fica_create_w_extension)
        et_return                  = DATA(lt_sim_return)
        ev_is_success              = DATA(lv_is_success)
    ).

    IF lv_is_success = abap_false.
      ev_status = zcl_clearingapp_services=>ac_char_failed.
      APPEND LINES OF lt_sim_return TO et_return.
      RETURN.
    ENDIF.

    " Then create
    create_fica_documents(
      EXPORTING
        it_fica_create_w_extension = lt_fica_create_w_extension
      IMPORTING
        et_return                  = DATA(lt_create_return)
        ev_is_success              = lv_is_success
    ).

    IF lv_is_success = abap_false.
      ev_status = zcl_clearingapp_services=>ac_char_failed.
      APPEND VALUE #( message =  |FICA Re-Create Failed in Production Mode|  ) TO et_return.
      APPEND LINES OF lt_create_return TO et_return.
    ELSE.
      ev_status = zcl_clearingapp_services=>ac_char_success.
      APPEND LINES OF lt_create_return TO et_return.
    ENDIF.
  ENDMETHOD.

  METHOD roe_upd_execute_step3_reversal.

    " Perform Older Documents Reversal
    reverse_on_roe_update(
      EXPORTING
        iv_uuid   = iv_uuid
      IMPORTING
        et_return = DATA(lt_reverse_return)
      EXCEPTIONS
       no_reversal_docs_found = 1
        OTHERS                 = 2 ).

    IF sy-subrc <> 0 OR line_exists( lt_reverse_return[ message_type = zcl_clearingapp_services=>ac_message_type_error   ] ).
      ev_status = zcl_clearingapp_services=>ac_char_failed.
      APPEND VALUE #( message = 'Document reversal failed' ) TO et_return.
    ELSE.
      ev_status = zcl_clearingapp_services=>ac_char_success.
    ENDIF.
    et_return = VALUE #( FOR <fs_line> IN lt_reverse_return ( message = |{ <fs_line>-opbel } -  { <fs_line>-message }|
                            type = <fs_line>-message_type )
                                                             ).
  ENDMETHOD.

  METHOD roe_upd_execute_step4_clearing.
    DATA:     lt_clearing_return TYPE  bapireturn_t.

    DATA(lt_claimfund_input) = it_claimfund_input.

    CALL FUNCTION 'ZF_CLAIM_FUND_OFFSET_CLEARING'
      IMPORTING
        e_status           = ev_status
        e_return           = lt_clearing_return
      CHANGING
        ct_claimfund_input = lt_claimfund_input.

    IF ev_status = zcl_clearingapp_services=>ac_char_failed.
      APPEND LINES OF lt_clearing_return TO et_return.
      APPEND VALUE #( message = 'Clearing process failed' ) TO et_return.
    ELSE.
      ev_status = zcl_clearingapp_services=>ac_char_success.
      APPEND LINES OF lt_clearing_return TO et_return.
    ENDIF.
  ENDMETHOD.


ENDCLASS.