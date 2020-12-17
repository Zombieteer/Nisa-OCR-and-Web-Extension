InboxSDK.load(2, "sdk_NesaDocLock_70621e1bb4").then(function (sdk) {
  var sender;
  // the SDK has been loaded, now do something with it!

  sdk.Toolbars.registerThreadButton({
    title: "Encrypt File",
    iconUrl: chrome.runtime.getURL("logos/logo_128.png"),
    iconClass: "nesa-btn",
    // positions: ['THREAD'],
    listSection: sdk.Toolbars.SectionNames.OTHER,
    onClick: function (event) {
      sdk.Conversations.registerMessageViewHandler((messageView) => {
        sender = messageView.getSender();
        let attachment =
          messageView.getFileAttachmentCardViews()[0] &&
          messageView.getFileAttachmentCardViews()[0]
            ._attachmentCardImplementation &&
          messageView.getFileAttachmentCardViews()[0]
            ._attachmentCardImplementation._element
            ? messageView.getFileAttachmentCardViews()[0]
                ._attachmentCardImplementation._element
            : [];
        console.log(sender, attachment);
      });

      // sdk.Conversations.registerThreadViewHandler((threadView) => {
      //   var tytul=threadView.getSubject();
      //   var contact=threadView.getContacts();
      //   console.log(tytul, contact, sender)
      //   const el = document.createElement("div");
      //   setInterval(() => {
      //     if (sender){
      //       // Do something with the sender information
      //       el.innerHTML = '<a href=fire.php?email='+ contact +'>Szukaj klienta</a>';
      //       threadView.addSidebarContentPanel({
      //         title: 'Szukaj w EU',
      //         iconUrl: chrome.runtime.getURL('monkey.png'),
      //         el
      //       });
      //     }
      //   },1000);
      // });
    },
  });
});
