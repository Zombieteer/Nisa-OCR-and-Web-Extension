InboxSDK.load(2, "sdk_NesaDocLock_70621e1bb4").then(function (sdk) {
  // the SDK has been loaded, now do something with it!
  sdk.Toolbars.registerThreadButton({
    title: "Encrypt File",
    iconUrl: chrome.runtime.getURL("logos/logo_128.png"),
    iconClass: "nesa-btn",
    positions: ["THREAD"],
    listSection: sdk.Toolbars.SectionNames.OTHER,
    onClick: (event) => btnClickHandler(event, sdk),
  });
});

const btnClickHandler = async (event, sdk) => {
  let sender, loggedInUser, attachment;
  if (event.position === "THREAD") {
    loggedInUser = await sdk.User.getEmailAddress();
    await sdk.Conversations.registerMessageViewHandler(async (messageView) => {
      sender = messageView.getSender();
      attachment =
        messageView.getFileAttachmentCardViews()[0] &&
        messageView.getFileAttachmentCardViews()[0]
          ._attachmentCardImplementation &&
        messageView.getFileAttachmentCardViews()[0]
          ._attachmentCardImplementation._element
          ? messageView.getFileAttachmentCardViews()[0]
              ._attachmentCardImplementation._element
          : [];
    });
    console.log(sender, loggedInUser, attachment);
  }
};
