sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Button",
    "sap/m/Popover",
    "sap/ui/core/HTML"
], function (Control, Button, Popover, HTML) {
    "use strict";

    return Control.extend("atom.ui.clearing.clearingapplication.customControls.FloatingChatbot", {
        metadata: {
            properties: {
                iconSrc: {type: "sap.ui.core.URI", defaultValue: "sap-icon://message-popup"},
                tokenEndpointURL: {type: "string", defaultValue: ""},
                customIconUrl: {type: "sap.ui.core.URI", defaultValue: ""}
            }
        },

        init: function () {
            this._button = new Button({
                press: this._onButtonPress.bind(this)
            });

            this._popover = new Popover({
                placement: "Top",
                showHeader: false,
                contentWidth: "300px",
                contentHeight: "400px",
                content: new HTML({
                    content: '<iframe id="chatbotFrame" style="width:100%;height:100%;border:none;"></iframe>'
                })
            });

            this._popover.attachAfterOpen(this._loadIframeContent.bind(this));
            this._popover.attachAfterOpen(this._handlePopoverOpen.bind(this));
            this._popover.attachAfterClose(this._handlePopoverClose.bind(this));
            this._updateButtonIcon();
        },

        renderer: function (oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("floating-chatbot");
            oRm.writeClasses();
            oRm.write(">");
            oRm.renderControl(oControl._button);
            oRm.write("</div>");
        },

        onAfterRendering: function() {
            this._updateButtonIcon();
            this._button.$().addClass("animated");
        },

        _onButtonPress: function (oEvent) {
            if (this._popover.isOpen()) {
                this._popover.close();
            } else {
                this._popover.openBy(this._button);
            }
        },

        _handlePopoverOpen: function () {
            this._button.$().removeClass("animated");
        },

        _handlePopoverClose: function () {
            this._button.$().addClass("animated");
        },

        setIconSrc: function(sIconSrc) {
            this.setProperty("iconSrc", sIconSrc, true);
            this._updateButtonIcon();
            return this;
        },

        setCustomIconUrl: function(sCustomIconUrl) {
            this.setProperty("customIconUrl", sCustomIconUrl, true);
            this._updateButtonIcon();
            return this;
        },

        _updateButtonIcon: function() {
            if (this._button && this._button.getDomRef()) {
                var sCustomIconUrl = this.getCustomIconUrl();
                if (sCustomIconUrl) {
                    this._button.addStyleClass("custom-icon");
                    this._button.$().css("background-image", 'url("' + sCustomIconUrl + '")');
                } else {
                    this._button.removeStyleClass("custom-icon");
                    this._button.$().css("background-image", "");
                    this._button.setIcon(this.getIconSrc());
                }
            }
        },

        setTokenEndpointURL: function(sTokenEndpointURL) {
            this.setProperty("tokenEndpointURL", sTokenEndpointURL, true);
            if (this._popover) {
                this._popover.getContent()[0].setContent(this._generateChatbotHTML());
            }
            return this;
        },

        _loadIframeContent: function() {
            var iframe = document.getElementById("chatbotFrame");
            if (iframe) {
                iframe.srcdoc = this._generateChatbotHTML();
            }
        },

        _generateChatbotHTML: function() {
            return `
                <style>
                    #chatContainer {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        overflow: hidden;
                    }
                    #banner {
                        flex: 0 0 auto;
                        background: linear-gradient(135deg, #5a00b3, #3d0077);
                        color: #ffffff;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        font-size: 16px;
                        padding: 10px 0;
                        text-align: center;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    #webchatContainer {
                        flex: 1 1 auto;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    #webchat {
                        flex: 1 1 auto;
                        overflow: hidden;
                    }
                    .webchat__basic-transcript {
                        height: 100%;
                        overflow-y: auto;
                    }
                </style>
                <div id="chatContainer">
                    <div id="banner">
                        <h3 style="margin: 0;">Clearing Application Bot</h3>
                    </div>
                    <div id="webchatContainer">
                        <div id="webchat" role="main"></div>
                    </div>
                </div>
                <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
                <script>
                (async function () {
                    const styleOptions = {
                        accent: '#007bff',
                        botAvatarBackgroundColor: '#FFFFFF',
                        botAvatarImage: 'https://learn.microsoft.com/azure/bot-service/v4sdk/media/logo_bot.svg',
                        botAvatarInitials: 'BT',
                        userAvatarImage: 'https://avatars.githubusercontent.com/u/661465',
                        hideUploadButton: true,
                        bubbleBackground: '#F0F0F0',
                        bubbleBorderRadius: 18,
                        bubbleFromUserBackground: '#E6F2FF',
                        bubbleFromUserBorderRadius: 18,
                        sendBoxBackground: '#F8F8F8',
                        sendBoxButtonColor: '#007bff',
                        sendBoxBorderTop: '1px solid #E0E0E0',
                        sendBoxTextWrap: true,
                        transcriptOverlayButtonBackground: 'rgba(0, 0, 0, .6)',
                        transcriptOverlayButtonBackgroundOnFocus: 'rgba(0, 0, 0, .8)',
                        transcriptOverlayButtonBackgroundOnHover: 'rgba(0, 0, 0, .8)',
                        transcriptOverlayButtonColor: 'White',
                        transcriptOverlayButtonColorOnFocus: 'White',
                        transcriptOverlayButtonColorOnHover: 'White',
                        rootHeight: '100%',
                        rootWidth: '100%'
                    };

                    const tokenEndpointURL = new URL('${this.getTokenEndpointURL()}');
                    const locale = document.documentElement.lang || 'en';
                    const apiVersion = tokenEndpointURL.searchParams.get('api-version');

                    const [directLineURL, token] = await Promise.all([
                        fetch(new URL(\`/powervirtualagents/regionalchannelsettings?api-version=\${apiVersion}\`, tokenEndpointURL))
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to retrieve regional channel settings.');
                                }
                                return response.json();
                            })
                            .then(({ channelUrlsById: { directline } }) => directline),
                        fetch(tokenEndpointURL)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to retrieve Direct Line token.');
                                }
                                return response.json();
                            })
                            .then(({ token }) => token)
                    ]);

                    const directLine = WebChat.createDirectLine({ domain: new URL('v3/directline', directLineURL), token });

                    const subscription = directLine.connectionStatus$.subscribe({
                        next(value) {
                            if (value === 2) {
                                directLine
                                    .postActivity({
                                        localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                        locale,
                                        name: 'startConversation',
                                        type: 'event'
                                    })
                                    .subscribe();
                                subscription.unsubscribe();
                            }
                        }
                    });

                    WebChat.renderWebChat({ directLine, locale, styleOptions }, document.getElementById('webchat'));
                })();
                </script>
            `;
        }
    });
});